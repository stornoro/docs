---
title: Update recurring invoice
description: Update an existing recurring invoice template.
---

# Update recurring invoice

Updates a recurring invoice template. Only the fields you send change. When `lines` is sent it replaces all existing lines.

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
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

All parameters are optional. A `null` clears `clientId`, `documentSeriesId`, `stopDate`, `balance` and `balanceStep`. The fields have the same meaning as on [create](/api-reference/recurring-invoices/create).

| Parameter | Type | Description |
|-----------|------|-------------|
| `clientId` | string \| null | UUID of the client. An unknown client returns `400` |
| `documentSeriesId` | string \| null | UUID of the document series. A series that is not found is ignored |
| `reference` | string | Human-readable reference |
| `documentType` | string | `invoice`, `credit_note` or `proforma` |
| `currency` | string | ISO 4217 currency code |
| `invoiceTypeCode` | string \| null | Invoice type name copied to generated invoices |
| `isActive` | boolean | Enable or disable generation |
| `frequency` | string | `once`, `weekly`, `monthly`, `bimonthly`, `quarterly`, `semi_annually` or `yearly` |
| `frequencyDay` | integer | Day of the week (1-7) for `weekly`, day of the month otherwise. Values above 28 are reduced to 28 for the month-based frequencies |
| `frequencyMonth` | integer \| null | Month (1-12) for `yearly` |
| `nextIssuanceDate` | string | `YYYY-MM-DD`. A date in the past returns `400` |
| `stopDate` | string \| null | Date after which nothing is generated |
| `dueDateType` | string \| null | `days` or `fixed_day` |
| `dueDateDays` | integer \| null | Days after the issue date, with `days` |
| `dueDateFixedDay` | integer \| null | Day of the month, with `fixed_day` |
| `notes` | string \| null | Notes printed on generated documents, with [template placeholders](/api-reference/recurring-invoices/create#template-placeholders) |
| `balance` | number \| null | Running balance in RON |
| `balanceStep` | string \| null | Expression deducted per issuance, e.g. `1900*curs` |
| `paymentTerms` | string \| null | Payment terms text |
| `autoEmailEnabled` | boolean | Schedule the email of each generated invoice |
| `autoEmailTime` | string \| null | Time to send, `HH:MM` |
| `autoEmailDayOffset` | integer | Days after the issue date |
| `penaltyEnabled` | boolean | Enable late payment penalties |
| `penaltyPercentPerDay` | number \| null | Daily penalty percentage |
| `penaltyGraceDays` | integer \| null | Grace period before penalties |
| `lines` | array | Line items. Replaces all existing lines |

### Line Item Object

The line fields are those of [create](/api-reference/recurring-invoices/create#line-item-object).

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
| `priceRule` | string | No | `fixed` (default), `updated_product`, `bnr_rate`, `bnr_rate_markup` or `expression` |
| `referenceCurrency` | string | No | Currency the price is expressed in. When set and the template currency is RON, the price is converted at the BNR rate of the issue date |
| `markupPercent` | number | No | Markup applied on the converted price |
| `priceExpression` | string | No | With `expression`: the unit price computed at issuance |

> **VAT on a line.** Send `vatRate` (a percentage) or `vatRateId` (the id of one of the company's rates from `GET /api/v1/vat-rates`; the line takes that rate's percentage and category). When both are sent `vatRate` wins. When neither is sent the line gets **21%**, also when the issuing company is not a VAT payer. For a company that is not a VAT payer send `vatRate: "0.00"` on every line. A `vatRateId` that is not a rate of the company is refused with an error; it never falls back to 21%.

## Response

Returns the updated recurring invoice, in the shape described on [Get recurring invoice](/api-reference/recurring-invoices/get).

Update does not check `frequency`, `frequencyDay`, the due date fields or `autoEmailTime` the way create does. Send values that are valid for create.

## Example Request

```bash
curl -X PUT 'https://api.storno.ro/api/v1/recurring-invoices/rec-inv-uuid-1' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
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
        "vatRate": 19,
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
  "reference": "MONTHLY-HOSTING-002",
  "documentType": "invoice",
  "currency": "RON",
  "invoiceTypeCode": null,
  "frequency": "monthly",
  "frequencyDay": 1,
  "frequencyMonth": null,
  "nextIssuanceDate": "2026-04-01T00:00:00+00:00",
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
  "penaltyPercentPerDay": "0.10",
  "penaltyGraceDays": 5,
  "lines": [
    {
      "id": "line-uuid-2",
      "productId": "product-uuid-2",
      "productName": "Cloud Hosting",
      "position": 1,
      "description": "Cloud Hosting - Business Plan",
      "quantity": "1.0000",
      "unitOfMeasure": "buc",
      "unitPrice": "2499.00",
      "vatRate": "19",
      "vatCategoryCode": "S",
      "vatAmount": "474.81",
      "lineTotal": "2499.00",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "priceRule": "fixed",
      "referenceCurrency": null,
      "markupPercent": null,
      "priceExpression": null
    }
  ],
  "subtotal": "2499.00",
  "vatTotal": "474.81",
  "total": "2973.81",
  "estimatedSubtotal": "2499.00",
  "estimatedVatTotal": "474.81",
  "estimatedTotal": "2973.81"
}
```

## Errors

Errors have the form `{"error": "message"}`.

| Status | Description |
|--------|-------------|
| 400 | `nextIssuanceDate` in the past, unknown client or product, a `vatRateId` that is not a rate of the company, or an invalid value |
| 401 | Missing or invalid authentication token |
| 402 | Recurring invoices are not available on the plan. Body has `"code": "PLAN_LIMIT"` |
| 403 | Missing permission |
| 404 | Recurring invoice not found |

## Related Endpoints

- [Get recurring invoice](/api-reference/recurring-invoices/get)
- [Create recurring invoice](/api-reference/recurring-invoices/create)
- [Toggle recurring invoice](/api-reference/recurring-invoices/toggle)
