---
title: Issue recurring invoice now
description: Manually trigger immediate invoice generation from a recurring template.
---

# Issue recurring invoice now

Manually triggers immediate invoice generation from a recurring invoice template, bypassing the scheduled generation. This is useful for creating one-off invoices or testing recurring invoice configurations.

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
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns the newly created invoice object with a `201 Created` status.

### Response Schema

Returns a complete invoice object with all fields from the recurring invoice template applied.

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier of the created invoice |
| `number` | string | Full invoice number (e.g., "FRE00123") |
| `seriesPrefix` | string | Series prefix |
| `seriesNumber` | integer | Sequential number |
| `clientId` | string | UUID of the client |
| `documentType` | string | Document type from template |
| `currency` | string | Currency from template |
| `issueDate` | string | ISO 8601 date (today's date) |
| `dueDate` | string | ISO 8601 date (calculated per template) |
| `subtotal` | number | Sum before VAT |
| `vatTotal` | number | Total VAT amount |
| `totalAmount` | number | Total including VAT |
| `amountPaid` | number | Amount paid (0.00 initially) |
| `status` | string | Invoice status (`unpaid`) |
| `recurringInvoiceId` | string | UUID of the source recurring invoice |
| `lines` | array | Array of invoice line items |
| `createdAt` | string | ISO 8601 creation timestamp |

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/recurring-invoices/rec-inv-uuid-1/issue-now' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "uuid": "invoice-uuid-1",
  "number": "FRE00123",
  "seriesPrefix": "FRE",
  "seriesNumber": 123,
  "clientId": "client-uuid-1",
  "client": {
    "uuid": "client-uuid-1",
    "name": "Acme Corporation SRL",
    "cui": "RO12345678",
    "email": "contact@acme.ro"
  },
  "documentType": "invoice",
  "currency": "RON",
  "invoiceTypeCode": "380",
  "issueDate": "2026-02-16",
  "dueDate": "2026-03-18",
  "subtotal": 1499.00,
  "vatTotal": 284.81,
  "totalAmount": 1783.81,
  "amountPaid": 0.00,
  "status": "unpaid",
  "notes": "Monthly hosting services",
  "paymentTerms": "Payment due within 30 days",
  "recurringInvoiceId": "rec-inv-uuid-1",
  "lines": [
    {
      "uuid": "inv-line-uuid-1",
      "description": "Cloud Hosting - Business Plan",
      "quantity": 1,
      "unitPrice": 1499.00,
      "vatRate": 19,
      "vatAmount": 284.81,
      "totalAmount": 1783.81,
      "unitOfMeasure": "buc",
      "productId": "product-uuid-1",
      "position": 1
    }
  ],
  "createdAt": "2026-02-16T12:30:00Z",
  "updatedAt": "2026-02-16T12:30:00Z"
}
```

## Behavior

### Invoice Creation

- Creates a new invoice using the current date as `issueDate`
- Calculates `dueDate` based on the recurring invoice's `dueDateType` and related fields
- Uses the next available number from the specified series
- Copies all line items from the recurring invoice template
- Sets `status` to `unpaid` and `amountPaid` to 0.00
- Links the invoice to the recurring invoice via `recurringInvoiceId`

### Next Issuance Date

The recurring invoice's `nextIssuanceDate` is **not automatically updated**. Manual issuance does not affect the scheduled generation cycle.

### Auto-Email

If `autoEmailEnabled` is `true` on the recurring invoice, the system will send the invoice email according to the configured `autoEmailTime` and `autoEmailDayOffset`.

### Dynamic Pricing

If line items use `priceRule` of `exchange_rate` or `markup`, prices are calculated at the time of invoice generation using current exchange rates or markup rules.

## Use Cases

### Testing

Test a recurring invoice configuration before activating automatic generation.

### One-Off Generation

Generate an invoice outside the normal schedule, such as for mid-month billing adjustments.

### Early Billing

Issue the next invoice early if a client requests it or payment is needed sooner than scheduled.

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Recurring invoice not found or doesn't belong to company |
| 422 | validation_error | Cannot generate invoice (e.g., inactive series, invalid client) |

## Related Endpoints

- [Get recurring invoice](/api-reference/recurring-invoices/get)
- [List invoices](/api-reference/invoices/list)
- [Get invoice](/api-reference/invoices/get)
