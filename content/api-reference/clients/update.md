---
title: Update client
description: Update an existing client's details
---

# Update client

Updates an existing client. All fields are optional — only include the fields you want to change.

When identity or VAT-related fields are updated (`name`, `cui`, `cnp`, `vatCode`, `isVatPayer`, `country`), the changes are automatically propagated to all **editable invoices from the current month**. This updates the receiver name and CIF on those invoices and reapplies VAT rules (reverse charge / OSS). Past months' invoices are not affected.

When `vatCode` or `country` is changed, the system also re-validates the VAT number against the EU VIES system for foreign EU clients.

```http
PATCH /api/v1/clients/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the client |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

### Request body

| Name | Type | Description |
|------|------|-------------|
| `name` | string | Company name or individual full name |
| `type` | string | Client type: `company` or `individual` |
| `cui` | string | CUI (tax identification number) |
| `cnp` | string | CNP (personal identification number) |
| `vatCode` | string | Full VAT code with country prefix |
| `isVatPayer` | boolean | Whether the client is registered for VAT |
| `registrationNumber` | string | Company registration number |
| `address` | string | Street address |
| `city` | string | City name |
| `county` | string | County |
| `country` | string | ISO 3166-1 alpha-2 country code |
| `postalCode` | string | Postal/ZIP code |
| `email` | string | Email address |
| `phone` | string | Phone number |
| `bankName` | string | Bank name |
| `bankAccount` | string | Bank account number (IBAN) |
| `defaultPaymentTermDays` | integer | Default payment term in days |
| `contactPerson` | string | Contact person name |
| `notes` | string | Internal notes |
| `idNumber` | string | Client identification number (personal ID, passport, etc.) |
| `currency` | string | Preferred currency for this client (ISO 4217: EUR, USD, RON, etc.) |

## Example Request

```bash
curl -X PATCH 'https://api.storno.ro/api/v1/clients/b2c3d4e5-f6a7-8901-bcde-f12345678901' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "vatCode": "DE812526315",
    "isVatPayer": true,
    "country": "DE"
  }'
```

## Response

Returns the updated client object along with the number of invoices that were automatically updated.

```json
{
  "client": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "type": "company",
    "name": "Example GmbH",
    "vatCode": "DE812526315",
    "isVatPayer": true,
    "country": "DE",
    "viesValid": true,
    "viesValidatedAt": "2026-03-02T12:00:00+02:00",
    "viesName": "EXAMPLE GMBH",
    ...
  },
  "invoicesUpdated": 3
}
```

### Invoice propagation

The `invoicesUpdated` field indicates how many invoices were automatically updated. Propagation only affects invoices that are:

- **Editable** — not cancelled, not sent to ANAF provider, and either draft, rejected, or issued but not yet uploaded to ANAF
- **Current month** — `issueDate` is in the current calendar month (past months are considered fiscally closed)

For each affected invoice, the system:
1. Updates `receiverName` and `receiverCif` from the new client data
2. Reapplies reverse charge / OSS VAT rules on invoice lines
3. Recalculates invoice totals
4. Invalidates cached XML (will be regenerated on next PDF/XML request)

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Client not found |
| 422 | Validation error (empty required fields, missing registration number for RO companies) |

## Related Endpoints

- [Get client](/api-reference/clients/get)
- [VIES lookup](/api-reference/clients/vies-lookup)
- [Update invoice](/api-reference/invoices/update)
