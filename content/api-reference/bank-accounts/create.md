---
title: Create bank account
description: Add a new bank account to the company.
---

# Create bank account

Creates a new bank account for the authenticated company. The IBAN must be unique within the company. A company can have one cash account.

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

Requires the `settings.manage` permission.

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Account type: `bank` (default) or `cash`. A company can have at most one `cash` account; it represents the physical till that backs the POS / cash-register reports. |
| `iban` | string | Conditional | International Bank Account Number. Required for `bank` accounts; ignored for `cash` accounts. |
| `bankName` | string | No | Name of the bank |
| `currency` | string | No | Currency code (ISO 4217, default: "RON") |
| `isDefault` | boolean | No | Set as the default account (default: false). Always false for `cash` accounts. |
| `showOnInvoice` | boolean | No | Print the account on invoices (default: false). Always false for `cash` accounts. |
| `openingBalance` | string \| number | No | Starting balance of a `cash` account. Must be zero or positive. Send it together with `openingBalanceDate`. Cash-register reports need both. |
| `openingBalanceDate` | string | No | Date the opening balance was taken (YYYY-MM-DD). Required when `openingBalance` is sent. |

`openingBalance` and `openingBalanceDate` are only applied to `cash` accounts.

## Response

Returns the created bank account object with a `201 Created` status.

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/bank-accounts' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "iban": "RO49AAAA1B31007593840000",
    "bankName": "Example Bank",
    "currency": "RON",
    "isDefault": false
  }'
```

### Cash account example

```bash
curl -X POST 'https://api.storno.ro/api/v1/bank-accounts' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "cash",
    "currency": "RON",
    "openingBalance": 250.00,
    "openingBalanceDate": "2026-04-25"
  }'
```

## Example Response

```json
{
  "id": "bank-account-uuid-3",
  "type": "bank",
  "iban": "RO49AAAA1B31007593840000",
  "bankName": "Example Bank",
  "currency": "RON",
  "isDefault": false,
  "showOnInvoice": false,
  "source": "manual",
  "openingBalance": null,
  "openingBalanceDate": null
}
```

## Default Account Behavior

- If `isDefault` is `true`, the default flag is cleared on all of the company's other accounts
- The first account is not made default automatically

## Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid `type`, missing `iban` on a `bank` account, a missing `openingBalance` or `openingBalanceDate` of the pair, a negative or non-numeric `openingBalance`, or an invalid date |
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found |
| 409 | The IBAN already exists for this company, or a cash account already exists |

Error bodies have the form `{"error": "message"}`.

## Related Endpoints

- [List bank accounts](/api-reference/bank-accounts/list)
- [Update bank account](/api-reference/bank-accounts/update)
- [Delete bank account](/api-reference/bank-accounts/delete)
