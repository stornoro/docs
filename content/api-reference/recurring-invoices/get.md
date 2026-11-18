---
title: Get recurring invoice
description: Retrieve details of a specific recurring invoice including all line items.
---

# Get recurring invoice

Retrieves a recurring invoice with the line items used as a template for generated documents.

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

## Response

Returns the recurring invoice object.

## Recurring invoice object

Decimal amounts are strings and dates are ISO 8601 date-times. The object has `id`, not `uuid`. `client` is an embedded object. The series is not included, and `createdAt` and `updatedAt` are not returned.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Recurring invoice UUID |
| `client` | object \| null | Embedded client |
| `reference` | string \| null | Human-readable reference |
| `documentType` | string | `invoice`, `credit_note` or `proforma` |
| `currency` | string | ISO 4217 currency code |
| `invoiceTypeCode` | string \| null | Invoice type copied to generated invoices |
| `frequency` | string | `once`, `weekly`, `monthly`, `bimonthly`, `quarterly`, `semi_annually` or `yearly` |
| `frequencyDay` | integer | Day of the week (1-7) for `weekly`, day of the month (1-28) otherwise |
| `frequencyMonth` | integer \| null | Month (1-12) for `yearly` |
| `nextIssuanceDate` | string \| null | Date of the next issuance |
| `stopDate` | string \| null | Date after which nothing is generated |
| `dueDateType` | string \| null | `days` or `fixed_day` |
| `dueDateDays` | integer \| null | Days after the issue date, with `days` |
| `dueDateFixedDay` | integer \| null | Day of the month, with `fixed_day` |
| `isActive` | boolean | Whether generation is enabled |
| `lastIssuedAt` | string \| null | When the last document was generated |
| `lastInvoiceNumber` | string \| null | Number of the last generated document |
| `lastInvoiceId` | string \| null | Id of the last generated document |
| `lastDocumentType` | string \| null | `invoice` or `proforma` |
| `notes` | string \| null | Notes printed on generated documents |
| `paymentTerms` | string \| null | Payment terms text |
| `balance` | string \| null | Running balance |
| `balanceStep` | string \| null | Expression deducted per issuance |
| `autoEmailEnabled` | boolean | Email scheduling on generated invoices |
| `autoEmailTime` | string \| null | Time to send, `HH:MM` |
| `autoEmailDayOffset` | integer | Days after the issue date |
| `penaltyEnabled` | boolean | Late payment penalty enabled |
| `penaltyPercentPerDay` | string \| null | Daily penalty percentage |
| `penaltyGraceDays` | integer \| null | Grace period before penalties |
| `lines` | array | Line items |
| `subtotal`, `vatTotal`, `total` | string | Sums of the lines |
| `estimatedSubtotal`, `estimatedVatTotal`, `estimatedTotal` | string | Totals with reference-currency lines converted at today's rate; equal to the totals above when no line has a reference currency |

### Line item object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Line UUID |
| `productId` | string \| null | Linked product |
| `productName` | string \| null | Name of the linked product |
| `position` | integer | Display order |
| `description` | string | Description, may contain placeholders |
| `quantity` | string | Quantity |
| `unitOfMeasure` | string | Unit of measure code |
| `unitPrice` | string | Unit price |
| `vatRate` | string | VAT percentage |
| `vatCategoryCode` | string | UBL VAT category code |
| `vatAmount` | string | VAT amount of the line |
| `lineTotal` | string | Line amount before VAT |
| `discount` | string | Discount amount |
| `discountPercent` | string | Discount percentage |
| `vatIncluded` | boolean | Whether the unit price includes VAT |
| `priceRule` | string | `fixed`, `updated_product`, `bnr_rate`, `bnr_rate_markup` or `expression` |
| `referenceCurrency` | string \| null | Currency of the price for BNR conversion |
| `markupPercent` | string \| null | Markup percentage |
| `priceExpression` | string \| null | Expression with `expression` |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/recurring-invoices/rec-inv-uuid-1' \
  -H 'Authorization: Bearer YOUR_TOKEN'
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
  "reference": "MONTHLY-001",
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
| 401 | Missing or invalid authentication token |
| 403 | Missing permission |
| 404 | Recurring invoice not found |

## Related Endpoints

- [List recurring invoices](/api-reference/recurring-invoices/list)
- [Update recurring invoice](/api-reference/recurring-invoices/update)
- [Issue now](/api-reference/recurring-invoices/issue-now)
