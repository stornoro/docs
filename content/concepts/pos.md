---
title: Point of Sale (POS)
description: How the Storno.ro POS module works — fiscal receipts, idempotency, refunds, SGR deposits, and offline sync.
---

# Point of Sale (POS)

The Storno.ro POS module turns the mobile app into a tablet- or phone-friendly cash register. It produces fiscal [Receipts](/objects/receipt), supports cash / card / meal-ticket / mixed payments, refunds, the Romanian SGR deposit scheme, and continues to operate while offline.

The POS is built entirely on top of the public API — every action a cashier takes maps to one or more documented endpoints. This page summarises the moving parts and links to the reference docs for each.

## Components

| Component | Purpose |
|-----------|---------|
| [Product](/objects/product) | Sellable item shown on the grid. `color`, `category`, and `sgrAmount` are the POS-specific fields. |
| [ProductCategory](/objects/product-category) | Optional grouping shown as a chip strip above the grid. Tap a chip to filter the grid. |
| [Receipt](/objects/receipt) | The fiscal document produced by every sale or refund. |
| [Cash Register Movements](/api-reference/cash-register/list-movements) | Deposits, withdrawals, and adjustments to the till. Required for the daily Z-report. |

## Sale flow

1. Cashier loads the POS screen, which fetches active products + categories.
2. Items are tapped into a local cart. Per-line discounts, whole-cart discounts, and price overrides are applied client-side.
3. Cashier taps **Checkout** and selects payment method(s). Mixed payments split across `cashPayment`, `cardPayment`, and `otherPayment` (meal tickets count as `other`).
4. The app calls `POST /receipts` followed by `POST /receipts/{uuid}/issue` to issue and number the receipt.
5. PDF is rendered server-side. The mobile app keeps a local cache for offline preview.

## Idempotency

Mobile networks drop packets. To make POS retries safe, every `POST /receipts` request from the mobile app includes an `Idempotency-Key` HTTP header — typically a UUID generated when the cashier taps **Checkout**.

- The first request with a given key creates the receipt and stores the key on `Receipt.idempotencyKey`.
- Subsequent requests with the same key return the **already-created** receipt instead of duplicating.
- If both the `Idempotency-Key` header and an `idempotencyKey` body field are sent, the **header wins**.

This makes it safe to retry on connection timeout, app restart, or even after the app comes back from being killed mid-checkout: the same key is replayed, and the server returns the original receipt.

## Refunds

Refunds are first-class receipts. They mirror the parent's lines as **negative quantities** and invert the payment amounts so the daily Z-report nets out correctly.

- `POST /receipts/{uuid}/refund` issues a refund. With no body, the entire receipt is refunded.
- `lineSelections: [{ position, quantity }, ...]` performs a **partial refund**. Multiple partial refunds against the same parent are allowed until each line's quantity pool is exhausted.
- Cancelling a refund (via `POST /receipts/{uuid}/cancel`) **releases its quantities back to the pool**, so the cashier can re-issue.
- Refunds inherit `internalNote`, `cashRegisterName`, `fiscalNumber`, and customer fiscal data from the parent.
- The PDF header reads `BON DE RAMBURSARE` (or the locale equivalent) instead of `BON FISCAL`.

The parent receipt's status moves to `partially_refunded` while any quantity remains, and to `refunded` once everything has been refunded.

See [Receipt → Refunds](/objects/receipt#refunds) for the data shape (`refundOf`, `refundedBy`).

## SGR — Sistem Garantie-Returnare

Romania's SGR scheme charges a 0.50 RON refundable deposit on certain beverage containers. Storno's POS handles it transparently:

- Set `Product.sgrAmount` (decimal string, e.g. `"0.50"`) on any product subject to the deposit.
- When the product is sold, the POS auto-appends a **separate VAT-exempt line** for the deposit. The cashier doesn't add it manually.
- Cancelling or refunding the parent line cancels/refunds the deposit line in lockstep.
- The deposit line is flagged in the receipt PDF and renders below the parent line.

## Offline mode

If the device loses connectivity mid-shift, the POS keeps working:

1. Sales are written to a local **outbox** keyed by their generated idempotency key.
2. The cashier sees the receipt rendered locally with a "pending sync" badge.
3. A background drainer flushes the outbox to the API as soon as the network is back; idempotency keys protect against duplicates if the server already received an earlier attempt.
4. ANAF e-Factura submission (where applicable) is queued separately and only fires once the receipt has a server-confirmed UUID.

## Cash register

The till backing the POS is a [Bank Account](/objects/bank-account) with `type: "cash"`. Set `openingBalance` + `openingBalanceDate` for the day's opening float, and use `/cash-register/movements` for any cash in/out that isn't a sale (deposits, manager pickup, expense reimbursement). The daily Z-report reconciles opening balance + sales − refunds + deposits − withdrawals against the closing count.
