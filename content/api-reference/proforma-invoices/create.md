---
title: Create Proforma Invoice
description: Create a new proforma invoice with line items
method: POST
endpoint: /api/v1/proforma-invoices
---

# Create Proforma Invoice

Creates a new proforma invoice in draft status. The proforma can be edited until it's sent, accepted, rejected, or converted to a final invoice.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clientId` | string | Yes | UUID of the client |
| `seriesId` | string | Yes | UUID of the invoice series |
| `issueDate` | string | Yes | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | Yes | Payment due date (YYYY-MM-DD) |
| `validUntil` | string | Yes | Valid until date (YYYY-MM-DD) |
| `currency` | string | Yes | Currency code (RON, EUR, USD, etc.) |
| `exchangeRate` | number | No | Exchange rate (defaults to 1.0 for RON) |
| `invoiceTypeCode` | string | No | Invoice type code (default: "380" - Commercial Invoice) |
| `notes` | string | No | Public notes visible to client |
| `paymentTerms` | string | No | Payment terms description (e.g., "Net 30") |
| `deliveryLocation` | string | No | Delivery address or location |
| `projectReference` | string | No | Related project reference |
| `orderNumber` | string | No | Client purchase order number |
| `contractNumber` | string | No | Related contract number |
| `issuerName` | string | No | Name of person issuing the proforma |
| `issuerId` | string | No | UUID of the issuer user |
| `mentions` | string | No | Additional mentions or notes |
| `internalNote` | string | No | Internal note (not visible to client) |
| `salesAgent` | string | No | Sales agent name |
| `language` | string | No | Document language for PDF generation: `ro`, `en`, `de`, `fr` (default: `ro`) |
| `lines` | array | Yes | Array of line items (minimum 1 item) |

### Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Item description |
| `quantity` | number | Yes | Quantity (must be > 0) |
| `unitPrice` | number | Yes | Price per unit |
| `vatRateId` | string | Yes | UUID of the VAT rate |
| `unitOfMeasure` | string | No | Unit of measure (e.g., hour, piece, kg) |
| `productId` | string | No | UUID of related product |
| `discount` | number | No | Absolute discount amount |
| `discountPercent` | number | No | Discount percentage (0-100) |
| `vatIncluded` | boolean | No | Whether unit price includes VAT (default: false) |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/proforma-invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "750e8400-e29b-41d4-a716-446655440000",
    "seriesId": "650e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-16",
    "dueDate": "2026-03-16",
    "validUntil": "2026-03-16",
    "currency": "RON",
    "exchangeRate": 1.0,
    "invoiceTypeCode": "380",
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
        "discountPercent": 16.67,
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
    seriesId: '650e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-16',
    dueDate: '2026-03-16',
    validUntil: '2026-03-16',
    currency: 'RON',
    exchangeRate: 1.0,
    invoiceTypeCode: '380',
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
        discountPercent: 16.67,
        vatIncluded: false
      }
    ]
  })
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
    "address": "Str. Exemplu 123, București",
    "email": "contact@client.ro",
    "phone": "+40721234567"
  },
  "status": "draft",
  "issueDate": "2026-02-16",
  "dueDate": "2026-03-16",
  "validUntil": "2026-03-16",
  "currency": "RON",
  "exchangeRate": 1.0,
  "invoiceTypeCode": "380",
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
      "uuid": "950e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 1,
      "description": "Web Development Services - Phase 1",
      "quantity": "40.00",
      "unitPrice": "150.00",
      "unitOfMeasure": "hour",
      "productId": "450e8400-e29b-41d4-a716-446655440000",
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
  "sentAt": null,
  "acceptedAt": null,
  "rejectedAt": null,
  "cancelledAt": null,
  "convertedAt": null,
  "convertedInvoiceId": null,
  "createdAt": "2026-02-16T09:00:00Z",
  "updatedAt": "2026-02-16T09:00:00Z"
}
```

## Validation Rules

### Dates
- `issueDate` must be a valid date in YYYY-MM-DD format
- `dueDate` must be equal to or after `issueDate`
- `validUntil` must be equal to or after `issueDate`

### Currency
- Must be a valid 3-letter currency code (ISO 4217)
- `exchangeRate` must be greater than 0
- For RON (base currency), `exchangeRate` defaults to 1.0

### Line Items
- Minimum 1 line item required
- `quantity` must be greater than 0
- `unitPrice` must be greater than or equal to 0
- Either `discount` or `discountPercent` can be provided (not both)
- If `discountPercent` is provided, it must be between 0 and 100
- `vatRateId` must reference an existing VAT rate
- If `productId` is provided, it must reference an existing product

### References
- `clientId` must reference an existing client
- `seriesId` must reference an existing series configured for proforma invoices
- If `issuerId` is provided, it must reference an existing user

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request body structure |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Referenced entity not found (client, series, VAT rate, product, user) |
| 422 | `validation_error` | Validation failed (see error details for specific field errors) |
| 500 | `internal_error` | Server error occurred |

## Example Validation Error Response

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "clientId": ["Client not found"],
      "lines.0.quantity": ["Quantity must be greater than 0"],
      "lines.1.vatRateId": ["VAT rate not found"],
      "dueDate": ["Due date must be after issue date"]
    }
  }
}
```
