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
| `notes` | string | No | Notes printed on every generated document; see [Template placeholders](#template-placeholders) |
| `paymentTerms` | string | No | Payment terms text |
| `balance` | number | No | Running balance in RON, reduced on every issuance by `balanceStep` and printed with `[[sold]]`; the template pauses when it reaches zero |
| `balanceStep` | string | No | Expression deducted per issuance, e.g. `1900*curs` (1,900 EUR at the BNR rate of the issue date); the last deduction is capped at what is left |
| `autoEmailEnabled` | boolean | No | Auto-send email on generation (default: false) |
| `autoEmailTime` | string | No | Time to send (HH:mm, default: "09:00") |
| `autoEmailDayOffset` | integer | No | Days offset for email sending (default: 0) |
| `penaltyEnabled` | boolean | No | Enable late payment penalties (default: false) |
| `penaltyPercentPerDay` | number | No | Daily penalty percentage |
| `penaltyGraceDays` | integer | No | Grace period before penalties |
| `lines` | array | Yes | Array of line items (minimum 1) |

### Template placeholders

`notes` and every line `description` are rendered when a document is issued:

| Placeholder | Value |
|---|---|
| `[[luna]]`, `[[luna-1]]`, `[[luna+1]]` | the month in Romanian, with an offset in months |
| `[[luna_nr]]`, `[[an]]` (also `±N`) | month number (`01`–`12`), year |
| `[[curs]]` | the BNR rate note of the issue date for every currency used, e.g. `Curs BNR 20.10.2026: 1 EUR = 5.0700 RON` |
| `[[suma:EXPR]]` | an amount computed from `EXPR` with `+ - * /` and parentheses, e.g. `[[suma:1900*curs]]`. Names: `curs` (the BNR rate of the first reference currency of the lines, EUR when there is none), `curs_EUR`, `curs_USD`…, `sold`, `sold_anterior`, `rata`, `luna_nr`, `an` |
| `[[sold]]` | with a running `balance`: what is left after this invoice |
| `[[sold_anterior]]` | the balance before this invoice |
| `[[rata]]` | what this invoice deducts: `balanceStep` evaluated, never more than what is left |

Amounts print in Romanian format (`9.633,00`). A reduction that must also lower the total goes on the line as a fixed `discount` — converted with the line's `referenceCurrency` like the price — while the note explains it:

```json
{
  "notes": "Reducere chirie conform Act adițional nr. 1 (1.900 EUR la curs BNR din data facturii): [[suma:1900*curs]] lei; sold investiție rămas: [[sold]] lei.\n[[curs]]",
  "balance": "38532.00",
  "balanceStep": "1900*curs",
  "lines": [{ "description": "Chirie [[luna]] [[an]]", "quantity": "1", "unitPrice": "3000.00", "discount": "1900.00", "referenceCurrency": "EUR", "vatRate": "0", "vatCategoryCode": "E" }]
}
```

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
