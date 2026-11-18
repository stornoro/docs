---
title: Create recurring invoice
description: Create a new recurring invoice template that will automatically generate invoices.
---

# Create recurring invoice

Creates a new recurring invoice template. The system generates and issues a document on each scheduled date.

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
| `clientId` | string | No | UUID of the client. An unknown client returns `400` |
| `documentSeriesId` | string | No | UUID of the document series used for the generated documents. A series that is not found is ignored |
| `reference` | string | No | Human-readable reference |
| `documentType` | string | No | `invoice` (default), `credit_note` or `proforma`. A `proforma` template creates a proforma, sends it and accepts it on every run |
| `currency` | string | No | ISO 4217 currency code. Default `RON` |
| `invoiceTypeCode` | string | No | Invoice type name copied to every generated invoice, for example `standard`. Leave it out for the default |
| `frequency` | string | Yes | `once`, `weekly`, `monthly`, `bimonthly`, `quarterly`, `semi_annually` or `yearly` |
| `frequencyDay` | integer | Yes | Day of the week (1-7) for `weekly`. Day of the month (1-28) for every other frequency |
| `frequencyMonth` | integer | Conditional | Month (1-12). Required when `frequency` is `yearly` |
| `nextIssuanceDate` | string | Yes | Date of the first issuance, `YYYY-MM-DD`. Not in the past |
| `stopDate` | string | No | Date after which no more documents are generated, `YYYY-MM-DD` |
| `dueDateType` | string | No | `days` (due date is `dueDateDays` days after the issue date) or `fixed_day` (due on `dueDateFixedDay` of the month, moved to the next month when that day has passed). Without it the generated document has no due date |
| `dueDateDays` | integer | Conditional | Used with `days` |
| `dueDateFixedDay` | integer | Conditional | Used with `fixed_day`, 1-28 |
| `notes` | string | No | Notes printed on every generated document; see [Template placeholders](#template-placeholders) |
| `paymentTerms` | string | No | Payment terms text |
| `balance` | number | No | Running balance in RON, reduced on every issuance by `balanceStep` and printed with `[[sold]]`; the template pauses when it reaches zero |
| `balanceStep` | string | No | Expression deducted per issuance, e.g. `1900*curs` (1,900 EUR at the BNR rate of the issue date); the last deduction is capped at what is left |
| `autoEmailEnabled` | boolean | No | Schedule the email of each generated invoice (default: false) |
| `autoEmailTime` | string | No | Time to send, `HH:MM` (default: "09:00") |
| `autoEmailDayOffset` | integer | No | Days after the issue date to send (default: 0) |
| `penaltyEnabled` | boolean | No | Enable late payment penalties (default: false) |
| `penaltyPercentPerDay` | number | No | Daily penalty percentage, not negative |
| `penaltyGraceDays` | integer | No | Grace period before penalties, not negative |
| `lines` | array | Yes | Array of line items (minimum 1) |

Each run creates the document and issues it at once (status `issued`, number taken from the series). When the company has `efacturaDelayHours` set and the client is Romanian, the e-Factura submission is scheduled as for any issued invoice.

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

Amounts print in Romanian format (`9.633,00`). A reduction that must also lower the total is best expressed as the line price itself (`priceRule: expression`), so the deduction and the price always agree, including the last month; a fixed `discount` converted with the line's `referenceCurrency` works too while the balance is larger than the step:

```json
{
  "notes": "Reducere chirie conform Act adițional nr. 1 (1.900 EUR la curs BNR din data facturii): [[suma:1900*curs]] lei; sold investiție rămas: [[sold]] lei.\n[[curs]]",
  "balance": "38532.00",
  "balanceStep": "1900*curs",
  "lines": [{ "description": "Chirie [[luna]] [[an]]", "quantity": "1", "unitPrice": "0", "priceRule": "expression", "priceExpression": "2000*curs - rata", "vatRate": "0", "vatCategoryCode": "E" }]
}
```

### Line Item Object

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `description` | string | Yes | Line item description |
| `quantity` | number | Yes | Quantity (must be > 0) |
| `unitPrice` | number | Yes | Price per unit |
| `vatRate` | number | No | VAT rate percentage. Default 21.00 when neither `vatRate` nor `vatRateId` is sent, whatever the VAT status of the company |
| `vatCategoryCode` | string | No | UBL VAT category code (default `S`; a 0% rate becomes `Z` on its own) |
| `vatRateId` | string | No | Id of one of the company's VAT rates (`GET /api/v1/vat-rates`). The line takes its percentage and category. Ignored when `vatRate` is sent; an error when it is not a rate of the company |
| `unitOfMeasure` | string | No | Unit of measure code (default: "buc") |
| `productId` | string | No | UUID of linked product |
| `priceRule` | string | No | `fixed` (default), `updated_product` (refresh the linked product's price), `bnr_rate` (convert from `referenceCurrency` at the BNR rate of the issue date), `bnr_rate_markup` (same plus `markupPercent`), `expression` (compute the price from `priceExpression`) |
| `referenceCurrency` | string | Conditional | Currency the line price is expressed in. When it is set and the template currency is RON, the price is converted at the BNR rate of the issue date (and multiplied by `markupPercent` when set), whatever `priceRule` says. The line `discount` is converted the same way |
| `markupPercent` | number | Conditional | With `bnr_rate_markup` |
| `priceExpression` | string | Conditional | With `expression`: the unit price in the document currency, computed at issuance with the [placeholder names](#template-placeholders), e.g. `2000*curs - rata` (2,000 EUR at the BNR rate minus what this issuance deducts from the running balance, so the last month settles exactly what is left). Negative results become 0 |

> **VAT on a line.** Send `vatRate` (a percentage) or `vatRateId` (the id of one of the company's rates from `GET /api/v1/vat-rates`; the line takes that rate's percentage and category). When both are sent `vatRate` wins. When neither is sent the line gets **21%**, also when the issuing company is not a VAT payer. For a company that is not a VAT payer send `vatRate: "0.00"` on every line. A `vatRateId` that is not a rate of the company is refused with an error; it never falls back to 21%.

## Response

Returns the created recurring invoice with a `201 Created` status. Decimal amounts are strings. The object has `id`, not `uuid`, and carries `client` (an object) instead of `clientId`. The series is not included. `createdAt` and `updatedAt` are not returned.

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/recurring-invoices' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "clientId": "client-uuid-1",
    "documentSeriesId": "series-uuid-1",
    "reference": "MONTHLY-HOSTING-001",
    "documentType": "invoice",
    "currency": "RON",
    "frequency": "monthly",
    "frequencyDay": 1,
    "nextIssuanceDate": "2026-03-01",
    "dueDateType": "days",
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
        "vatRate": 19,
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
  "id": "rec-inv-uuid-1",
  "client": {
    "id": "client-uuid-1",
    "type": "company",
    "name": "Acme Corporation SRL",
    "cui": "12345678",
    "city": "Bucuresti",
    "country": "RO",
    "email": "contact@acme.ro"
  },
  "reference": "MONTHLY-HOSTING-001",
  "documentType": "invoice",
  "currency": "RON",
  "invoiceTypeCode": null,
  "frequency": "monthly",
  "frequencyDay": 1,
  "frequencyMonth": null,
  "nextIssuanceDate": "2026-03-01T00:00:00+00:00",
  "stopDate": null,
  "dueDateType": "days",
  "dueDateDays": 30,
  "dueDateFixedDay": null,
  "isActive": true,
  "lastIssuedAt": null,
  "lastInvoiceNumber": null,
  "lastInvoiceId": null,
  "lastDocumentType": null,
  "notes": "Monthly hosting services",
  "paymentTerms": "Payment due within 30 days",
  "balance": null,
  "balanceStep": null,
  "autoEmailEnabled": true,
  "autoEmailTime": "09:00",
  "autoEmailDayOffset": 0,
  "penaltyEnabled": true,
  "penaltyPercentPerDay": "0.05",
  "penaltyGraceDays": 5,
  "lines": [
    {
      "id": "line-uuid-1",
      "productId": "product-uuid-1",
      "productName": "Cloud Hosting",
      "position": 1,
      "description": "Cloud Hosting - Business Plan",
      "quantity": "1.0000",
      "unitOfMeasure": "buc",
      "unitPrice": "1499.00",
      "vatRate": "19",
      "vatCategoryCode": "S",
      "vatAmount": "284.81",
      "lineTotal": "1499.00",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "priceRule": "fixed",
      "referenceCurrency": null,
      "markupPercent": null,
      "priceExpression": null
    }
  ],
  "subtotal": "1499.00",
  "vatTotal": "284.81",
  "total": "1783.81",
  "estimatedSubtotal": "1499.00",
  "estimatedVatTotal": "284.81",
  "estimatedTotal": "1783.81"
}
```

## Errors

Errors have the form `{"error": "message"}`.

| Status | Description |
|--------|-------------|
| 400 | Validation failed: invalid `frequency`, `frequencyDay` outside its range, missing `frequencyMonth` for `yearly`, missing `frequencyDay` or `nextIssuanceDate`, `nextIssuanceDate` in the past, no lines, a line without description, with quantity not above 0 or with a negative price, invalid `autoEmailTime`, negative penalty values, an invalid expression, unknown client, unknown product, or a `vatRateId` that is not a rate of the company |
| 401 | Missing or invalid authentication token |
| 402 | Recurring invoices are not available on the plan. Body has `"code": "PLAN_LIMIT"` |
| 403 | Missing permission |
| 404 | Company not found |

## Related Endpoints

- [List recurring invoices](/api-reference/recurring-invoices/list)
- [Get recurring invoice](/api-reference/recurring-invoices/get)
- [Update recurring invoice](/api-reference/recurring-invoices/update)
