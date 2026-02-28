---
title: Document Lifecycle
description: Understanding the status transitions for invoices, proforma invoices, delivery notes, and credit notes.
---

# Document Lifecycle

Each document type in Storno.ro has a defined set of statuses and allowed transitions.

## Invoice Lifecycle

```
                                    ┌──────────┐
                              ┌────►│ cancelled │
                              │     └──────────┘
                              │          │
                              │          │ restore
                              │          ▼
┌───────┐  issue  ┌────────┐  │     ┌───────┐  submit  ┌─────────────┐
│ draft │────────►│ issued │──┘     │ draft │         │sent_to_provider│
│       │         │        │────────────────────────►│             │
└───────┘         └────────┘                         └──────┬──────┘
                                                            │
                                              ┌─────────────┼─────────────┐
                                              ▼             ▼             ▼
                                        ┌───────────┐ ┌──────────┐ ┌──────────┐
                                        │ validated  │ │ rejected │ │  error   │
                                        └─────┬─────┘ └──────────┘ └──────────┘
                                              │
                                    ┌─────────┼──────────┐
                                    ▼         ▼          ▼
                              ┌──────┐ ┌──────────────┐ ┌─────────┐
                              │ paid │ │partially_paid│ │ overdue │
                              └──────┘ └──────────────┘ └─────────┘
```

### Invoice Statuses

| Status | Description |
|--------|-------------|
| `draft` | Initial state. Invoice can be edited and deleted. |
| `issued` | Invoice has been validated and XML/PDF generated. Cannot be edited. |
| `sent_to_provider` | XML uploaded to e-invoice provider. Awaiting processing. |
| `validated` | E-invoice provider accepted the invoice. |
| `rejected` | E-invoice provider rejected the invoice. Needs correction. |
| `cancelled` | Invoice was cancelled. Can be restored to draft. |
| `paid` | Full payment recorded (`amountPaid >= total`). |
| `partially_paid` | Partial payment recorded (`0 < amountPaid < total`). |
| `overdue` | Past due date with outstanding balance. |
| `synced` | Incoming invoice synced from e-invoice provider (not created locally). |

### Key Rules

- Only `draft` invoices can be edited or deleted
- Issuing an invoice is irreversible (but it can be cancelled)
- Cancelled invoices can be restored back to `draft`
- Payment statuses (`paid`, `partially_paid`, `overdue`) are computed from payment records
- Credit notes should be used to correct validated invoices

## Proforma Invoice Lifecycle

```
┌───────┐  send   ┌──────┐  accept  ┌──────────┐  convert  ┌───────────┐
│ draft │────────►│ sent │─────────►│ accepted │──────────►│ converted │
│       │         │      │          │          │           │(→ invoice)│
└───┬───┘         └──┬───┘          └──────────┘           └───────────┘
    │                │
    │                │  reject
    │                ▼
    │           ┌──────────┐
    │           │ rejected │
    │           └──────────┘
    │
    │  cancel
    ▼
┌───────────┐
│ cancelled │
└───────────┘
```

### Proforma Statuses

| Status | Description |
|--------|-------------|
| `draft` | Initial state. Can be edited and deleted. |
| `sent` | Proforma sent to client. Awaiting response. |
| `accepted` | Client accepted the proforma. |
| `rejected` | Client rejected the proforma. |
| `converted` | Proforma converted to a real invoice. |
| `cancelled` | Proforma cancelled. |

### Key Rules

- Only `draft` proformas can be edited
- Converting creates a new invoice with the same data
- The `convertedInvoice` field links to the created invoice

## Delivery Note Lifecycle

```
┌───────┐  issue  ┌────────┐  convert  ┌───────────┐
│ draft │────────►│ issued │──────────►│ converted │
│       │         │        │           │(→ invoice)│
└───┬───┘         └────┬───┘           └───────────┘
    │                   │
    │  cancel           │  cancel
    ▼                   ▼
┌───────────┐     ┌───────────┐
│ cancelled │     │ cancelled │
└───────────┘     └───────────┘
```

### Delivery Note Statuses

| Status | Description |
|--------|-------------|
| `draft` | Initial state. Can be edited and deleted. |
| `issued` | Delivery note issued. Cannot be edited. |
| `converted` | Converted to an invoice. |
| `cancelled` | Delivery note cancelled. |

## Credit Notes

Credit notes use the Invoice entity with `isCreditNote: true`. They follow the same lifecycle as invoices but are specifically used to:

- Correct errors in validated invoices
- Issue partial or full refunds
- Adjust quantities or prices

Credit notes reference the original invoice via `parentDocumentId`.

## Payment Tracking

Payments are tracked separately from invoice status:

```bash
# Record a payment
POST /api/v1/invoices/{uuid}/payments
{
  "amount": 1000.00,
  "paymentDate": "2026-02-15",
  "paymentMethod": "bank_transfer"
}
```

- When `amountPaid == total` → status becomes `paid`
- When `0 < amountPaid < total` → status becomes `partially_paid`
- When `dueDate < today && amountPaid < total` → status becomes `overdue`
- Deleting a payment recalculates the status

## Status Transitions Summary

| Action | From | To |
|--------|------|----|
| Issue invoice | `draft` | `issued` |
| Submit to provider | `issued` | `sent_to_provider` |
| Provider validates | `sent_to_provider` | `validated` |
| Provider rejects | `sent_to_provider` | `rejected` |
| Cancel | `draft`, `issued` | `cancelled` |
| Restore | `cancelled` | `draft` |
| Full payment | any active | `paid` |
| Partial payment | any active | `partially_paid` |
| Past due date | any unpaid | `overdue` |
