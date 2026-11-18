---
title: Refund an invoice
description: Three ways to refund an invoice, a credit note, a storno or a negative invoice
---

# Refund an invoice

There is no refund endpoint. An invoice is refunded with one of three documents, all created through the invoice endpoints:

1. **Credit note.** An invoice with `documentType: "credit_note"` linked to the original invoice with `parentDocumentId`.
2. **Storno.** A draft that reverses an issued invoice in full, created with `POST /api/v1/invoices/bulk-storno`.
3. **Negative invoice.** A regular invoice with negative quantities and no link to the original.

All three are valid for ANAF e-Factura. Choose the one that fits your workflow.

## What issuing a refund does

Issuing a document that has a parent (a credit note or a storno) with [Issue invoice](/api-reference/invoices/issue):

- sets its status to `refund`, not `issued`;
- sets the status of the original invoice to `refunded`, whatever the amount credited;
- settles it: `amountPaid` equals `total` and `paidAt` is set, because there is nothing to collect.

A document with a zero or negative total and no parent is also settled when it is created or issued, and keeps the status `issued`.

## Option 1: Credit note (linked to the original)

Use this to credit part of an invoice or to choose the lines. See [Create credit note](/api-reference/credit-notes/create) for the full body.

```bash
curl -X POST https://api.storno.ro/api/v1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "credit_note",
    "parentDocumentId": "original-invoice-uuid",
    "clientId": "client-uuid",
    "documentSeriesId": "credit-note-series-uuid",
    "issueDate": "2026-03-10",
    "dueDate": "2026-03-10",
    "currency": "RON",
    "notes": "Credit note for invoice FAC0045",
    "lines": [
      {
        "description": "Web Development Services (CREDIT)",
        "quantity": -10,
        "unitPrice": 100,
        "vatRateId": "vat-rate-uuid"
      }
    ]
  }'
```

The response is `201` with `{invoice, validation}`. The credit note is a draft until you issue it.

## Option 2: Storno of an issued invoice

`POST /api/v1/invoices/bulk-storno` creates, for each invoice id, a draft that copies the original with every quantity negated. It does not accept partial amounts.

```bash
curl -X POST https://api.storno.ro/api/v1/invoices/bulk-storno \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid" \
  -H "Content-Type: application/json" \
  -d '{ "ids": ["invoice-uuid-1", "invoice-uuid-2"] }'
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ids` | array | Yes | Between 1 and 100 invoice ids. Outside that range the request returns `400 {"error": "Provide between 1 and 100 IDs."}` |

The response is `200` even when some ids failed:

```json
{
  "created": 1,
  "errors": [
    { "id": "invoice-uuid-2", "error": "Invoice already has a storno refund." }
  ]
}
```

`created` is the number of drafts created. The response does not return their ids: read them from `refundInvoices` on the original invoice (see [Get invoice](/api-reference/invoices/get)), then issue them.

An invoice is accepted when it is outgoing, its status is `issued`, `sent_to_provider`, `validated` or `synced`, it is not cancelled, it has no parent of its own and it has no storno yet. Otherwise its id appears in `errors` with the reason, as it does for a missing invoice, a missing permission or a reached monthly plan limit.

The draft copies the client, the series, the document type, the currency, the payment terms, the e-Factura reference fields and the lines (with the same VAT rates) of the original. Its notes read `Storno factura #<number> din <dd.mm.yyyy>` and its issue date is today.

## Option 3: Negative invoice (standalone)

Use this when you do not need a link to the original invoice. Create a regular invoice with negative quantities.

```bash
curl -X POST https://api.storno.ro/api/v1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-uuid",
    "documentSeriesId": "invoice-series-uuid",
    "issueDate": "2026-03-10",
    "dueDate": "2026-03-10",
    "currency": "RON",
    "notes": "Refund for invoice FAC0045",
    "lines": [
      {
        "description": "Web Development Services (refund)",
        "quantity": -10,
        "unitPrice": 100,
        "vatRateId": "vat-rate-uuid"
      }
    ]
  }'
```

This creates a regular `invoice` with negative totals. The original invoice keeps its status.

## When to use which

| | Credit note | Storno | Negative invoice |
|---|---|---|---|
| Linked to the original invoice | Yes, `parentDocumentId` | Yes | No |
| `documentType` | `credit_note` | The type of the original | `invoice` |
| Partial amounts | Yes, you choose the lines | No, full reversal | Yes |
| Status after issue | `refund` | `refund` | `issued` |
| Original invoice after issue | `refunded` | `refunded` | Unchanged |
| Found with `type=credit_note` | Yes | Only if the original is one | No |

## Notes

- `quantity` must not be zero and `unitPrice` must not be negative. Refund with a negative quantity and a positive price.
- Submit an issued refund to ANAF with [Submit invoice](/api-reference/invoices/submit), like any invoice.
- `invoiceTypeCode` takes the slugs listed in [Create credit note](/api-reference/credit-notes/create), not UBL numbers.
