---
title: Payment
description: Payment object for tracking invoice payments
---

# Payment

The Payment object represents a payment received or made for an invoice. Multiple payments can be associated with a single invoice to track partial payments.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Unique identifier |
| amount | decimal | Payment amount |
| currency | string | 3-letter currency code (e.g., "RON", "EUR") |
| paymentDate | date | Date the payment was received/made (YYYY-MM-DD) |
| paymentMethod | string | Payment method (bank_transfer, cash, card, etc.) |
| reference | string | Payment reference/transaction ID |
| notes | text | Additional notes about the payment |
| isReconciled | boolean | Whether payment has been reconciled with bank statement |
| paymentCreatedAt | datetime | Virtual field: timestamp when payment was recorded |
| createdAt | datetime | Timestamp when created |
| updatedAt | datetime | Timestamp of last update |

## Payment Methods

Common payment methods include:

- **bank_transfer** - Bank transfer (Ordin de plată)
- **cash** - Cash payment (Numerar)
- **card** - Card payment (Card)
- **check** - Check (Cec)
- **paypal** - PayPal
- **stripe** - Stripe
- **mobilpay** - MobilPay
- **other** - Other method

## Example - Single Payment

```json
{
  "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
  "amount": 1190.00,
  "currency": "RON",
  "paymentDate": "2024-02-20",
  "paymentMethod": "bank_transfer",
  "reference": "OP-2024-1234",
  "notes": "Payment via Banca Transilvania",
  "isReconciled": true,
  "paymentCreatedAt": "2024-02-20T14:30:00+02:00",
  "createdAt": "2024-02-20T14:30:00+02:00",
  "updatedAt": "2024-02-21T09:00:00+02:00"
}
```

## Example - Partial Payments

```json
[
  {
    "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
    "amount": 500.00,
    "currency": "RON",
    "paymentDate": "2024-02-20",
    "paymentMethod": "bank_transfer",
    "reference": "OP-2024-1234",
    "notes": "Partial payment 1 of 2",
    "isReconciled": true,
    "createdAt": "2024-02-20T14:30:00+02:00"
  },
  {
    "id": "e5f6a7b8-c9d0-1234-ef12-345678901234",
    "amount": 690.00,
    "currency": "RON",
    "paymentDate": "2024-03-05",
    "paymentMethod": "bank_transfer",
    "reference": "OP-2024-2456",
    "notes": "Final payment",
    "isReconciled": false,
    "createdAt": "2024-03-05T10:15:00+02:00"
  }
]
```

## Example - Cash Payment

```json
{
  "id": "f6a7b8c9-d0e1-2345-f123-456789012345",
  "amount": 250.00,
  "currency": "RON",
  "paymentDate": "2024-02-18",
  "paymentMethod": "cash",
  "reference": "CASH-001",
  "notes": "Received in cash at office",
  "isReconciled": true,
  "createdAt": "2024-02-18T16:45:00+02:00",
  "updatedAt": "2024-02-18T16:45:00+02:00"
}
```

## Example - Card Payment

```json
{
  "id": "a7b8c9d0-e1f2-3456-1234-567890123456",
  "amount": 595.00,
  "currency": "RON",
  "paymentDate": "2024-02-16",
  "paymentMethod": "stripe",
  "reference": "ch_3AbCdEfGhIjKlMnO",
  "notes": "Online payment via Stripe",
  "isReconciled": true,
  "createdAt": "2024-02-16T11:23:45+02:00",
  "updatedAt": "2024-02-16T11:23:45+02:00"
}
```

## Payment Reconciliation

The `isReconciled` field tracks whether a payment has been verified against a bank statement:

- **true**: Payment confirmed and matched with bank records
- **false**: Payment recorded but not yet reconciled

## Invoice Balance Calculation

The invoice balance is calculated as:

```
balance = invoice.total - SUM(payments.amount)
```

When `balance = 0`, the invoice status changes to `paid`.

## Notes

- **currency**: Should match the invoice currency
- **paymentDate**: Date when payment was actually received (can differ from creation date)
- **reference**: Transaction ID, order number, or payment reference for tracking
- **isReconciled**: Used for accounting purposes to track bank reconciliation
- Multiple payments can be added to track installment payments
- Payments cannot be deleted once reconciled (only marked as reconciled)
- Overpayments (total payments > invoice total) are allowed and tracked
- Payment records are preserved even if the invoice is soft-deleted
