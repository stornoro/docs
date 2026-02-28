---
title: Create recurring invoice
description: Create a new recurring invoice template that will automatically generate invoices.
---

# Create recurring invoice

Creates a new recurring invoice template. The system will automatically generate invoices based on the specified frequency and schedule.

```http
POST /api/v1/recurring-invoices
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | string | Yes | UUID of the client |
| `seriesId` | string | Yes | UUID of the document series |
| `reference` | string | No | Human-readable reference |
| `documentType` | string | Yes | `invoice` or `credit_note` |
| `currency` | string | Yes | ISO 4217 currency code |
| `invoiceTypeCode` | string | Yes | e-Factura invoice type code (e.g., "380") |
| `frequency` | string | Yes | `weekly`, `biweekly`, `monthly`, `bimonthly`, `quarterly`, `semiannual`, `annual` |
| `frequencyDay` | integer | Yes | Day of month for generation (1-31) |
| `frequencyMonth` | integer | No | Month for annual generation (1-12, required if frequency is `annual`) |
| `nextIssuanceDate` | string | Yes | ISO 8601 date for first invoice |
| `stopDate` | string | No | ISO 8601 date to stop generation |
| `dueDateType` | string | Yes | `fixed` or `relative` |
| `dueDateDays` | integer | Conditional | Required if dueDateType is `relative` |
| `dueDateFixedDay` | integer | Conditional | Required if dueDateType is `fixed` (1-31) |
| `notes` | string | No | Internal notes |
| `paymentTerms` | string | No | Payment terms text |
| `autoEmailEnabled` | boolean | No | Auto-send email on generation (default: false) |
| `autoEmailTime` | string | No | Time to send (HH:mm, default: "09:00") |
| `autoEmailDayOffset` | integer | No | Days offset for email sending (default: 0) |
| `penaltyEnabled` | boolean | No | Enable late payment penalties (default: false) |
| `penaltyPercentPerDay` | number | No | Daily penalty percentage |
| `penaltyGraceDays` | integer | No | Grace period before penalties |
| `lines` | array | Yes | Array of line items (minimum 1) |

### Line Item Object

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `description` | string | Yes | Line item description |
| `quantity` | number | Yes | Quantity (must be > 0) |
| `unitPrice` | number | Yes | Price per unit |
| `vatRateId` | string | Yes | UUID of VAT rate |
| `unitOfMeasure` | string | No | Unit of measure code (default: "buc") |
| `productId` | string | No | UUID of linked product |
| `priceRule` | string | No | `fixed`, `exchange_rate`, or `markup` (default: "fixed") |
| `referenceCurrency` | string | Conditional | Required if priceRule is `exchange_rate` |
| `markupPercent` | number | Conditional | Required if priceRule is `markup` |

## Response

Returns the created recurring invoice object with a `201 Created` status.

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/recurring-invoices' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "clientId": "client-uuid-1",
    "seriesId": "series-uuid-1",
    "reference": "MONTHLY-HOSTING-001",
    "documentType": "invoice",
    "currency": "RON",
    "invoiceTypeCode": "380",
    "frequency": "monthly",
    "frequencyDay": 1,
    "nextIssuanceDate": "2026-03-01",
    "dueDateType": "relative",
    "dueDateDays": 30,
    "notes": "Monthly hosting services",
    "paymentTerms": "Payment due within 30 days",
    "autoEmailEnabled": true,
    "autoEmailTime": "09:00",
    "penaltyEnabled": true,
    "penaltyPercentPerDay": 0.05,
    "penaltyGraceDays": 5,
    "lines": [
      {
        "description": "Cloud Hosting - Business Plan",
        "quantity": 1,
        "unitPrice": 1499.00,
        "vatRateId": "vat-uuid-1",
        "unitOfMeasure": "buc",
        "productId": "product-uuid-1",
        "priceRule": "fixed"
      }
    ]
  }'
```

## Example Response

```json
{
  "uuid": "rec-inv-uuid-1",
  "reference": "MONTHLY-HOSTING-001",
  "clientId": "client-uuid-1",
  "seriesId": "series-uuid-1",
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
  "createdAt": "2026-02-16T10:30:00Z",
  "updatedAt": "2026-02-16T10:30:00Z"
}
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- Missing required fields (`clientId`, `seriesId`, `documentType`, `currency`, `frequency`, `nextIssuanceDate`, `dueDateType`)
- Invalid frequency value
- Invalid frequencyDay (must be 1-31)
- Missing dueDateDays when dueDateType is `relative`
- Missing dueDateFixedDay when dueDateType is `fixed`
- Empty lines array
- Invalid line item data (missing description, quantity ≤ 0, negative unitPrice)
- Invalid currency code
- Client or series not found or doesn't belong to company

## Related Endpoints

- [List recurring invoices](/api-reference/recurring-invoices/list)
- [Get recurring invoice](/api-reference/recurring-invoices/get)
- [Update recurring invoice](/api-reference/recurring-invoices/update)
