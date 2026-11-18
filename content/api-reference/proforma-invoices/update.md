---
title: Update Proforma Invoice
description: Update an existing proforma invoice (draft status only)
method: PUT
endpoint: /api/v1/proforma-invoices/{uuid}
---

# Update Proforma Invoice

Updates an existing proforma invoice. Only proformas in `draft` status can be updated. Once a proforma is sent, accepted, rejected, converted, cancelled or expired, it cannot be edited.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `Content-Type` | string | Yes | Must be `application/json` |
| `X-Company` | string | No | Not read by this endpoint. The proforma is found by its id and must belong to your organization |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the proforma invoice to update |

## Request Body

Send only the fields you want to change. Fields you leave out keep their value. If `lines` is present it replaces all existing lines; line ids are not used, so send every line you want to keep.

| Field | Type | Description |
|-------|------|-------------|
| `clientId` | string | UUID of a client of the company |
| `issueDate` | string | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | Payment due date (YYYY-MM-DD) |
| `validUntil` | string | Valid until date (YYYY-MM-DD) |
| `currency` | string | Currency code |
| `exchangeRate` | number | Exchange rate |
| `invoiceTypeCode` | string | Invoice type code, stored as sent. Use one of the codes accepted by [Create invoice](/api-reference/invoices/create) or leave it out, because the value is reused when the proforma is converted |
| `notes` | string \| null | Public notes visible to client |
| `paymentTerms` | string \| null | Payment terms description |
| `deliveryLocation` | string \| null | Delivery address or location |
| `projectReference` | string \| null | Related project reference |
| `orderNumber` | string \| null | Client purchase order number |
| `contractNumber` | string \| null | Related contract number |
| `issuerName` | string \| null | Name of person issuing the proforma |
| `issuerId` | string \| null | Issuer identifier, stored as text |
| `mentions` | string \| null | Additional mentions or notes |
| `internalNote` | string \| null | Internal note (not visible to client) |
| `salesAgent` | string \| null | Sales agent name |
| `language` | string | Document language for PDF generation |
| `lines` | array | Line items; replaces all existing lines |

The series and the number cannot be changed on update.

### Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Item description |
| `quantity` | number | Yes | Quantity |
| `unitPrice` | number | Yes | Price per unit |
| `vatRate` | number | No | VAT rate percentage. Default 21.00 when neither `vatRate` nor `vatRateId` is sent, whatever the VAT status of the company |
| `vatCategoryCode` | string | No | UBL VAT category code (default `S`; a 0% rate becomes `Z` on its own) |
| `vatRateId` | string | No | Id of one of the company's VAT rates (`GET /api/v1/vat-rates`). The line takes its percentage and category. Ignored when `vatRate` is sent; an error when it is not a rate of the company |
| `unitOfMeasure` | string | No | Unit of measure (default: `buc`) |
| `productId` | string | No | UUID of a product of the company |
| `productCode` | string | No | Product code; links the product with that code when one exists |
| `discount` | number | No | Absolute discount amount |
| `discountPercent` | number | No | Discount percentage, stored on the line. Line totals are computed from `discount` only |
| `vatIncluded` | boolean | No | Whether unit price includes VAT |

> **VAT on a line.** Send `vatRate` (a percentage) or `vatRateId` (the id of one of the company's rates from `GET /api/v1/vat-rates`; the line takes that rate's percentage and category). When both are sent `vatRate` wins. When neither is sent the line gets **21%**, also when the issuing company is not a VAT payer. For a company that is not a VAT payer send `vatRate: "0.00"` on every line. A `vatRateId` that is not a rate of the company is refused with an error; it never falls back to 21%.

## Request

```bash {% title="cURL" %}
curl -X PUT https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "dueDate": "2026-03-20",
    "validUntil": "2026-03-20",
    "notes": "Updated payment terms: 35 days",
    "paymentTerms": "Net 35",
    "lines": [
      {
        "description": "Web Development Services - Phase 1 (Updated)",
        "quantity": 45,
        "unitPrice": 150,
        "unitOfMeasure": "hour",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "vatIncluded": false
      },
      {
        "description": "Additional Services",
        "quantity": 10,
        "unitPrice": 100,
        "unitOfMeasure": "hour",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "vatIncluded": false
      }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    dueDate: '2026-03-20',
    validUntil: '2026-03-20',
    notes: 'Updated payment terms: 35 days',
    paymentTerms: 'Net 35',
    lines: [
      {
        description: 'Web Development Services - Phase 1 (Updated)',
        quantity: 45,
        unitPrice: 150,
        unitOfMeasure: 'hour',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        vatIncluded: false
      },
      {
        description: 'Additional Services',
        quantity: 10,
        unitPrice: 100,
        unitOfMeasure: 'hour',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        vatIncluded: false
      }
    ]
  })
});
const data = await response.json();
```

## Response

Returns the updated proforma object, in the same shape as [Get proforma invoice](/api-reference/proforma-invoices/get). Decimal amounts are strings and dates are ISO 8601 date-times. `documentSeries` is `null` when the proforma has no series.

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
  "dueDate": "2026-03-20T00:00:00+00:00",
  "validUntil": "2026-03-20T00:00:00+00:00",
  "subtotal": "7750.00",
  "vatTotal": "1472.50",
  "total": "9222.50",
  "discount": "0.00",
  "notes": "Updated payment terms: 35 days",
  "paymentTerms": "Net 35",
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
      "description": "Web Development Services - Phase 1 (Updated)",
      "quantity": "45.0000",
      "unitOfMeasure": "hour",
      "unitPrice": "150.00",
      "vatRate": "19.00",
      "vatCategoryCode": "S",
      "vatAmount": "1282.50",
      "lineTotal": "6750.00",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "productId": "450e8400-e29b-41d4-a716-446655440000",
      "productCode": null
    },
    {
      "id": "960e8400-e29b-41d4-a716-446655440000",
      "position": 2,
      "description": "Additional Services",
      "quantity": "10.0000",
      "unitOfMeasure": "hour",
      "unitPrice": "100.00",
      "vatRate": "19.00",
      "vatCategoryCode": "S",
      "vatAmount": "190.00",
      "lineTotal": "1000.00",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "productId": null,
      "productCode": null
    }
  ]
}
```

## Validation Rules

- The proforma must be in `draft` status.
- An unknown client or product, or a `vatRateId` that is not a rate of the company, is rejected.
- Totals are recalculated from the lines.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the invoice edit permission |
| 404 | Proforma not found, or it belongs to another organization |
| 422 | The proforma is not a draft, or a client, product or VAT rate was not found |

Errors return a JSON body with a single `error` message, for example `{"error": "Proforma not found."}`.

```json
{
  "error": "Proforma nu poate fi editata."
}
```
