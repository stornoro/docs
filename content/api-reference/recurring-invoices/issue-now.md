---
title: Issue recurring invoice now
description: Generate and issue a document from a recurring invoice template immediately.
---

# Issue recurring invoice now

Runs a recurring invoice template immediately instead of waiting for `nextIssuanceDate`. The document is created from the template and issued in the same call, exactly as a scheduled run does.

```http
POST /api/v1/recurring-invoices/{uuid}/issue-now
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the recurring invoice |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |

The endpoint takes no body.

## Response

Returns `200 OK` with the generated document:

| Field | Type | Description |
|-------|------|-------------|
| `invoiceId` | string | UUID of the generated invoice or proforma |
| `invoiceNumber` | string | Its number |
| `documentType` | string | `invoice` or `proforma` |

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/recurring-invoices/rec-inv-uuid-1/issue-now' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Example Response

```json
{
  "invoiceId": "invoice-uuid-1",
  "invoiceNumber": "FRE0123",
  "documentType": "invoice"
}
```

Use [Get invoice](/api-reference/invoices/get) with `invoiceId` to read the document.

## Behavior

### Generated document

- The issue date is today. The due date follows `dueDateType`.
- The lines are copied from the template. Prices with a BNR rate or an expression are computed at this moment, and the placeholders in `notes` and line descriptions are filled in.
- A template with `documentType` `invoice` or `credit_note` creates an invoice and issues it: its status is `issued` and it takes the next number of the series. When the company has `efacturaDelayHours` set and the client is Romanian, the e-Factura submission is scheduled as for any issued invoice.
- A template with `documentType` `proforma` creates a proforma, sends it and accepts it.
- The template's penalty settings are copied to the invoice.

### Next issuance date

The template's schedule moves on as after a scheduled run: `nextIssuanceDate` advances by one period, and a `once` template is deactivated. `lastIssuedAt`, `lastInvoiceNumber`, `lastInvoiceId` and `lastDocumentType` are updated. A running `balance` is reduced by `balanceStep`.

### Auto-email

If `autoEmailEnabled` is `true`, the invoice gets a scheduled email time from `autoEmailTime` and `autoEmailDayOffset`.

## Errors

Errors have the form `{"error": "message"}`.

| Status | Description |
|--------|-------------|
| 400 | The document could not be generated (for example an unknown client or invoice type, or the monthly invoice limit is reached). The message says why |
| 401 | Missing or invalid authentication token |
| 402 | Recurring invoices are not available on the plan. Body has `"code": "PLAN_LIMIT"` |
| 403 | Missing permission |
| 404 | Recurring invoice not found |

## Related Endpoints

- [Get recurring invoice](/api-reference/recurring-invoices/get)
- [List invoices](/api-reference/invoices/list)
- [Get invoice](/api-reference/invoices/get)
