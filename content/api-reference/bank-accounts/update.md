---
title: Update bank account
description: Update an existing bank account.
---

# Update bank account

Updates an existing bank account for the authenticated company.

```http
PATCH /api/v1/bank-accounts/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the bank account |

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
| `iban` | string | International Bank Account Number |
| `bankName` | string \| null | Name of the bank |
| `currency` | string | Currency code (ISO 4217) |
| `isDefault` | boolean | Set as default account for this currency |

## Response

Returns the updated bank account object.

## Example Request

```bash
curl -X PATCH 'https://api.storno.ro/api/v1/bank-accounts/bank-account-uuid-1' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "bankName": "Banca Comercială Română",
    "isDefault": true
  }'
```

## Example Response

```json
{
  "uuid": "bank-account-uuid-1",
  "iban": "RO49AAAA1B31007593840000",
  "bankName": "Banca Comercială Română",
  "currency": "RON",
  "isDefault": true,
  "createdAt": "2025-06-01T10:00:00Z",
  "updatedAt": "2026-02-16T15:45:00Z"
}
```

## Default Account Behavior

- If `isDefault` is set to `true`, any existing default account for that currency will be set to non-default
- Each currency can only have one default account
- Setting `isDefault` to `false` on a default account requires another account to be set as default first

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Bank account not found or doesn't belong to company |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- No fields provided for update
- Invalid IBAN format
- IBAN already exists for another account in this company
- Invalid currency code
- Cannot unset default without setting another account as default

## Related Endpoints

- [List bank accounts](/api-reference/bank-accounts/list)
- [Create bank account](/api-reference/bank-accounts/create)
- [Delete bank account](/api-reference/bank-accounts/delete)
