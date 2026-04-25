---
title: Cash register ledger
description: Daily ledger of every cash entry (receipts, payments, manual movements) with running balance.
---

# Cash register ledger

Returns one bucket per day in the requested range, each containing the chronological list of cash entries (receipts, payments, manual movements) along with the opening balance, totals, and closing balance for that day. Useful for end-of-day cash reconciliation.

```http
GET /api/v1/cash-register/ledger?from=2026-04-25&to=2026-04-30
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `X-Company` | string | Yes | Company UUID |

## Query parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `from` | string | No | Start date (YYYY-MM-DD). Defaults to the cash account's `openingBalanceDate`. Clamped to ≥ opening date. |
| `to` | string | No | End date (YYYY-MM-DD). Defaults to today. Must be ≥ `from`. |

The maximum span between `from` and `to` is 366 days; larger ranges return `400 Bad Request`.

## Response

### Not configured

```json
{ "configured": false, "days": [] }
```

### Configured

```json
{
  "configured": true,
  "currency": "RON",
  "openingBalanceDate": "2026-04-25",
  "from": "2026-04-25",
  "to": "2026-04-26",
  "days": [
    {
      "date": "2026-04-25",
      "opening": "250.00",
      "totalIn": "1240.00",
      "totalOut": "0.00",
      "closing": "1490.00",
      "entries": [
        {
          "kind": "receipt",
          "documentNumber": "BON-2026-042",
          "documentType": "chitanta",
          "description": "Acme SRL",
          "in": "125.50",
          "out": "0.00",
          "balanceAfter": "375.50",
          "sourceId": "a1b2c3..."
        }
      ]
    }
  ]
}
```

### Entry shape

| Field | Description |
|-------|-------------|
| `kind` | `receipt` (POS sale), `payment` (cash collection on an invoice), or `movement` (manual deposit/withdrawal/other) |
| `documentNumber` | Receipt number, invoice number, or movement document number |
| `documentType` | `chitanta`, `plata`, `depunere`, `ridicare`, `altele` |
| `description` | Customer name (receipt), counterparty (payment), or description (movement) |
| `in` / `out` | Amount in/out of the till for this entry (mutually exclusive — the other is `"0.00"`) |
| `balanceAfter` | Running till balance after this entry |
| `sourceId` | UUID of the underlying receipt / payment / movement |
| `movementId` | (movements only) Same as `sourceId`, kept for backwards-compat |

## Permissions

Requires `report.view`.

## Errors

| Status | Description |
|--------|-------------|
| 400 | Invalid date format, `to` before `from`, or range > 366 days |
| 401 | Missing or invalid bearer token |
| 403 | Permission denied or missing `X-Company` |
| 404 | Company not found |
