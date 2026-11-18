---
title: Update supplier
description: Update editable fields of a supplier record.
---

# Update supplier

Updates a supplier. Only the fields you send are changed.

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
| `X-Company` | string | No | UUID of the company context. The `company` query parameter is accepted as an alternative, and the header can be omitted when the organization has a single company. Routes addressed by UUID resolve the company from the record |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Supplier name. Cannot be empty |
| `cif` | string \| null | Tax identification number |
| `vatCode` | string \| null | Full VAT code with country prefix |
| `isVatPayer` | boolean | Whether the supplier is registered for VAT |
| `registrationNumber` | string | Trade register number. Cannot be empty |
| `address` | string | Street address. Cannot be empty |
| `city` | string | City. Cannot be empty |
| `county` | string | County. Cannot be empty |
| `country` | string | Country code. Cannot be empty |
| `postalCode` | string \| null | Postal code |
| `email` | string \| null | Email address |
| `phone` | string \| null | Phone number |
| `bankName` | string \| null | Bank name |
| `bankAccount` | string \| null | Bank account (IBAN) |
| `notes` | string \| null | Internal notes |
| `affiliated` | boolean | Affiliated party flag |

## Response

Returns `{"supplier": {...}}` with the updated supplier, in the same shape as [Get supplier](/api-reference/suppliers/get).

## Example Request

```bash
curl -X PATCH 'https://api.storno.ro/api/v1/suppliers/c3d4e5f6-a7b8-9012-cdef-123456789012' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "facturi@energie.example",
    "phone": "+40210000001",
    "notes": "Contact preferat: email"
  }'
```

## Example Response

```json
{
  "supplier": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "Energie Exemplu SA",
    "cif": "12345678",
    "email": "facturi@energie.example",
    "phone": "+40210000001",
    "notes": "Contact preferat: email",
    "...": "..."
  }
}
```

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Supplier not found |
| 422 | A field that cannot be empty was sent empty |

Error responses have the form `{"error": "message"}`.

## Related Endpoints

- [Get supplier](/api-reference/suppliers/get)
- [Delete supplier](/api-reference/suppliers/delete)
- [List suppliers](/api-reference/suppliers/list)
