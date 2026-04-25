---
title: List cash movements
description: List manual cash movements (deposits, withdrawals, miscellaneous) in a date range.
---

# List cash movements

Returns the company's manual cash movements — deposits into the till, withdrawals to the safe / bank, or miscellaneous entries (e.g. covering a small expense from petty cash). Receipts and invoice payments are NOT returned here; see [`/cash-register/ledger`](/api-reference/cash-register/ledger) for the full picture.

```http
GET /api/v1/cash-register/movements?from=2026-04-01&to=2026-04-30
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `X-Company` | string | Yes | Company UUID |

## Query parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `from` | string | No | Start date (YYYY-MM-DD). Defaults to the cash account's opening date or 30 days ago. |
| `to` | string | No | End date (YYYY-MM-DD). Defaults to today. |

## Response

```json
{
  "data": [
    {
      "id": "f1d3a4...",
      "movementDate": "2026-04-26",
      "kind": "deposit",
      "direction": "out",
      "amount": "200.00",
      "currency": "RON",
      "description": "End-of-day deposit at BCR",
      "documentNumber": "DEP-042",
      "createdAt": "2026-04-26T18:14:33+03:00"
    }
  ]
}
```

If no cash account is configured, an empty `data` array is returned.

## Permissions

Requires `report.view`.
