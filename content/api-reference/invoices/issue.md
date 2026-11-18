---
title: Issue invoice
description: Issue a draft invoice, assign its number and schedule the e-Factura submission
---

# Issue invoice

Issues a draft invoice: it validates the invoice, takes the next number of its document series, changes the status from `draft` to `issued` and stores the XML and PDF files. If the company has an automatic e-Factura delay configured, it also schedules the submission to ANAF.

```
POST /api/v1/invoices/{uuid}/issue
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not used on this route: the invoice is found by its UUID |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

The endpoint takes no body.

## What happens when you issue an invoice

1. **Validation.** The invoice is validated in full (UBL schema and Schematron). If it is not valid, nothing changes and the response is `422` with the list of errors.
2. **Number assignment.** The invoice gets the next number of its document series (the default series for the document type when none is set), replacing the temporary `DRAFT-` number. Without any series the request fails with `422`.
3. **Status change.** The status changes from `draft` to `issued`. An invoice that has a `parentDocumentId` (a credit note or storno) gets status `refund` instead, and its parent invoice becomes `refunded`.
4. **Settlement.** An invoice with a zero or negative total, and any invoice with a parent, is marked as fully paid at once (`amountPaid` equals `total`).
5. **Files.** The XML and PDF are generated and stored. A failure here does not stop the issue.
6. **Event.** An event is recorded in the [invoice events](/api-reference/invoices/events).
7. **Scheduled submission.** See below.

An issued invoice that has not been uploaded to ANAF can still be edited. It cannot be deleted; it can be cancelled until it is uploaded.

## Automatic e-Factura submission

Issuing does not send the invoice to ANAF at once, but it schedules the submission when both conditions hold:

- the company setting `efacturaDelayHours` is not null (allowed values: `null`, `2`, `24`, `48`, `72`, `96`; see [Update company](/api-reference/companies/update)), and
- the client country is `RO` or not set.

The invoice then gets a `scheduledSendAt` date and a background job submits it inside the 00:00 to 06:00 upload window (Romania time). For a delay of 24 hours or more it is the midnight starting that many days ahead; for a shorter delay it is the delay from now, moved to the next window if it falls outside it. With `efacturaDelayHours` set to `null`, nothing is scheduled and the invoice is sent only when you call the [submit endpoint](/api-reference/invoices/submit). Calling submit clears the schedule, and cancelling the invoice clears it too.

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/issue \
  -H "Authorization: Bearer YOUR_TOKEN"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/issue', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const result = await response.json();
// result.status, result.number, result.scheduledSendAt
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns `200 OK` with a short summary, not the invoice. Fetch the invoice with [Get invoice details](/api-reference/invoices/get) if you need it.

```json
{
  "status": "issued",
  "number": "FAC0001",
  "efacturaDelayHours": 24,
  "scheduledSendAt": "2024-02-16T00:00:00+02:00",
  "warning": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `issued`, or `refund` when the invoice has a parent document |
| `number` | string | The number assigned from the series |
| `efacturaDelayHours` | integer or null | The company setting at the time of issue |
| `scheduledSendAt` | string or null | When the automatic submission is due. `null` when none was scheduled |
| `warning` | object or null | Set when the client has a credit limit and this invoice takes the outstanding balance above it. Fields: `code` (`credit_limit_exceeded`), `message`, `creditLimit`, `outstanding`, `invoiceTotal`, `projected`, `currency`. The invoice is issued anyway |

## Error codes

Error bodies have the form `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | The invoice belongs to another organization, or the user cannot issue invoices |
| `404` | Invoice not found |
| `422` | The invoice is not a draft, has no document series, belongs to a blocked client, or failed validation. A validation failure returns `{"error": "...", "valid": false, "errors": [{"message", "source", "ruleId", "location"}], "warnings": []}` |

## Related endpoints

- [Validate invoice](/api-reference/invoices/validate) - Validate invoice before issuing
- [Submit invoice](/api-reference/invoices/submit) - Send an issued invoice to ANAF at once
- [Download XML](/api-reference/invoices/xml) - Download the XML
- [Download PDF](/api-reference/invoices/pdf) - Download the PDF
