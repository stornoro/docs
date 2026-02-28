---
title: Update recurring invoice
description: Update an existing recurring invoice template.
---

# Update recurring invoice

Updates an existing recurring invoice template. All fields are optional, but at least one must be provided.

```http
PUT /api/v1/recurring-invoices/{uuid}
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
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

All parameters are optional, but at least one must be provided.

| Parameter | Type | Description |
|-----------|------|-------------|
| `clientId` | string | UUID of the client |
| `seriesId` | string | UUID of the document series |
| `reference` | string | Human-readable reference |
| `documentType` | string | `invoice` or `credit_note` |
| `currency` | string | ISO 4217 currency code |
| `invoiceTypeCode` | string | e-Factura invoice type code |
| `frequency` | string | `weekly`, `biweekly`, `monthly`, `bimonthly`, `quarterly`, `semiannual`, `annual` |
| `frequencyDay` | integer | Day of month for generation (1-31) |
| `frequencyMonth` | integer | Month for annual generation (1-12) |
| `nextIssuanceDate` | string | ISO 8601 date for next invoice |
| `stopDate` | string \| null | ISO 8601 date to stop generation (null to remove) |
| `dueDateType` | string | `fixed` or `relative` |
| `dueDateDays` | integer | Days after issue for relative due date |
| `dueDateFixedDay` | integer | Fixed day of month (1-31) |
| `notes` | string \| null | Internal notes |
| `paymentTerms` | string \| null | Payment terms text |
| `autoEmailEnabled` | boolean | Auto-send email on generation |
| `autoEmailTime` | string | Time to send (HH:mm) |
| `autoEmailDayOffset` | integer | Days offset for email sending |
| `penaltyEnabled` | boolean | Enable late payment penalties |
| `penaltyPercentPerDay` | number | Daily penalty percentage |
| `penaltyGraceDays` | integer | Grace period before penalties |
| `lines` | array | Array of line items |

### Line Item Object

When updating lines, the entire lines array must be provided (it replaces existing lines).

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

Returns the updated recurring invoice object.

## Example Request

```bash
curl -X PUT 'https://api.storno.ro/api/v1/recurring-invoices/rec-inv-uuid-1' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "reference": "MONTHLY-HOSTING-002",
    "nextIssuanceDate": "2026-04-01",
    "penaltyPercentPerDay": 0.10,
    "lines": [
      {
        "description": "Cloud Hosting - Premium Plan",
        "quantity": 1,
        "unitPrice": 2499.00,
        "vatRateId": "vat-uuid-1",
        "unitOfMeasure": "buc",
        "productId": "product-uuid-2",
        "priceRule": "fixed"
      }
    ]
  }'
```

## Example Response

```json
{
  "uuid": "rec-inv-uuid-1",
  "reference": "MONTHLY-HOSTING-002",
  "clientId": "client-uuid-1",
  "seriesId": "series-uuid-1",
  "documentType": "invoice",
  "currency": "RON",
  "invoiceTypeCode": "380",
  "frequency": "monthly",
  "frequencyDay": 1,
  "frequencyMonth": null,
  "nextIssuanceDate": "2026-04-01",
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
  "penaltyPercentPerDay": 0.10,
  "penaltyGraceDays": 5,
  "lines": [
    {
      "uuid": "line-uuid-2",
      "description": "Cloud Hosting - Premium Plan",
      "quantity": 1,
      "unitPrice": 2499.00,
      "vatRateId": "vat-uuid-1",
      "vatRate": 19,
      "vatAmount": 474.81,
      "totalAmount": 2973.81,
      "unitOfMeasure": "buc",
      "productId": "product-uuid-2",
      "priceRule": "fixed",
      "referenceCurrency": null,
      "markupPercent": null,
      "position": 1
    }
  ],
  "subtotal": 2499.00,
  "vatTotal": 474.81,
  "totalAmount": 2973.81,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-02-16T11:45:00Z"
}
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Recurring invoice not found or doesn't belong to company |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- No fields provided for update
- Invalid frequency value
- Invalid frequencyDay (must be 1-31)
- Invalid date format
- Empty lines array
- Invalid line item data
- Client or series not found

## Related Endpoints

- [Get recurring invoice](/api-reference/recurring-invoices/get)
- [Delete recurring invoice](/api-reference/recurring-invoices/delete)
- [Toggle recurring invoice](/api-reference/recurring-invoices/toggle)
