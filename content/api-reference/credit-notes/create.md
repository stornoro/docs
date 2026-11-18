---
title: Create Credit Note
description: Create a credit note that reverses or partially reverses an invoice
method: POST
endpoint: /api/v1/invoices
---

# Create Credit Note

Creates a credit note as a draft invoice with `documentType: "credit_note"` and a reference to the original invoice. Credit notes have no endpoint of their own: they are created with `POST /api/v1/invoices`, the same endpoint and body as an invoice.

{% callout type="info" %}
A credit note is not the only way to refund. `POST /api/v1/invoices/bulk-storno` creates a full reversal of an issued invoice, and a regular invoice with negative quantities works without any link to a parent. See the [Refund an invoice](/api-reference/invoices/refund) guide.
{% /callout %}

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request. Optional when the organization has a single company |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

The body is the invoice body described in [Create invoice](/api-reference/invoices/create). The fields that make the document a credit note:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `documentType` | string | No | Send `credit_note`. Without it the document is created as a regular `invoice` |
| `parentDocumentId` | string | No | Id of the original invoice. It must belong to the same company; an id that is not found or belongs to another company is ignored without an error and the credit note is created without a parent |
| `documentSeriesId` | string | No | Id of the series to number the credit note from. Without it the company's default series of type `credit_note` is used. The number is assigned when the credit note is issued |
| `clientId` | string | No | Id of the client. Alternatively send `receiverName` and `receiverCif` |
| `issueDate` | string | No | Date of issue (YYYY-MM-DD). Defaults to today; a future date is refused |
| `dueDate` | string | No | Due date (YYYY-MM-DD) |
| `currency` | string | No | Currency code. Defaults to the company currency |
| `exchangeRate` | number | No | Exchange rate |
| `invoiceTypeCode` | string | No | One of `standard`, `reverse_charge`, `exempt_with_deduction`, `services_art_311`, `sales_art_312`, `non_taxable`, `special_regime_art_314_315`, `non_transfer`, `simplified`, `services_art_278`, `exempt_art_294_ab`, `exempt_art_294_cd`, `self_billing`. Any other value is refused. Not set when omitted |
| `notes` | string | No | Public notes explaining the credit |
| `paymentTerms` | string | No | Payment or refund terms |
| `issuerName` | string | No | Name of the person issuing the credit note |
| `issuerId` | string | No | Issuer identification number |
| `mentions` | string | No | Additional mentions |
| `internalNote` | string | No | Internal note (not visible to the client) |
| `lines` | array | Yes | Array of line items (minimum 1 item) |

### Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Item description (typically from the original invoice) |
| `quantity` | number | Yes | Must not be zero. Use a negative quantity to credit |
| `unitPrice` | number | Yes | Must not be negative. Keep it positive and credit with a negative `quantity` |
| `vatRate` | number | No | VAT rate percentage. Default 21.00 when neither `vatRate` nor `vatRateId` is sent, whatever the VAT status of the company |
| `vatCategoryCode` | string | No | UBL VAT category code (default `S`; a 0% rate becomes `Z` on its own) |
| `vatRateId` | string | No | Id of one of the company's VAT rates (`GET /api/v1/vat-rates`). The line takes its percentage and category. Ignored when `vatRate` is sent; an error when it is not a rate of the company |
| `unitOfMeasure` | string | No | Unit of measure (default `buc`) |
| `productId` | string | No | Id of a product of the company |
| `discount` | number | No | Fixed amount subtracted from the line (`quantity * unitPrice - discount`) |
| `discountPercent` | number | No | Discount percentage |
| `vatIncluded` | boolean | No | Whether the unit price includes VAT (default: false) |

> **VAT on a line.** Send `vatRate` (a percentage) or `vatRateId` (the id of one of the company's rates from `GET /api/v1/vat-rates`; the line takes that rate's percentage and category). When both are sent `vatRate` wins. When neither is sent the line gets **21%**, also when the issuing company is not a VAT payer. For a company that is not a VAT payer send `vatRate: "0.00"` on every line. A `vatRateId` that is not a rate of the company is refused with an error; it never falls back to 21%.

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "credit_note",
    "parentDocumentId": "650e8400-e29b-41d4-a716-446655440111",
    "clientId": "750e8400-e29b-41d4-a716-446655440000",
    "documentSeriesId": "760e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-20",
    "dueDate": "2026-03-20",
    "currency": "RON",
    "notes": "Partial refund - hosting services cancelled by client request",
    "paymentTerms": "Immediate refund",
    "issuerName": "John Doe",
    "mentions": "Credit note for invoice FAC0045",
    "internalNote": "Client cancelled annual hosting, refund via original payment method",
    "lines": [
      {
        "description": "Hosting Services - Annual (CREDIT)",
        "quantity": -1,
        "unitPrice": 1000,
        "unitOfMeasure": "service",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "productId": "460e8400-e29b-41d4-a716-446655440000",
        "vatIncluded": false
      }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/invoices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    documentType: 'credit_note',
    parentDocumentId: '650e8400-e29b-41d4-a716-446655440111',
    clientId: '750e8400-e29b-41d4-a716-446655440000',
    documentSeriesId: '760e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-20',
    dueDate: '2026-03-20',
    currency: 'RON',
    notes: 'Partial refund - hosting services cancelled by client request',
    paymentTerms: 'Immediate refund',
    issuerName: 'John Doe',
    mentions: 'Credit note for invoice FAC0045',
    internalNote: 'Client cancelled annual hosting, refund via original payment method',
    lines: [
      {
        description: 'Hosting Services - Annual (CREDIT)',
        quantity: -1,
        unitPrice: 1000,
        unitOfMeasure: 'service',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        productId: '460e8400-e29b-41d4-a716-446655440000',
        vatIncluded: false
      }
    ]
  })
});
const data = await response.json();
```

## Response

`201 Created` with the invoice object and the UBL validation result. Amounts are strings and dates are ISO 8601 date-times. A credit note with a negative total is settled at creation: `amountPaid` equals `total` and `balance` is `"0.00"`.

```json
{
  "invoice": {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "number": "DRAFT-0a1b2c3d",
    "documentType": "credit_note",
    "status": "draft",
    "direction": "outgoing",
    "documentSeries": {
      "id": "760e8400-e29b-41d4-a716-446655440000",
      "prefix": "CN",
      "nextNumber": "CN0006"
    },
    "client": {
      "id": "750e8400-e29b-41d4-a716-446655440000",
      "name": "Client SRL",
      "cui": "12345678",
      "country": "RO",
      "email": "contact@client.ro"
    },
    "parentDocumentId": "650e8400-e29b-41d4-a716-446655440111",
    "parentDocumentNumber": "FAC0045",
    "parentDocumentDate": "2026-02-18",
    "issueDate": "2026-02-20T00:00:00+00:00",
    "dueDate": "2026-03-20T00:00:00+00:00",
    "currency": "RON",
    "notes": "Partial refund - hosting services cancelled by client request",
    "paymentTerms": "Immediate refund",
    "issuerName": "John Doe",
    "mentions": "Credit note for invoice FAC0045",
    "internalNote": "Client cancelled annual hosting, refund via original payment method",
    "lines": [
      {
        "id": "910e8400-e29b-41d4-a716-446655440000",
        "position": 1,
        "description": "Hosting Services - Annual (CREDIT)",
        "quantity": "-1",
        "unitOfMeasure": "service",
        "unitPrice": "1000",
        "vatRate": "19.00",
        "vatCategoryCode": "S",
        "vatAmount": "-190.00",
        "lineTotal": "-1000.00",
        "discount": "0.00",
        "discountPercent": "0.00",
        "vatIncluded": false,
        "productId": "460e8400-e29b-41d4-a716-446655440000"
      }
    ],
    "subtotal": "-1000.00",
    "vatTotal": "-190.00",
    "discount": "0.00",
    "total": "-1190.00",
    "amountPaid": "-1190.00",
    "balance": "0.00"
  },
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "schematronAvailable": true
  }
}
```

## After creation

The credit note is a draft. [Issue it](/api-reference/invoices/issue) to assign the number: because it has a parent, its status becomes `refund` and the status of the parent invoice becomes `refunded`, whatever the amount credited. Issuing a credit note also sets `paidAt`. Submit an issued credit note to ANAF with [Submit invoice](/api-reference/invoices/submit).

## Error codes

Errors have the body `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `400` | Missing or invalid lines (`At least one line is required.`, `Line 0: description is required.`, `Line 0: quantity must be non-zero.`, `Line 0: unitPrice must be non-negative.`), client not found, `vatRateId` that is not a rate of the company, invalid `invoiceTypeCode`, future `issueDate` |
| `401` | Missing or invalid authentication token |
| `402` | Monthly invoice limit of the plan reached. The body has `"code": "PLAN_LIMIT"` and `limit` |
| `403` | The user lacks the permission to create invoices |
| `404` | `Company not found.`: the `X-Company` company does not exist or is not accessible |

## Credit note scenarios

### Full refund

Send every line of the original invoice with its quantity negated. To reverse an invoice in full without composing the lines, use [`POST /invoices/bulk-storno`](/api-reference/invoices/refund#option-2-storno-of-an-issued-invoice).

### Partial refund

Send only the lines to credit:

```json
{
  "lines": [
    { "description": "Hosting Services - Annual", "quantity": -1, "unitPrice": 1000, "vatRate": "19.00" }
  ]
}
```

### Quantity adjustment

Credit part of a quantity:

```json
{
  "lines": [
    { "description": "Web Development Services", "quantity": -10, "unitPrice": 150, "vatRate": "19.00" }
  ]
}
```

### Error correction

Create a credit note for the original lines, then create a new invoice with the correct data.

## Next steps

- [Get credit note](/api-reference/credit-notes/get)
- [List credit notes](/api-reference/credit-notes/list)
- [Update credit note](/api-reference/credit-notes/update)
- [Issue invoice](/api-reference/invoices/issue)
