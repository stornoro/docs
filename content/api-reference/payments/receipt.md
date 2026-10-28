---
title: Cash receipt (chitanță) for a payment
description: Issue the chitanță for a cash payment already recorded on an issued invoice, and download its PDF.
---

# Cash receipt (chitanță) for a payment

A cash payment recorded on an issued invoice can carry a **chitanță**: a numbered, dated receipt that documents that payment. Issuing it never records a second payment — the invoice `amountPaid`, the client statement and the cash register keep reading the same payment row; the cash register shows the payment as cash in, labelled with the receipt number.

Only cash payments (`paymentMethod: cash`) on **outgoing** invoices qualify, and the company needs a document series of type `receipt`.

## Issue the receipt

```http
POST /api/v1/invoices/{uuid}/payments/{paymentId}/receipt
```

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seriesId` | string | No | A receipt series (type `receipt`) of the company. Default: the company's default receipt series |
| `date` | string | No | Receipt date, `YYYY-MM-DD`. Default: the payment date |

### Response

`200 OK` — the payment with the receipt fields filled. Issuing is idempotent: a payment that already has a receipt returns it unchanged, no second number is consumed.

```json
{
  "id": "…",
  "amount": "342.61",
  "currency": "RON",
  "paymentDate": "2026-10-23T00:00:00+00:00",
  "paymentMethod": "cash",
  "receiptNumber": "CHT0001",
  "receiptDate": "2026-10-23T00:00:00+00:00",
  "receiptSeriesId": "…",
  "receiptIssuedAt": "2026-10-28T09:12:44+00:00"
}
```

The same fields come back on `GET /api/v1/invoices/{uuid}/payments`, and the invoice timeline gets a `receipt_issued` event.

### Errors

| Status | Description |
|--------|-------------|
| 400 | `date` is not `YYYY-MM-DD` |
| 403 | No `payment.create` permission |
| 404 | Invoice, payment or series not found |
| 422 | The payment is not cash, the invoice is a received one, or no receipt series exists (the message says which) |

## Download the PDF

```http
GET /api/v1/invoices/{uuid}/payments/{paymentId}/receipt/pdf
```

An A5 landscape PDF: the company, the payer (from the invoice's buyer), the amount in figures and in words, the invoice it settles and the payment date, with signature lines. `404` when no receipt was issued for the payment; `402` (`PLAN_LIMIT`) on plans without PDF generation.
