---
title: Update Proforma Invoice
description: Update an existing proforma invoice (draft status only)
method: PUT
endpoint: /api/v1/proforma-invoices/{uuid}
---

# Update Proforma Invoice

Updates an existing proforma invoice. Only proforma invoices in `draft` status can be updated. Once a proforma is sent, accepted, rejected, converted, or cancelled, it becomes immutable.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the proforma invoice to update |

## Request Body

All fields from the create endpoint can be updated. The entire proforma is replaced with the new data.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clientId` | string | Yes | UUID of the client |
| `seriesId` | string | Yes | UUID of the invoice series |
| `issueDate` | string | Yes | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | Yes | Payment due date (YYYY-MM-DD) |
| `validUntil` | string | Yes | Valid until date (YYYY-MM-DD) |
| `currency` | string | Yes | Currency code (RON, EUR, USD, etc.) |
| `exchangeRate` | number | No | Exchange rate (defaults to 1.0 for RON) |
| `invoiceTypeCode` | string | No | Invoice type code |
| `notes` | string | No | Public notes visible to client |
| `paymentTerms` | string | No | Payment terms description |
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
| `lines` | array | Yes | Array of line items (replaces all existing lines) |

### Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uuid` | string | No | UUID of existing line (if updating); omit to create new line |
| `description` | string | Yes | Item description |
| `quantity` | number | Yes | Quantity (must be > 0) |
| `unitPrice` | number | Yes | Price per unit |
| `vatRateId` | string | Yes | UUID of the VAT rate |
| `unitOfMeasure` | string | No | Unit of measure |
| `productId` | string | No | UUID of related product |
| `discount` | number | No | Absolute discount amount |
| `discountPercent` | number | No | Discount percentage (0-100) |
| `vatIncluded` | boolean | No | Whether unit price includes VAT |

## Request

```bash {% title="cURL" %}
curl -X PUT https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "750e8400-e29b-41d4-a716-446655440000",
    "seriesId": "650e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-16",
    "dueDate": "2026-03-20",
    "validUntil": "2026-03-20",
    "currency": "RON",
    "exchangeRate": 1.0,
    "notes": "Updated payment terms: 35 days",
    "paymentTerms": "Net 35",
    "deliveryLocation": "Updated delivery location",
    "projectReference": "PROJECT-2026-001",
    "orderNumber": "PO-2026-123",
    "issuerName": "John Doe",
    "salesAgent": "Jane Smith",
    "lines": [
      {
        "uuid": "950e8400-e29b-41d4-a716-446655440000",
        "description": "Web Development Services - Phase 1 (Updated)",
        "quantity": 45,
        "unitPrice": 150,
        "unitOfMeasure": "hour",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "productId": "450e8400-e29b-41d4-a716-446655440000",
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
    clientId: '750e8400-e29b-41d4-a716-446655440000',
    seriesId: '650e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-16',
    dueDate: '2026-03-20',
    validUntil: '2026-03-20',
    currency: 'RON',
    exchangeRate: 1.0,
    notes: 'Updated payment terms: 35 days',
    paymentTerms: 'Net 35',
    deliveryLocation: 'Updated delivery location',
    projectReference: 'PROJECT-2026-001',
    orderNumber: 'PO-2026-123',
    issuerName: 'John Doe',
    salesAgent: 'Jane Smith',
    lines: [
      {
        uuid: '950e8400-e29b-41d4-a716-446655440000',
        description: 'Web Development Services - Phase 1 (Updated)',
        quantity: 45,
        unitPrice: 150,
        unitOfMeasure: 'hour',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        productId: '450e8400-e29b-41d4-a716-446655440000',
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

Returns the updated proforma invoice object with recalculated totals:

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "number": "PRO-2026-001",
  "seriesId": "650e8400-e29b-41d4-a716-446655440000",
  "clientId": "750e8400-e29b-41d4-a716-446655440000",
  "status": "draft",
  "issueDate": "2026-02-16",
  "dueDate": "2026-03-20",
  "validUntil": "2026-03-20",
  "currency": "RON",
  "exchangeRate": 1.0,
  "notes": "Updated payment terms: 35 days",
  "paymentTerms": "Net 35",
  "deliveryLocation": "Updated delivery location",
  "projectReference": "PROJECT-2026-001",
  "orderNumber": "PO-2026-123",
  "issuerName": "John Doe",
  "salesAgent": "Jane Smith",
  "lines": [
    {
      "uuid": "950e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 1,
      "description": "Web Development Services - Phase 1 (Updated)",
      "quantity": "45.00",
      "unitPrice": "150.00",
      "unitOfMeasure": "hour",
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "productId": "450e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "uuid": "350e8400-e29b-41d4-a716-446655440000",
        "name": "Standard VAT",
        "percentage": "19.00"
      },
      "discount": "0.00",
      "vatIncluded": false,
      "subtotal": "6750.00",
      "vatAmount": "1282.50",
      "total": "8032.50"
    },
    {
      "uuid": "970e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 2,
      "description": "Additional Services",
      "quantity": "10.00",
      "unitPrice": "100.00",
      "unitOfMeasure": "hour",
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "uuid": "350e8400-e29b-41d4-a716-446655440000",
        "name": "Standard VAT",
        "percentage": "19.00"
      },
      "discount": "0.00",
      "vatIncluded": false,
      "subtotal": "1000.00",
      "vatAmount": "190.00",
      "total": "1190.00"
    }
  ],
  "subtotal": "7750.00",
  "totalDiscount": "0.00",
  "vatAmount": "1472.50",
  "total": "9222.50",
  "createdAt": "2026-02-16T09:00:00Z",
  "updatedAt": "2026-02-16T11:30:00Z"
}
```

## Line Item Behavior

When updating lines:
- Lines with existing `uuid` values are updated
- Lines without `uuid` are created as new lines
- Existing lines not included in the request are **deleted**
- Line numbers are automatically reassigned sequentially

## Validation Rules

Same validation rules apply as in the create endpoint:

### Status Restriction
- Proforma must be in `draft` status
- Cannot update proforma after it's sent, accepted, rejected, converted, or cancelled

### Dates
- `issueDate` must be valid YYYY-MM-DD format
- `dueDate` must be equal to or after `issueDate`
- `validUntil` must be equal to or after `issueDate`

### Currency & Rates
- `currency` must be valid ISO 4217 code
- `exchangeRate` must be greater than 0

### Line Items
- Minimum 1 line required
- All line validation rules from create endpoint apply

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request body structure |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header, or proforma is not editable |
| 404 | `not_found` | Proforma invoice not found or doesn't belong to the company |
| 409 | `conflict` | Proforma status prevents updates (not in draft) |
| 422 | `validation_error` | Validation failed (see error details) |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be updated",
    "details": {
      "status": "sent",
      "reason": "Only draft proforma invoices can be updated"
    }
  }
}
```

### Validation Error

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "dueDate": ["Due date must be after issue date"],
      "lines.0.quantity": ["Quantity must be greater than 0"],
      "lines": ["At least one line item is required"]
    }
  }
}
```
