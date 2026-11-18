---
title: Create Proforma Invoice
description: Create a new proforma invoice with line items
method: POST
endpoint: /api/v1/proforma-invoices
---

# Create Proforma Invoice

Creates a new proforma invoice in draft status. The proforma can be edited only while it is a draft.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lines` | array | Yes | Array of line items (minimum 1 item) |
| `clientId` | string | No | UUID of a client of the company |
| `documentSeriesId` | string | No | UUID of a document series of the company. The number is taken from it when the proforma is created (prefix plus a 4-digit counter, e.g. `PRO0001`). Without it the proforma gets a temporary `PRO-xxxxxxxx` number; no default series is applied |
| `issueDate` | string | No | Date of issue (YYYY-MM-DD). Default: today |
| `dueDate` | string | No | Payment due date (YYYY-MM-DD) |
| `validUntil` | string | No | Valid until date (YYYY-MM-DD) |
| `currency` | string | No | Currency code (RON, EUR, USD, etc.). Default: the company's default currency |
| `exchangeRate` | number | No | Exchange rate. Stored as sent, no default |
| `invoiceTypeCode` | string | No | Invoice type code, stored as sent and not validated. It is reused when the proforma is converted, so send one of the codes accepted by [Create invoice](/api-reference/invoices/create) (for example `standard`) or leave it out |
| `notes` | string | No | Public notes visible to client |
| `paymentTerms` | string | No | Payment terms description (e.g., "Net 30") |
| `deliveryLocation` | string | No | Delivery address or location |
| `projectReference` | string | No | Related project reference |
| `orderNumber` | string | No | Client purchase order number |
| `contractNumber` | string | No | Related contract number |
| `issuerName` | string | No | Name of person issuing the proforma |
| `issuerId` | string | No | Issuer identifier, stored as text |
| `mentions` | string | No | Additional mentions or notes |
| `internalNote` | string | No | Internal note (not visible to client) |
| `salesAgent` | string | No | Sales agent name |
| `language` | string | No | Document language for PDF generation (default: `ro`) |

### Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Item description |
| `quantity` | number | Yes | Quantity (must be > 0) |
| `unitPrice` | number | Yes | Price per unit (must be >= 0) |
| `vatRate` | number | No | VAT rate percentage. Default 21.00 when neither `vatRate` nor `vatRateId` is sent, whatever the VAT status of the company |
| `vatCategoryCode` | string | No | UBL VAT category code (default `S`; a 0% rate becomes `Z` on its own) |
| `vatRateId` | string | No | Id of one of the company's VAT rates (`GET /api/v1/vat-rates`). The line takes its percentage and category. Ignored when `vatRate` is sent; an error when it is not a rate of the company |
| `unitOfMeasure` | string | No | Unit of measure (default: `buc`) |
| `productId` | string | No | UUID of a product of the company |
| `productCode` | string | No | Product code; links the product with that code when one exists |
| `discount` | number | No | Absolute discount amount |
| `discountPercent` | number | No | Discount percentage, stored on the line. Line totals are computed from `discount` only |
| `vatIncluded` | boolean | No | Whether unit price includes VAT (default: false) |

> **VAT on a line.** Send `vatRate` (a percentage) or `vatRateId` (the id of one of the company's rates from `GET /api/v1/vat-rates`; the line takes that rate's percentage and category). When both are sent `vatRate` wins. When neither is sent the line gets **21%**, also when the issuing company is not a VAT payer. For a company that is not a VAT payer send `vatRate: "0.00"` on every line. A `vatRateId` that is not a rate of the company is refused with an error; it never falls back to 21%.

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/proforma-invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "750e8400-e29b-41d4-a716-446655440000",
    "documentSeriesId": "650e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-16",
    "dueDate": "2026-03-16",
    "validUntil": "2026-03-16",
    "currency": "RON",
    "exchangeRate": 1.0,
    "notes": "Payment terms: 30 days from invoice date",
    "paymentTerms": "Net 30",
    "deliveryLocation": "Client warehouse",
    "projectReference": "PROJECT-2026-001",
    "orderNumber": "PO-2026-123",
    "contractNumber": "CONTRACT-2026-456",
    "issuerName": "John Doe",
    "mentions": "Special delivery instructions",
    "internalNote": "VIP client - priority handling",
    "salesAgent": "Jane Smith",
    "lines": [
      {
        "description": "Web Development Services - Phase 1",
        "quantity": 40,
        "unitPrice": 150,
        "unitOfMeasure": "hour",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "productId": "450e8400-e29b-41d4-a716-446655440000",
        "discount": 0,
        "discountPercent": 0,
        "vatIncluded": false
      },
      {
        "description": "Hosting Services - Annual",
        "quantity": 1,
        "unitPrice": 1200,
        "unitOfMeasure": "service",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "productId": "460e8400-e29b-41d4-a716-446655440000",
        "discount": 200,
        "discountPercent": 0,
        "vatIncluded": false
      }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientId: '750e8400-e29b-41d4-a716-446655440000',
    documentSeriesId: '650e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-16',
    dueDate: '2026-03-16',
    validUntil: '2026-03-16',
    currency: 'RON',
    exchangeRate: 1.0,
    notes: 'Payment terms: 30 days from invoice date',
    paymentTerms: 'Net 30',
    deliveryLocation: 'Client warehouse',
    projectReference: 'PROJECT-2026-001',
    orderNumber: 'PO-2026-123',
    contractNumber: 'CONTRACT-2026-456',
    issuerName: 'John Doe',
    mentions: 'Special delivery instructions',
    internalNote: 'VIP client - priority handling',
    salesAgent: 'Jane Smith',
    lines: [
      {
        description: 'Web Development Services - Phase 1',
        quantity: 40,
        unitPrice: 150,
        unitOfMeasure: 'hour',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        productId: '450e8400-e29b-41d4-a716-446655440000',
        discount: 0,
        discountPercent: 0,
        vatIncluded: false
      },
      {
        description: 'Hosting Services - Annual',
        quantity: 1,
        unitPrice: 1200,
        unitOfMeasure: 'service',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        productId: '460e8400-e29b-41d4-a716-446655440000',
        discount: 200,
        discountPercent: 0,
        vatIncluded: false
      }
    ]
  })
});

const data = await response.json();
```

## Response

Returns `201 Created` with the proforma object. Decimal amounts are strings and dates are ISO 8601 date-times.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "number": "PRO0001",
  "client": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "type": "company",
    "name": "Client SRL",
    "cui": "12345678",
    "cnp": null,
    "city": "București",
    "country": "RO",
    "email": "contact@client.ro"
  },
  "documentSeries": {
    "id": "650e8400-e29b-41d4-a716-446655440000",
    "prefix": "PRO",
    "nextNumber": "PRO0002"
  },
  "status": "draft",
  "currency": "RON",
  "issueDate": "2026-02-16T00:00:00+00:00",
  "dueDate": "2026-03-16T00:00:00+00:00",
  "validUntil": "2026-03-16T00:00:00+00:00",
  "subtotal": "7000.00",
  "vatTotal": "1330.00",
  "total": "8330.00",
  "discount": "200.00",
  "notes": "Payment terms: 30 days from invoice date",
  "paymentTerms": "Net 30",
  "invoiceTypeCode": null,
  "deliveryLocation": "Client warehouse",
  "projectReference": "PROJECT-2026-001",
  "orderNumber": "PO-2026-123",
  "contractNumber": "CONTRACT-2026-456",
  "issuerName": "John Doe",
  "issuerId": null,
  "mentions": "Special delivery instructions",
  "internalNote": "VIP client - priority handling",
  "salesAgent": "Jane Smith",
  "language": "ro",
  "exchangeRate": null,
  "sentAt": null,
  "acceptedAt": null,
  "rejectedAt": null,
  "cancelledAt": null,
  "expiredAt": null,
  "lines": [
    {
      "id": "950e8400-e29b-41d4-a716-446655440000",
      "position": 1,
      "description": "Web Development Services - Phase 1",
      "quantity": "40.0000",
      "unitOfMeasure": "hour",
      "unitPrice": "150.00",
      "vatRate": "19.00",
      "vatCategoryCode": "S",
      "vatAmount": "1140.00",
      "lineTotal": "6000.00",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "productId": "450e8400-e29b-41d4-a716-446655440000",
      "productCode": null
    },
    {
      "id": "960e8400-e29b-41d4-a716-446655440000",
      "position": 2,
      "description": "Hosting Services - Annual",
      "quantity": "1.0000",
      "unitOfMeasure": "service",
      "unitPrice": "1200.00",
      "vatRate": "19.00",
      "vatCategoryCode": "S",
      "vatAmount": "190.00",
      "lineTotal": "1000.00",
      "discount": "200.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "productId": "460e8400-e29b-41d4-a716-446655440000",
      "productCode": null
    }
  ]
}
```

`documentSeries` is `null` when no series was sent. `nextNumber` is the number the series will give next.

## Validation Rules

- At least one line is required.
- Each line needs a `description`, a `quantity` greater than 0 and a `unitPrice` of 0 or more.
- `clientId`, `documentSeriesId` and `productId` must belong to the company. An unknown client or product is rejected. An unknown series is ignored and the proforma gets the temporary number.
- A `vatRateId` that is not a rate of the company is rejected.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed: no lines, a line without description, quantity or price, unknown client, product or VAT rate, or an invalid value. The message says which |
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the invoice create permission |
| 404 | Company not found (`X-Company` missing, unknown or not accessible) |

Errors return a JSON body with a single `error` message, for example `{"error": "Proforma not found."}`. For example:

```json
{
  "error": "Line 0: quantity must be positive."
}
```
