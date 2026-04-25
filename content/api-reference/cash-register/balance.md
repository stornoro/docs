---
title: Cash register balance
description: Live snapshot of the till — opening balance, cash in/out since opening, and current balance.
---

# Cash register balance

Returns a live snapshot of the company's cash drawer. The till is backed by a `BankAccount` of `type=cash`; the response folds together cash receipts, cash-collected payments on invoices, and any manual cash movements (deposits, withdrawals, miscellaneous).

```http
GET /api/v1/cash-register/balance
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `X-Company` | string | Yes | Company UUID |

## Response

### Cash account not configured

`200 OK`. Returned when no cash-type bank account exists for the company.

```json
{
  "configured": false
}
```

### Cash account exists but opening balance not set

`200 OK`. The account exists but is missing `openingBalance` / `openingBalanceDate`, so calculations can't run yet.

```json
{
  "configured": false,
  "cashAccountId": "9b21e0c0-1d1c-4f7d-8e8b-1d1c1f7d8e8b",
  "currency": "RON"
}
```

### Configured

`200 OK`. All amounts are returned as strings to preserve decimal precision.

```json
{
  "configured": true,
  "cashAccountId": "9b21e0c0-1d1c-4f7d-8e8b-1d1c1f7d8e8b",
  "currency": "RON",
  "openingBalance": "250.00",
  "openingBalanceDate": "2026-04-25",
  "cashReceipts": "1240.00",
  "cashPayments": "0.00",
  "manualNet": "-100.00",
  "currentBalance": "1390.00"
}
```

| Field | Description |
|-------|-------------|
| `cashReceipts` | Sum of cash payments on issued/non-cancelled receipts since `openingBalanceDate`. Uses the `cashPayment` column when set (split tendering); falls back to the receipt total when `paymentMethod = 'cash'` and `cashPayment` is null. |
| `cashPayments` | Sum of cash-paid payments recorded against invoices since `openingBalanceDate`. |
| `manualNet` | Net effect of manual cash movements in the same period (deposits/withdrawals/miscellaneous), positive = net cash into the till. |
| `currentBalance` | `openingBalance + cashReceipts − cashPayments + manualNet`. |

## Permissions

Requires `report.view`.

## Errors

| Status | Description |
|--------|-------------|
| 401 | Missing or invalid bearer token |
| 403 | Permission denied or missing `X-Company` |
| 404 | Company not found |
