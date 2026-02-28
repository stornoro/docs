---
title: Create bank account
description: Add a new bank account to the company.
---

# Create bank account

Creates a new bank account for the authenticated company. The IBAN must be unique within the company.

```http
POST /api/v1/bank-accounts
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `iban` | string | Yes | International Bank Account Number (must be valid IBAN format) |
| `bankName` | string | No | Name of the bank |
| `currency` | string | No | Currency code (ISO 4217, default: "RON") |
| `isDefault` | boolean | No | Set as default account for this currency (default: false) |

## Response

Returns the created bank account object with a `201 Created` status.

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/bank-accounts' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "iban": "RO49INGB0000999900000017",
    "bankName": "ING Bank",
    "currency": "RON",
    "isDefault": false
  }'
```

## Example Response

```json
{
  "uuid": "bank-account-uuid-3",
  "iban": "RO49INGB0000999900000017",
  "bankName": "ING Bank",
  "currency": "RON",
  "isDefault": false,
  "createdAt": "2026-02-16T15:30:00Z",
  "updatedAt": "2026-02-16T15:30:00Z"
}
```

## Default Account Behavior

- If `isDefault` is `true`, any existing default account for that currency will be set to non-default
- Each currency can only have one default account
- If this is the first account for a currency, it automatically becomes the default regardless of the `isDefault` value

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- Missing `iban` field
- Invalid IBAN format
- IBAN already exists for this company
- Invalid currency code

## Related Endpoints

- [List bank accounts](/api-reference/bank-accounts/list)
- [Update bank account](/api-reference/bank-accounts/update)
- [Delete bank account](/api-reference/bank-accounts/delete)
