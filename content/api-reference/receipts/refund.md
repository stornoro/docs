---
title: Refund Receipt
description: Issue a counter-receipt that mirrors all lines as negative amounts.
method: POST
endpoint: /api/v1/receipts/{uuid}/refund
---

# Refund Receipt

Creates a refund (counter-)receipt that mirrors the parent receipt's lines with negative quantities and inverted payment amounts. The refund is automatically issued and linked back to the parent via `refundOf`.

```http
POST /api/v1/receipts/{uuid}/refund
```

Use this when a customer returns goods or you need to undo a sale that's already been issued. The original receipt remains intact for audit; the refund records the money-out event in your cash-register ledger.

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | UUID of the receipt to refund |

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `X-Company` | string | Yes | Company UUID |

## Body

Empty body (or omitted) — full refund: every line is mirrored at full quantity.

For a partial refund, send `lineSelections`:

```json
{
  "lineSelections": [
    { "sourceLineId": "c3d4e5f6-a7b8-...", "quantity": "1" },
    { "sourceLineId": "e5f6a7b8-c9d0-...", "quantity": "0.5" }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lineSelections[].sourceLineId` | string | Yes | UUID of a line on the parent receipt |
| `lineSelections[].quantity` | string \| number | Yes | Positive quantity to refund. Must not exceed the line's remaining refundable quantity (parent line qty minus what's already been refunded across previous partial refunds for this parent). |

A receipt can be partially refunded multiple times; each call carves off some of the remaining refundable quantity. Once everything has been refunded the next call returns `422` with "Receipt has already been refunded." for full-refund attempts, or "Requested quantity (X) exceeds remaining refundable quantity (Y) for line ..." for individual lines.

**Cancelling a refund returns its quantities to the pool.** Refund receipts are auto-issued and can be cancelled like any other issued receipt via `POST /api/v1/receipts/{uuid}/cancel`. Once cancelled, the parent's refunded-quantity tally drops the cancelled refund's lines, so a fresh `/refund` call can re-refund those quantities. The parent's `refundedBy` JSON field also stops listing cancelled refunds (it's populated from active refunds only).

When `lineSelections` is provided, the refund's `cashPayment` / `cardPayment` / `otherPayment` amounts are scaled proportionally to the refunded gross share so the cash-register ledger stays consistent. Per-line discounts are also scaled by the same fraction for the partial line.

## Preconditions

- Parent receipt status must be `issued`. Drafts and cancelled receipts can't be refunded.
- Parent must not itself be a refund (`refundOf` is null).
- For a full refund (no `lineSelections`): the parent must not have any `refundedBy` entries.
- For a partial refund: each requested `quantity` must be > 0 and ≤ the source line's remaining refundable quantity.

Violating any of these returns `422 Unprocessable Entity` with a Romanian-language explanation in `error`.

## Behaviour

The new receipt:

- Gets a fresh UUID and sequential number from the same document series as the parent.
- Inherits company, client, customer fiscal info, currency, exchange rate, issuer, sales agent, notes, mentions, project reference, and cash-register identifiers from the parent.
- Mirrors **every line** with `quantity = -original` and `discount = -original`. Unit prices, VAT rates, and units of measure are unchanged so totals come out correctly negative.
- Mirrors `cashPayment`, `cardPayment`, and `otherPayment` as negative amounts.
- Sets `paymentMethod` to the parent's value.
- Auto-issues — status is `issued` on return, and `issuedAt` is stamped.

## Permissions

Requires `invoice.refund`.

## Response

`201 Created`. Returns the new refund receipt under the `receipt:detail` group.

```json
{
  "id": "f1d3a4b5-...",
  "number": "BON-2026-099",
  "status": "issued",
  "total": "-125.50",
  "subtotal": "-105.46",
  "vatTotal": "-20.04",
  "currency": "RON",
  "issueDate": "2026-04-25",
  "issuedAt": "2026-04-25T18:14:33+03:00",
  "refundOf": {
    "id": "a1b2c3d4-...",
    "number": "BON-2026-042"
  },
  "lines": [
    {
      "description": "Coffee — Espresso",
      "quantity": "-2.0000",
      "unitPrice": "12.61",
      "vatRate": "9.00",
      "lineTotal": "-25.22",
      "vatAmount": "-2.27"
    }
  ]
}
```

The parent receipt's `refundedBy` array is updated to include the new refund's id and number — clients should refetch the parent if they want to disable a "Refund" button there. The array reflects only **active** refunds; cancelled refund receipts are filtered out.

## Errors

| Status | Description |
|--------|-------------|
| 401 | Unauthenticated |
| 403 | Permission denied or wrong company |
| 404 | Receipt not found |
| 422 | Parent isn't issued / is itself a refund / has already been refunded |

## Related

- [Cancel receipt](/api-reference/receipts/cancel) — for receipts that haven't been issued yet, or to void an issued one without producing an audit record
- [Cash register ledger](/api-reference/cash-register/ledger) — refunds appear here as negative amounts
