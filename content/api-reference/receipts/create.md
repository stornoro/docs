---
title: Create Receipt
description: Create a new fiscal receipt (bon fiscal)
method: POST
endpoint: /api/v1/receipts
---

# Create Receipt

Creates a new fiscal receipt (bon fiscal) in draft status. Receipts document point-of-sale transactions and can later be converted into formal invoices when customers request a tax document.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `documentSeriesId` | string | No | UUID of the receipt document series. If not provided, the default `receipt` series for the company is auto-assigned |
| `issueDate` | string | Yes | Date of issue (YYYY-MM-DD) |
| `currency` | string | Yes | Currency code (RON, EUR, USD, etc.) |
| `cashRegisterName` | string | Yes | Name or label of the cash register |
| `fiscalNumber` | string | Yes | Fiscal serial number of the cash register |
| `paymentMethod` | string | Yes | Payment method: `cash`, `card`, `mixed`, `other` |
| `cashPayment` | number | No | Amount paid in cash (default: 0) |
| `cardPayment` | number | No | Amount paid by card (default: 0) |
| `otherPayment` | number | No | Amount paid by other method (default: 0) |
| `customerName` | string | No | Customer name (for B2B receipts) |
| `customerCif` | string | No | Customer CIF/CUI (for B2B receipts) |
| `clientId` | string | No | UUID of a linked Client object |
| `notes` | string | No | Public notes on the receipt |
| `internalNote` | string | No | Internal note (not printed on receipt) |
| `lines` | array | Yes | Array of line items (minimum 1 item) |

### Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Item description |
| `quantity` | number | Yes | Quantity sold (must be > 0) |
| `unitPrice` | number | Yes | Price per unit (excluding VAT) |
| `vatRateId` | string | Yes | UUID of the VAT rate |
| `unitOfMeasure` | string | No | Unit of measure (e.g., pcs, kg, l) |
| `productId` | string | No | UUID of related product |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/receipts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-18",
    "currency": "RON",
    "cashRegisterName": "Casa 1 - Front Desk",
    "fiscalNumber": "AAAA123456",
    "paymentMethod": "mixed",
    "cashPayment": 100.00,
    "cardPayment": 151.00,
    "otherPayment": 0.00,
    "customerName": "Acme SRL",
    "customerCif": "RO12345678",
    "clientId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "notes": "Thank you for your purchase!",
    "internalNote": "Loyalty card customer",
    "lines": [
      {
        "description": "Coffee - Espresso",
        "quantity": 2,
        "unitPrice": 12.61,
        "unitOfMeasure": "pcs",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "productId": "d4e5f6a7-b8c9-0123-defa-234567890123"
      },
      {
        "description": "Notebook A5",
        "quantity": 2,
        "unitPrice": 41.18,
        "unitOfMeasure": "pcs",
        "vatRateId": "360e8400-e29b-41d4-a716-446655440000",
        "productId": "f6a7b8c9-d0e1-2345-fabc-456789012345"
      }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    documentSeriesId: '850e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-18',
    currency: 'RON',
    cashRegisterName: 'Casa 1 - Front Desk',
    fiscalNumber: 'AAAA123456',
    paymentMethod: 'mixed',
    cashPayment: 100.00,
    cardPayment: 151.00,
    otherPayment: 0.00,
    customerName: 'Acme SRL',
    customerCif: 'RO12345678',
    clientId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    notes: 'Thank you for your purchase!',
    internalNote: 'Loyalty card customer',
    lines: [
      {
        description: 'Coffee - Espresso',
        quantity: 2,
        unitPrice: 12.61,
        unitOfMeasure: 'pcs',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        productId: 'd4e5f6a7-b8c9-0123-defa-234567890123'
      },
      {
        description: 'Notebook A5',
        quantity: 2,
        unitPrice: 41.18,
        unitOfMeasure: 'pcs',
        vatRateId: '360e8400-e29b-41d4-a716-446655440000',
        productId: 'f6a7b8c9-d0e1-2345-fabc-456789012345'
      }
    ]
  })
});

const data = await response.json();
```

## Response

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "BON-2026-042",
  "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "850e8400-e29b-41d4-a716-446655440000",
    "name": "BON",
    "nextNumber": 43,
    "prefix": "BON-",
    "year": 2026
  },
  "clientId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "client": {
    "uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Acme SRL",
    "registrationNumber": "RO12345678",
    "address": "Strada Principala, nr. 10",
    "email": "office@acme.ro"
  },
  "status": "draft",
  "issueDate": "2026-02-18",
  "currency": "RON",
  "cashRegisterName": "Casa 1 - Front Desk",
  "fiscalNumber": "AAAA123456",
  "paymentMethod": "mixed",
  "cashPayment": "100.00",
  "cardPayment": "151.00",
  "otherPayment": "0.00",
  "customerName": "Acme SRL",
  "customerCif": "RO12345678",
  "notes": "Thank you for your purchase!",
  "internalNote": "Loyalty card customer",
  "lines": [
    {
      "uuid": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "lineNumber": 1,
      "description": "Coffee - Espresso",
      "quantity": "2.00",
      "unitPrice": "12.61",
      "unitOfMeasure": "pcs",
      "productId": "d4e5f6a7-b8c9-0123-defa-234567890123",
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "uuid": "350e8400-e29b-41d4-a716-446655440000",
        "name": "VAT 9%",
        "percentage": "9.00"
      },
      "subtotal": "25.22",
      "vatAmount": "2.27",
      "total": "27.49"
    },
    {
      "uuid": "e5f6a7b8-c9d0-1234-efab-345678901234",
      "lineNumber": 2,
      "description": "Notebook A5",
      "quantity": "2.00",
      "unitPrice": "41.18",
      "unitOfMeasure": "pcs",
      "productId": "f6a7b8c9-d0e1-2345-fabc-456789012345",
      "vatRateId": "360e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "uuid": "360e8400-e29b-41d4-a716-446655440000",
        "name": "Standard VAT",
        "percentage": "19.00"
      },
      "subtotal": "82.36",
      "vatAmount": "15.65",
      "total": "98.01"
    }
  ],
  "subtotal": "107.58",
  "vatAmount": "17.92",
  "total": "125.50",
  "issuedAt": null,
  "cancelledAt": null,
  "convertedInvoiceId": null,
  "createdAt": "2026-02-18T10:14:00Z",
  "updatedAt": "2026-02-18T10:14:00Z"
}
```

## Validation Rules

### Payment Amounts
- The sum of `cashPayment + cardPayment + otherPayment` must equal `total`
- Individual payment amounts must be >= 0
- `paymentMethod` must match the active payment amounts:
  - `cash` — only `cashPayment > 0`
  - `card` — only `cardPayment > 0`
  - `other` — only `otherPayment > 0`
  - `mixed` — more than one payment type is > 0

### Date
- `issueDate` must be a valid date in YYYY-MM-DD format

### Currency
- Must be a valid 3-letter currency code (ISO 4217)

### Line Items
- Minimum 1 line item required
- `quantity` must be greater than 0
- `unitPrice` must be greater than or equal to 0
- `vatRateId` must reference an existing VAT rate
- If `productId` is provided, it must reference an existing product

### References
- If `documentSeriesId` is provided, it must reference an existing series configured for `receipt` type; if omitted, the company's default `receipt` series is auto-assigned
- If `clientId` is provided, it must reference an existing client

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request body structure |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Referenced entity not found (series, VAT rate, product, client) |
| 422 | `validation_error` | Validation failed (see error details for specific field errors) |
| 500 | `internal_error` | Server error occurred |

## Example Validation Error Response

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "paymentMethod": ["Sum of cash, card, and other payments must equal total"],
      "lines.0.quantity": ["Quantity must be greater than 0"],
      "lines.1.vatRateId": ["VAT rate not found"]
    }
  }
}
```

## Common Scenarios

### Cash-Only Purchase
```javascript
{
  paymentMethod: 'cash',
  cashPayment: 50.00,
  cardPayment: 0.00,
  otherPayment: 0.00
}
```

### Card-Only Purchase
```javascript
{
  paymentMethod: 'card',
  cashPayment: 0.00,
  cardPayment: 150.00,
  otherPayment: 0.00
}
```

### Meal Ticket + Cash
```javascript
{
  paymentMethod: 'mixed',
  cashPayment: 10.00,
  cardPayment: 0.00,
  otherPayment: 20.00   // meal ticket value
}
```

### B2B Receipt Without Client Link
```javascript
{
  customerName: 'Firm Anonima SRL',
  customerCif: 'RO99887766'
  // no clientId — customer data recorded directly
}
```

### B2B Receipt With Client Link
```javascript
{
  clientId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  customerName: 'Acme SRL',
  customerCif: 'RO12345678'
  // linked to existing Client — enables clean invoice conversion
}
```

## Next Steps

After creating a receipt:
1. Mark as issued when the receipt is printed and handed to the customer (`POST /api/v1/receipts/{uuid}/issue`)
2. If the customer requests an invoice, convert to invoice (`POST /api/v1/receipts/{uuid}/convert`)
