---
title: List bank accounts
description: Retrieve all bank accounts for the authenticated company.
---

# List bank accounts

Retrieves all bank accounts configured for the authenticated company, including the cash account when one exists.

```http
GET /api/v1/bank-accounts
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

Requires the `settings.view` permission.

## Response

Returns an object with a `data` array of bank account objects.

### Bank Account Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `type` | string | `bank` or `cash` |
| `iban` | string \| null | International Bank Account Number. Null for cash accounts |
| `bankName` | string \| null | Name of the bank |
| `currency` | string | Currency code (ISO 4217, default: "RON") |
| `isDefault` | boolean | Whether this is the default account |
| `showOnInvoice` | boolean | Whether the account is printed on invoices |
| `openingBalance` | string \| null | Opening balance as a decimal string. Set on cash accounts |
| `openingBalanceDate` | string \| null | Date the opening balance was taken |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/bank-accounts' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": [
    {
      "id": "bank-account-uuid-1",
      "type": "bank",
      "iban": "RO49AAAA1B31007593840000",
      "bankName": "BCR",
      "currency": "RON",
      "isDefault": true,
      "showOnInvoice": true,
      "openingBalance": null,
      "openingBalanceDate": null
    },
    {
      "id": "bank-account-uuid-2",
      "type": "cash",
      "iban": null,
      "bankName": null,
      "currency": "RON",
      "isDefault": false,
      "showOnInvoice": false,
      "openingBalance": "250.00",
      "openingBalanceDate": "2026-04-25"
    }
  ]
}
```

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found |

Error bodies have the form `{"error": "message"}`.

## Important Notes

- Setting an account as default clears the default flag on the company's other accounts
- A company can have at most one cash account

## Related Endpoints

- [Create bank account](/api-reference/bank-accounts/create)
- [Update bank account](/api-reference/bank-accounts/update)
- [Delete bank account](/api-reference/bank-accounts/delete)
