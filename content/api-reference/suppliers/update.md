---
title: Update supplier
description: Update editable fields of a supplier record.
---

# Update supplier

Updates editable fields of a supplier record. Core supplier data (name, CUI) from ANAF cannot be modified, but contact information and notes can be updated.

```http
PATCH /api/v1/suppliers/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the supplier |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

All parameters are optional, but at least one must be provided.

| Parameter | Type | Description |
|-----------|------|-------------|
| `email` | string \| null | Email address |
| `phone` | string \| null | Phone number |
| `address` | string \| null | Street address |
| `city` | string \| null | City |
| `county` | string \| null | County |
| `country` | string | Country code (ISO 3166-1 alpha-2) |
| `postalCode` | string \| null | Postal code |
| `bankName` | string \| null | Bank name |
| `bankAccount` | string \| null | Bank account (IBAN) |
| `notes` | string \| null | Internal notes |

## Response

Returns the updated supplier object.

## Example Request

```bash
curl -X PATCH 'https://api.storno.ro/api/v1/suppliers/supplier-uuid-1' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "relatii.clienti.bucuresti@enel.ro",
    "phone": "+40214029701",
    "notes": "Furnizor energie electrică - plată lunar prin debit direct. Contact preferential: email"
  }'
```

## Example Response

```json
{
  "uuid": "supplier-uuid-1",
  "name": "Enel Energie Muntenia SA",
  "cui": "RO13267221",
  "email": "relatii.clienti.bucuresti@enel.ro",
  "phone": "+40214029701",
  "address": "Bd. Unirii, Nr. 74",
  "city": "București",
  "county": "București",
  "country": "RO",
  "postalCode": "030823",
  "bankName": "Banca Transilvania",
  "bankAccount": "RO49BTRL01304402S0390901",
  "notes": "Furnizor energie electrică - plată lunar prin debit direct. Contact preferential: email",
  "invoiceCount": 12,
  "totalExpenses": 4580.50,
  "createdAt": "2025-06-01T08:00:00Z",
  "updatedAt": "2026-02-16T14:20:00Z"
}
```

## Field Restrictions

### Non-Editable Fields

The following fields come from ANAF and cannot be modified via API:

- `name` - Supplier name
- `cui` - Tax identification number

These fields are automatically updated during ANAF synchronization.

### Editable Fields

The following fields can be updated:

- Contact information: `email`, `phone`
- Address details: `address`, `city`, `county`, `country`, `postalCode`
- Banking details: `bankName`, `bankAccount`
- Internal data: `notes`

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Supplier not found or doesn't belong to company |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- No fields provided for update
- Invalid email format
- Invalid country code
- Invalid IBAN format

## Important Notes

- Supplier core data (name, CUI) is sync-only from ANAF
- Use this endpoint to add or update internal contact information
- Notes field is useful for tracking payment terms, contact preferences, and account details
- Changes are immediately reflected in supplier details and reports

## Related Endpoints

- [Get supplier](/api-reference/suppliers/get)
- [Delete supplier](/api-reference/suppliers/delete)
- [List suppliers](/api-reference/suppliers/list)
