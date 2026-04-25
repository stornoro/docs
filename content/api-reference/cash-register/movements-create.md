---
title: Create cash movement
description: Record a manual cash movement (deposit, withdrawal, or miscellaneous entry).
---

# Create cash movement

Records a manual entry against the company's cash drawer. Used for end-of-day deposits, withdrawals to the bank or safe, and miscellaneous events that aren't captured by receipts or invoice payments.

```http
POST /api/v1/cash-register/movements
```

A cash account (`BankAccount` with `type=cash`) must be configured for the company. The movement currency is auto-set to the cash account's currency — clients should not send it.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `X-Company` | string | Yes | Company UUID |
| `Content-Type` | string | Yes | `application/json` |

## Body parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `kind` | string | Yes | `deposit` (cash leaves the till for the bank/safe), `withdrawal` (cash put into the till), or `other` (miscellaneous; `direction` must be supplied) |
| `direction` | string | Conditional | `in` or `out`. Required only when `kind=other`; ignored otherwise (deposits are auto `out`, withdrawals auto `in`). |
| `amount` | number | Yes | Positive amount, ≥ 0.01 |
| `movementDate` | string | Yes | YYYY-MM-DD. Cannot be earlier than the cash account's `openingBalanceDate`. |
| `description` | string | No | Free-form note shown in the ledger |
| `documentNumber` | string | No | Reference number — e.g. bank slip number, expense receipt number |

## Direction semantics

| Kind | Direction | Effect on till |
|------|-----------|----------------|
| `deposit` | `out` (auto) | Till balance decreases — cash physically left the drawer |
| `withdrawal` | `in` (auto) | Till balance increases — cash was added to the drawer |
| `other` | `in` or `out` (required) | Caller decides; useful for petty-cash purchases (`out`) or unexpected cash income (`in`) |

## Example

```bash
curl -X POST 'https://api.storno.ro/api/v1/cash-register/movements' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "kind": "deposit",
    "amount": 200.00,
    "movementDate": "2026-04-26",
    "description": "End-of-day deposit at BCR",
    "documentNumber": "DEP-042"
  }'
```

## Response

`201 Created`.

```json
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
```

## Permissions

Requires `settings.manage`.

## Errors

| Status | Description |
|--------|-------------|
| 400 | Invalid `kind`, invalid `direction`, missing `amount`/`movementDate`, or `movementDate` before opening date |
| 401 | Unauthenticated |
| 403 | Permission denied |
| 409 | No cash account configured for the company |
