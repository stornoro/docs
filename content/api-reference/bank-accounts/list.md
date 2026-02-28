---
title: List bank accounts
description: Retrieve all bank accounts for the authenticated company.
---

# List bank accounts

Retrieves all bank accounts configured for the authenticated company.

```http
GET /api/v1/bank-accounts
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns an array of bank account objects.

### Bank Account Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `iban` | string | International Bank Account Number |
| `bankName` | string \| null | Name of the bank |
| `currency` | string | Currency code (ISO 4217, default: "RON") |
| `isDefault` | boolean | Whether this is the default account |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/bank-accounts' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
[
  {
    "uuid": "bank-account-uuid-1",
    "iban": "RO49AAAA1B31007593840000",
    "bankName": "BCR",
    "currency": "RON",
    "isDefault": true,
    "createdAt": "2025-06-01T10:00:00Z",
    "updatedAt": "2025-06-01T10:00:00Z"
  },
  {
    "uuid": "bank-account-uuid-2",
    "iban": "RO49BTRL01101205N50289XX",
    "bankName": "Banca Transilvania",
    "currency": "EUR",
    "isDefault": false,
    "createdAt": "2025-07-15T14:30:00Z",
    "updatedAt": "2025-07-15T14:30:00Z"
  }
]
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |

## Important Notes

- Each company must have at least one bank account
- Only one bank account per currency can be marked as default
- The default bank account is automatically used on new invoices
- Bank accounts are displayed on invoices and used for payment instructions

## Related Endpoints

- [Create bank account](/api-reference/bank-accounts/create)
- [Update bank account](/api-reference/bank-accounts/update)
- [Delete bank account](/api-reference/bank-accounts/delete)
