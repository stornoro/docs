---
title: Update bank account
description: Update an existing bank account.
---

# Update bank account

Updates an existing bank account for the authenticated company. Only the fields you send are changed.

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

Requires the `settings.manage` permission.

### Body Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `bankName` | string | Name of the bank |
| `currency` | string | Currency code (ISO 4217) |
| `isDefault` | boolean | Set as the default account |
| `showOnInvoice` | boolean | Print the account on invoices. Always false for `cash` accounts |
| `openingBalance` | string \| number | Opening balance of a `cash` account. Zero or positive. Send it together with `openingBalanceDate` |
| `openingBalanceDate` | string | Date the opening balance was taken (YYYY-MM-DD) |
| `confirmReset` | boolean | Required to change the opening balance once cash transactions exist |

The account `type` and `iban` cannot be changed. `openingBalance` and `openingBalanceDate` only apply to `cash` accounts.

## Response

Returns the updated bank account object.

## Example Request

```bash
curl -X PATCH 'https://api.storno.ro/api/v1/bank-accounts/bank-account-uuid-1' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "bankName": "Example Bank",
    "isDefault": true
  }'
```

## Example Response

```json
{
  "id": "bank-account-uuid-1",
  "type": "bank",
  "iban": "RO49AAAA1B31007593840000",
  "bankName": "Example Bank",
  "currency": "RON",
  "isDefault": true,
  "showOnInvoice": true,
  "source": "manual",
  "openingBalance": null,
  "openingBalanceDate": null
}
```

## Default Account Behavior

- If `isDefault` is set to `true`, the default flag is cleared on all of the company's other accounts

## Opening balance of a cash account

The opening balance can be edited freely until cash receipts, cash payments or manual cash movements exist for the account's currency. After that, a change is rejected with `409` and the error `opening_balance_locked`, unless the request carries `confirmReset: true`. The current balance is then recomputed from the new opening point.

## Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Only one of `openingBalance` and `openingBalanceDate` sent, a negative or non-numeric balance, or an invalid date |
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found, or bank account not found in this company |
| 409 | `opening_balance_locked`: cash transactions exist and `confirmReset` was not sent |

Error bodies have the form `{"error": "message"}`. The locked-balance response is `{"error": "opening_balance_locked", "message": "..."}`.

## Related Endpoints

- [List bank accounts](/api-reference/bank-accounts/list)
- [Create bank account](/api-reference/bank-accounts/create)
- [Delete bank account](/api-reference/bank-accounts/delete)
