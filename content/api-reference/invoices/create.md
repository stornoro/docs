---
title: Create invoice
description: Create a new draft invoice
---

# Create invoice

Creates a new draft invoice for the specified company. The invoice can be edited until it is issued.

```
POST /api/v1/invoices
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `clientId` | string | No | Client UUID. Either `clientId` or `receiverName` should be provided. |
| `receiverName` | string | No | Receiver name (when no client entity exists). Either `clientId` or `receiverName` should be provided. |
| `receiverCif` | string | No | Receiver tax ID / CIF (used with `receiverName`) |
| `seriesId` | string | No | Invoice series UUID (uses default if not provided) |
| `issueDate` | string | Yes | Invoice issue date (ISO 8601: YYYY-MM-DD) |
| `dueDate` | string | No | Payment due date (ISO 8601: YYYY-MM-DD) |
| `currency` | string | No | ISO 4217 currency code (default: RON) |
| `exchangeRate` | number | No | Exchange rate (default: 1.0) |
| `invoiceTypeCode` | string | No | UBL invoice type code (default: 380) |
| `notes` | string | No | Public notes visible to client |
| `paymentTerms` | string | No | Payment terms description |
| `deliveryLocation` | string | No | Delivery address |
| `projectReference` | string | No | Project reference number |
| `orderNumber` | string | No | Purchase order number |
| `contractNumber` | string | No | Contract reference number |
| `issuerName` | string | No | Name of person issuing the invoice |
| `issuerId` | string | No | Issuer ID number |
| `mentions` | string | No | Additional legal mentions |
| `internalNote` | string | No | Internal note (not visible to client) |
| `salesAgent` | string | No | Sales agent name |
| `deputyName` | string | No | Deputy/representative name |
| `deputyIdentityCard` | string | No | Deputy ID card number |
| `deputyAuto` | string | No | Deputy vehicle registration |
| `collect` | boolean | No | Create immediate full payment (default: false) |
| `penaltyEnabled` | boolean | No | Enable late payment penalty (default: false) |
| `penaltyPercentPerDay` | number | No | Daily penalty percentage (e.g., 0.05 for 0.05%) |
| `penaltyGraceDays` | integer | No | Grace period before penalty applies |
| `language` | string | No | Document language for PDF generation: `ro`, `en`, `de`, `fr` (default: `ro`) |
| `lines` | array | Yes | Array of invoice line items |

### Invoice line object

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `description` | string | Yes | Line item description |
| `quantity` | number | Yes | Quantity |
| `unitPrice` | number | Yes | Unit price |
| `vatRateId` | string | No | VAT rate UUID (uses default if not provided) |
| `unitOfMeasure` | string | No | Unit of measure (e.g., "hours", "pcs", "kg") |
| `productId` | string | No | Product UUID (optional reference) |
| `discount` | number | No | Fixed discount amount |
| `discountPercent` | number | No | Discount percentage |
| `vatIncluded` | boolean | No | Whether price includes VAT (default: false) |
| `productCode` | string | No | Product code for reference |

### Common invoice type codes

- `380` - Commercial invoice (default)
- `381` - Credit note
- `384` - Corrected invoice
- `389` - Self-billed invoice
- `751` - Invoice information for accounting purposes

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "issueDate": "2024-02-15",
    "dueDate": "2024-03-15",
    "currency": "RON",
    "notes": "Payment terms: 30 days net",
    "paymentTerms": "Net 30",
    "lines": [
      {
        "description": "Web Development Services",
        "quantity": 10,
        "unitPrice": 100.00,
        "unitOfMeasure": "hours",
        "vatIncluded": false
      }
    ]
  }'
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    issueDate: '2024-02-15',
    dueDate: '2024-03-15',
    currency: 'RON',
    notes: 'Payment terms: 30 days net',
    paymentTerms: 'Net 30',
    lines: [
      {
        description: 'Web Development Services',
        quantity: 10,
        unitPrice: 100.00,
        unitOfMeasure: 'hours',
        vatIncluded: false
      }
    ]
  })
});

const invoice = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the created invoice object with status `201 Created`.

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "number": "FAC-2024-001",
  "status": "draft",
  "direction": "outgoing",
  "currency": "RON",
  "exchangeRate": 1.0,
  "issueDate": "2024-02-15",
  "dueDate": "2024-03-15",
  "subtotal": 1000.00,
  "vatTotal": 190.00,
  "total": 1190.00,
  "amountPaid": 0.00,
  "balance": 1190.00,
  "notes": "Payment terms: 30 days net",
  "paymentTerms": "Net 30",
  "client": {
    "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "name": "Acme Corporation SRL",
    "cif": "RO98765432"
  },
  "lines": [
    {
      "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "description": "Web Development Services",
      "quantity": 10.0,
      "unitPrice": 100.00,
      "unitOfMeasure": "hours",
      "vatRate": 19.0,
      "vatAmount": 190.00,
      "subtotal": 1000.00,
      "total": 1190.00
    }
  ],
  "createdAt": "2024-02-15T08:30:00Z",
  "updatedAt": "2024-02-15T08:30:00Z"
}
```

## Error codes

| Code | Description |
|------|-------------|
| `400` | Validation error - missing required fields or invalid data |
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Client or series not found |
| `422` | Business validation error (e.g., invalid dates, negative amounts) |
