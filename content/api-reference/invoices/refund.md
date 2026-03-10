---
title: Refund an invoice
description: Two approaches for issuing refunds — credit notes or negative invoices
---

# Refund an invoice

There are two ways to refund an invoice in Storno:

1. **Credit note** — A formal document linked to the original invoice via `parentDocumentId`
2. **Negative invoice** — A standalone invoice with negative quantities, not linked to any parent

Both are valid for ANAF e-Factura and produce the same fiscal result. Choose the approach that fits your workflow.

## Option 1: Credit note (linked to parent)

Use this when you want a formal reference between the refund and the original invoice. See the [Credit Notes](/api-reference/credit-notes/create) docs for full details.

```bash
curl -X POST https://api.storno.ro/api/v1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid" \
  -H "Content-Type: application/json" \
  -d '{
    "isCreditNote": true,
    "parentDocumentId": "original-invoice-uuid",
    "clientId": "client-uuid",
    "seriesId": "credit-note-series-uuid",
    "issueDate": "2026-03-10",
    "dueDate": "2026-03-10",
    "currency": "RON",
    "invoiceTypeCode": "381",
    "notes": "Credit note for invoice FAC-2026-045",
    "lines": [
      {
        "description": "Web Development Services (CREDIT)",
        "quantity": -10,
        "unitPrice": 100.00,
        "vatRateId": "vat-rate-uuid"
      }
    ]
  }'
```

## Option 2: Negative invoice (standalone)

Use this when you don't need a formal link to the original invoice. Simply create a regular invoice with negative quantities.

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
    "invoiceTypeCode": "381",
    "notes": "Refund for invoice FAC-2026-045",
    "lines": [
      {
        "description": "Web Development Services (refund)",
        "quantity": -10,
        "unitPrice": 100.00,
        "vatRateId": "vat-rate-uuid"
      }
    ]
  }'
```

This creates a standard invoice with negative totals. No `parentDocumentId` or `isCreditNote` flag is needed.

## When to use which

| | Credit note | Negative invoice |
|---|---|---|
| Linked to original invoice | Yes | No |
| Requires `parentDocumentId` | Yes | No |
| Requires `isCreditNote: true` | Yes | No |
| Valid for ANAF e-Factura | Yes | Yes |
| Shows in credit notes list | Yes | No |
| Recommended `invoiceTypeCode` | 381 | 381 |
| Use case | Formal corrections, audits | Quick refunds, simpler workflow |

## Notes

- Both approaches support partial refunds — just adjust the quantities or add only the lines you want to refund
- Use `invoiceTypeCode: "381"` (credit note) for both approaches to signal the refund nature in e-Factura
- Negative quantities with positive unit prices are recommended over positive quantities with negative prices
- Both are submitted to ANAF the same way via the [submit endpoint](/api-reference/invoices/submit)
