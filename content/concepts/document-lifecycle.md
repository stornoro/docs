---
title: Document Lifecycle
description: Understanding the status transitions for invoices, proforma invoices, delivery notes, and credit notes.
---

# Document Lifecycle

Each document type in Storno.ro has a defined set of statuses and allowed transitions.

## Invoice Lifecycle

```
                                    ┌───────────┐
                              ┌────►│ cancelled │
                              │     └─────┬─────┘
                              │           │ restore
                              │           ▼
┌───────┐  issue  ┌────────┐  │      ┌───────┐
│ draft │────────►│ issued │──┘      │ draft │
└───────┘         └───┬────┘         └───────┘
                      │ submit
                      ▼
              ┌────────────────┐
              │ sent_to_provider│
              └───────┬────────┘
                      │
              ┌───────┴───────┐
              ▼               ▼
        ┌───────────┐   ┌──────────┐
        │ validated │   │ rejected │
        └───────────┘   └──────────┘
```

A rejected invoice can be edited and submitted again.

### Invoice Statuses

| Status | Description |
|--------|-------------|
| `draft` | Initial state. The invoice can be edited and deleted. |
| `issued` | The invoice has a final number and its XML and PDF are generated. It is not yet uploaded to ANAF. |
| `sent_to_provider` | XML uploaded to the e-invoice provider. Awaiting processing. |
| `validated` | The e-invoice provider accepted the invoice. |
| `rejected` | The e-invoice provider rejected the invoice. It needs correction. |
| `cancelled` | The invoice was cancelled. It can be restored to draft or deleted. |
| `refund` | A credit note or storno that has been issued (it has a parent invoice). |
| `refunded` | The parent invoice of an issued credit note or storno. |
| `synced` | Incoming invoice synced from the e-invoice provider (not created locally). |
| `paid`, `partially_paid`, `overdue` | Values that exist in the status list. Recording or deleting payments does not set them. `overdue` is not set automatically. |

### Key Rules

- A draft can be edited and deleted.
- An invoice can be edited while it is not cancelled, not `sent_to_provider`, and has not been uploaded to ANAF. This includes `issued` invoices that were not uploaded, and `rejected` invoices.
- Only `draft` and `cancelled` invoices can be deleted.
- Only `draft` invoices, and `issued` invoices that were not uploaded to ANAF, can be cancelled. Cancelled invoices can be restored back to `draft`.
- Issuing an invoice with a parent document sets its status to `refund` and the status of the parent to `refunded`, including when the credit note covers only part of the parent.
- Issuing schedules the automatic e-Factura submission when the company `efacturaDelayHours` is set. See [Issue invoice](/api-reference/invoices/issue).

## Proforma Invoice Lifecycle

```
┌───────┐  send   ┌──────┐  accept  ┌──────────┐
│ draft │────────►│ sent │─────────►│ accepted │
└───────┘         └──┬───┘          └────┬─────┘
                     │                   │
          reject     │  convert          │  convert
          ┌──────────┤  ┌────────────────┤
          ▼          ▼  ▼                ▼
    ┌──────────┐   ┌───────────┐   (sent and accepted proformas
    │ rejected │   │ converted │    can also expire or be cancelled)
    └──────────┘   │(→ invoice)│
                   └───────────┘
```

### Proforma Statuses

| Status | Description |
|--------|-------------|
| `draft` | Initial state. Can be edited and deleted. |
| `sent` | Proforma sent to the client. Awaiting response. |
| `accepted` | Client accepted the proforma. |
| `rejected` | Client rejected the proforma. |
| `converted` | Proforma converted to a real invoice. |
| `cancelled` | Proforma cancelled. |
| `expired` | A scheduled job sets this on `sent` and `accepted` proformas whose `validUntil` date has passed. |

### Key Rules

- Only `draft` proformas can be edited.
- Only `draft` and `cancelled` proformas can be deleted.
- `accept` and `reject` apply to `sent` proformas only.
- `convert` applies to `sent` and `accepted` proformas. It creates a draft invoice with the same data and returns the invoice.
- `cancel` applies to every status except `converted` and `cancelled`.
- The proforma response does not expose the converted invoice id.

## Delivery Note Lifecycle

```
┌───────┐  issue  ┌────────┐  convert  ┌───────────┐
│ draft │────────►│ issued │──────────►│ converted │
│       │         │        │           │(→ invoice)│
└───┬───┘         └────┬───┘           └───────────┘
    │                  │
    │  cancel          │  cancel
    ▼                  ▼
┌───────────┐     ┌───────────┐
│ cancelled │────►│   draft   │  (restore)
└───────────┘     └───────────┘
```

### Delivery Note Statuses

| Status | Description |
|--------|-------------|
| `draft` | Initial state. Can be edited and deleted. |
| `issued` | Delivery note issued. It can still be edited. |
| `converted` | Converted to an invoice. |
| `cancelled` | Delivery note cancelled. It can be restored to `draft` or deleted. |

A storno of a delivery note creates a new draft delivery note.

## Credit Notes

A credit note is an invoice created with `documentType: "credit_note"`. It follows the invoice lifecycle and is used to:

- Correct errors in validated invoices
- Issue partial or full refunds
- Adjust quantities or prices

A credit note references the original invoice through `parentDocumentId`. See [Create credit note](/api-reference/credit-notes/create).

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

- Recording a payment updates the invoice `amountPaid`, `balance` and `paidAt`.
- When `amountPaid` reaches `total`, `paidAt` is set. Otherwise `paidAt` is null.
- Deleting a payment recalculates `amountPaid`, `balance` and `paidAt`.
- The invoice `status` does not change when a payment is recorded or deleted.
- Invoices with a zero or negative total (credit notes, stornos) are settled automatically and do not accept payments.

## Status Transitions Summary

| Action | From | To |
|--------|------|----|
| Issue invoice | `draft` | `issued` (`refund` when the invoice has a parent document) |
| Submit to provider | `issued`, `refund`, `rejected` | `sent_to_provider` |
| Provider validates | `sent_to_provider` | `validated` |
| Provider rejects | `sent_to_provider` | `rejected` |
| Cancel | `draft`, `issued` (not uploaded to ANAF) | `cancelled` |
| Restore | `cancelled` | `draft` |
| Record or delete a payment | any | unchanged |
