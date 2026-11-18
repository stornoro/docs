---
title: Get Proforma Invoice
description: Retrieve detailed information for a specific proforma invoice including line items
method: GET
endpoint: /api/v1/proforma-invoices/{uuid}
---

# Get Proforma Invoice

Retrieves complete details for a specific proforma invoice, including all line items, client information and totals.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not read by this endpoint. The proforma is found by its id and must belong to your organization |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the proforma invoice to retrieve |

## Request

```bash {% title="cURL" %}
curl -X GET https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});
const data = await response.json();
```

## Response

The response is the proforma object itself. Decimal amounts are strings and dates are ISO 8601 date-times. `documentSeries` is `null` when the proforma has no series.

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
  "status": "sent",
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
  "sentAt": "2026-02-16T10:30:00+00:00",
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

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Proforma UUID |
| `number` | string | Proforma number (series prefix plus a 4-digit counter, or a temporary `PRO-xxxxxxxx`) |
| `status` | string | `draft`, `sent`, `accepted`, `rejected`, `converted`, `cancelled` or `expired` |
| `client` | object \| null | `id`, `type`, `name`, `cui`, `cnp`, `city`, `country`, `email` |
| `documentSeries` | object \| null | `id`, `prefix` and `nextNumber` (the number the series gives next, as text) |
| `currency` | string | Currency code |
| `issueDate`, `dueDate`, `validUntil` | string \| null | ISO 8601 date-times |
| `subtotal` | string | Sum of line totals, excluding VAT |
| `vatTotal` | string | Total VAT amount |
| `total` | string | `subtotal` plus `vatTotal` |
| `discount` | string | Sum of the line discounts |
| `notes`, `paymentTerms`, `deliveryLocation`, `projectReference`, `orderNumber`, `contractNumber`, `issuerName`, `issuerId`, `mentions`, `internalNote`, `salesAgent` | string \| null | Text fields as stored |
| `invoiceTypeCode` | string \| null | Invoice type code as stored |
| `language` | string | Document language (default `ro`) |
| `exchangeRate` | string \| null | Exchange rate as stored |
| `sentAt`, `acceptedAt`, `rejectedAt`, `cancelledAt`, `expiredAt` | string \| null | ISO 8601 timestamps of the status changes |
| `lines` | array | Line items |

### Line item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Line UUID |
| `position` | integer | Display order, starting at 1 |
| `description` | string | Item description |
| `quantity` | string | Quantity |
| `unitOfMeasure` | string | Unit of measure |
| `unitPrice` | string | Price per unit |
| `vatRate` | string | VAT percentage |
| `vatCategoryCode` | string | UBL VAT category code |
| `vatAmount` | string | VAT amount of the line |
| `lineTotal` | string | Line total excluding VAT |
| `discount` | string | Absolute discount |
| `discountPercent` | string | Discount percentage as stored |
| `vatIncluded` | boolean | Whether the unit price includes VAT |
| `productId` | string \| null | Linked product UUID |
| `productCode` | string \| null | Product code |

The line also carries the optional fields `lineNote`, `buyerAccountingRef`, `buyerItemIdentification`, `standardItemIdentification`, `cpvCode` and `ublExtensions`.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the invoice view permission |
| 404 | Proforma not found, or it belongs to another organization |

Errors return a JSON body with a single `error` message, for example `{"error": "Proforma not found."}`.
