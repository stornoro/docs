---
title: Get recurring invoice
description: Retrieve details of a specific recurring invoice including all line items.
---

# Get recurring invoice

Retrieves detailed information about a specific recurring invoice, including all line items that will be used as a template for generated invoices.

```http
GET /api/v1/recurring-invoices/{uuid}
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

Returns a detailed recurring invoice object with embedded line items.

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `reference` | string | Human-readable reference |
| `clientId` | string | UUID of the client |
| `client` | object | Embedded client object |
| `seriesId` | string | UUID of the document series |
| `series` | object | Embedded series object |
| `documentType` | string | `invoice` or `credit_note` |
| `currency` | string | ISO 4217 currency code |
| `invoiceTypeCode` | string | e-Factura invoice type code |
| `frequency` | string | Generation frequency |
| `frequencyDay` | integer | Day of month for generation (1-31) |
| `frequencyMonth` | integer \| null | Month for annual generation (1-12) |
| `nextIssuanceDate` | string | ISO 8601 date of next generation |
| `stopDate` | string \| null | ISO 8601 date to stop generation |
| `dueDateType` | string | `fixed` or `relative` |
| `dueDateDays` | integer \| null | Days after issue for relative due date |
| `dueDateFixedDay` | integer \| null | Fixed day of month (1-31) |
| `isActive` | boolean | Whether generation is enabled |
| `notes` | string \| null | Internal notes |
| `paymentTerms` | string \| null | Payment terms text |
| `autoEmailEnabled` | boolean | Auto-send email on generation |
| `autoEmailTime` | string \| null | Time to send (HH:mm) |
| `autoEmailDayOffset` | integer | Days offset for email sending |
| `penaltyEnabled` | boolean | Late payment penalty enabled |
| `penaltyPercentPerDay` | number \| null | Daily penalty percentage |
| `penaltyGraceDays` | integer \| null | Grace period before penalties |
| `lines` | array | Array of recurring invoice line items |
| `subtotal` | number | Sum of line items before VAT |
| `vatTotal` | number | Total VAT amount |
| `totalAmount` | number | Total amount including VAT |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

### Line Item Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `description` | string | Line item description |
| `quantity` | number | Quantity |
| `unitPrice` | number | Price per unit |
| `vatRateId` | string | UUID of VAT rate |
| `vatRate` | number | VAT percentage |
| `vatAmount` | number | Calculated VAT amount |
| `totalAmount` | number | Line total including VAT |
| `unitOfMeasure` | string | Unit of measure code |
| `productId` | string \| null | UUID of linked product |
| `priceRule` | string | `fixed`, `exchange_rate`, or `markup` |
| `referenceCurrency` | string \| null | Currency for exchange rate pricing |
| `markupPercent` | number \| null | Markup percentage |
| `position` | integer | Display order |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/recurring-invoices/rec-inv-uuid-1' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "uuid": "rec-inv-uuid-1",
  "reference": "MONTHLY-001",
  "clientId": "client-uuid-1",
  "client": {
    "uuid": "client-uuid-1",
    "name": "Acme Corporation SRL",
    "cui": "RO12345678",
    "email": "contact@acme.ro"
  },
  "seriesId": "series-uuid-1",
  "series": {
    "uuid": "series-uuid-1",
    "prefix": "FRE",
    "type": "invoice"
  },
  "documentType": "invoice",
  "currency": "RON",
  "invoiceTypeCode": "380",
  "frequency": "monthly",
  "frequencyDay": 1,
  "frequencyMonth": null,
  "nextIssuanceDate": "2026-03-01",
  "stopDate": null,
  "dueDateType": "relative",
  "dueDateDays": 30,
  "dueDateFixedDay": null,
  "isActive": true,
  "notes": "Monthly hosting services",
  "paymentTerms": "Payment due within 30 days",
  "autoEmailEnabled": true,
  "autoEmailTime": "09:00",
  "autoEmailDayOffset": 0,
  "penaltyEnabled": true,
  "penaltyPercentPerDay": 0.05,
  "penaltyGraceDays": 5,
  "lines": [
    {
      "uuid": "line-uuid-1",
      "description": "Cloud Hosting - Business Plan",
      "quantity": 1,
      "unitPrice": 1499.00,
      "vatRateId": "vat-uuid-1",
      "vatRate": 19,
      "vatAmount": 284.81,
      "totalAmount": 1783.81,
      "unitOfMeasure": "buc",
      "productId": "product-uuid-1",
      "priceRule": "fixed",
      "referenceCurrency": null,
      "markupPercent": null,
      "position": 1
    }
  ],
  "subtotal": 1499.00,
  "vatTotal": 284.81,
  "totalAmount": 1783.81,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-02-10T14:20:00Z"
}
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Recurring invoice not found or doesn't belong to company |

## Related Endpoints

- [List recurring invoices](/api-reference/recurring-invoices/list)
- [Update recurring invoice](/api-reference/recurring-invoices/update)
- [Issue now](/api-reference/recurring-invoices/issue-now)
