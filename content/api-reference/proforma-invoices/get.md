---
title: Get Proforma Invoice
description: Retrieve detailed information for a specific proforma invoice including line items
method: GET
endpoint: /api/v1/proforma-invoices/{uuid}
---

# Get Proforma Invoice

Retrieves complete details for a specific proforma invoice, including all line items, client information, and calculated totals.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

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

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "number": "PRO-2026-001",
  "seriesId": "650e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "650e8400-e29b-41d4-a716-446655440000",
    "name": "PRO",
    "nextNumber": 2,
    "prefix": "PRO-",
    "year": 2026
  },
  "clientId": "750e8400-e29b-41d4-a716-446655440000",
  "client": {
    "uuid": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "registrationNumber": "RO12345678",
    "address": "Str. Exemplu 123, București, Sector 1",
    "city": "București",
    "county": "București",
    "country": "RO",
    "postalCode": "010101",
    "email": "contact@client.ro",
    "phone": "+40721234567",
    "bankAccount": "RO49AAAA1B31007593840000",
    "bankName": "Banca Comercială Română"
  },
  "status": "sent",
  "issueDate": "2026-02-16",
  "dueDate": "2026-03-16",
  "validUntil": "2026-03-16",
  "currency": "RON",
  "exchangeRate": 1.0,
  "invoiceTypeCode": "380",
  "notes": "Payment terms: 30 days from invoice date",
  "paymentTerms": "Net 30",
  "deliveryLocation": "Client warehouse - Str. Depozit 5, București",
  "projectReference": "PROJECT-2026-001",
  "orderNumber": "PO-2026-123",
  "contractNumber": "CONTRACT-2026-456",
  "issuerName": "John Doe",
  "issuerId": "850e8400-e29b-41d4-a716-446655440000",
  "mentions": "Special delivery instructions: Handle with care",
  "internalNote": "Internal reference note - VIP client",
  "salesAgent": "Jane Smith",
  "lines": [
    {
      "uuid": "950e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 1,
      "description": "Web Development Services - Phase 1",
      "quantity": "40.00",
      "unitPrice": "150.00",
      "unitOfMeasure": "hour",
      "productId": "450e8400-e29b-41d4-a716-446655440000",
      "product": {
        "uuid": "450e8400-e29b-41d4-a716-446655440000",
        "name": "Web Development Services",
        "code": "WEB-DEV-001",
        "unitOfMeasure": "hour"
      },
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "uuid": "350e8400-e29b-41d4-a716-446655440000",
        "name": "Standard VAT",
        "percentage": "19.00"
      },
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "subtotal": "6000.00",
      "vatAmount": "1140.00",
      "total": "7140.00"
    },
    {
      "uuid": "960e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 2,
      "description": "Hosting Services - Annual",
      "quantity": "1.00",
      "unitPrice": "1200.00",
      "unitOfMeasure": "service",
      "productId": "460e8400-e29b-41d4-a716-446655440000",
      "product": {
        "uuid": "460e8400-e29b-41d4-a716-446655440000",
        "name": "Hosting Services",
        "code": "HOST-001",
        "unitOfMeasure": "service"
      },
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "uuid": "350e8400-e29b-41d4-a716-446655440000",
        "name": "Standard VAT",
        "percentage": "19.00"
      },
      "discount": "200.00",
      "discountPercent": "16.67",
      "vatIncluded": false,
      "subtotal": "1000.00",
      "vatAmount": "190.00",
      "total": "1190.00"
    }
  ],
  "subtotal": "7000.00",
  "totalDiscount": "200.00",
  "vatAmount": "1330.00",
  "total": "8330.00",
  "sentAt": "2026-02-16T10:30:00Z",
  "acceptedAt": null,
  "rejectedAt": null,
  "cancelledAt": null,
  "convertedAt": null,
  "convertedInvoiceId": null,
  "createdAt": "2026-02-16T09:00:00Z",
  "updatedAt": "2026-02-16T10:30:00Z"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `number` | string | Proforma invoice number |
| `status` | string | Current status (draft/sent/accepted/rejected/converted/cancelled) |
| `series` | object | Series information with prefix and year |
| `client` | object | Complete client details including banking information |
| `lines` | array | Array of line items with products, pricing, and VAT calculations |
| `subtotal` | string | Subtotal before VAT |
| `totalDiscount` | string | Sum of all line item discounts |
| `vatAmount` | string | Total VAT amount |
| `total` | string | Grand total including VAT |
| `issueDate` | string | Date of issue |
| `dueDate` | string | Payment due date |
| `validUntil` | string | Proforma validity date |
| `currency` | string | Currency code |
| `exchangeRate` | number | Exchange rate to base currency |
| `invoiceTypeCode` | string | Invoice type code (ANAF standard) |
| `paymentTerms` | string | Payment terms description |
| `deliveryLocation` | string | Delivery address or location |
| `projectReference` | string | Related project reference |
| `orderNumber` | string | Client purchase order number |
| `contractNumber` | string | Related contract number |
| `issuerName` | string | Name of person who issued the proforma |
| `issuerId` | string | UUID of the issuer user |
| `salesAgent` | string | Sales agent name |
| `mentions` | string | Additional mentions or notes |
| `internalNote` | string | Internal note (not shown to client) |
| `sentAt` | string \| null | Timestamp when sent |
| `acceptedAt` | string \| null | Timestamp when accepted |
| `rejectedAt` | string \| null | Timestamp when rejected |
| `cancelledAt` | string \| null | Timestamp when cancelled |
| `convertedAt` | string \| null | Timestamp when converted to invoice |
| `convertedInvoiceId` | string \| null | UUID of created invoice (if converted) |

### Line Item Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Line item unique identifier |
| `lineNumber` | integer | Sequential line number |
| `description` | string | Item description |
| `quantity` | string | Quantity (decimal string) |
| `unitPrice` | string | Price per unit |
| `unitOfMeasure` | string | Unit of measure (e.g., hour, piece, service) |
| `product` | object \| null | Related product details |
| `vatRate` | object | VAT rate details with percentage |
| `discount` | string | Absolute discount amount |
| `discountPercent` | string | Discount as percentage |
| `vatIncluded` | boolean | Whether unit price includes VAT |
| `subtotal` | string | Line subtotal (after discount, before VAT) |
| `vatAmount` | string | Line VAT amount |
| `total` | string | Line total (including VAT) |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Proforma invoice not found or doesn't belong to the specified company |
| 500 | `internal_error` | Server error occurred |
