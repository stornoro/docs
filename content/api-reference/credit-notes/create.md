---
title: Create Credit Note
description: Create a new credit note to reverse or partially reverse an invoice
method: POST
endpoint: /api/v1/invoices
---

# Create Credit Note

Creates a new credit note that reverses or partially reverses an original invoice. Credit notes are created using the same endpoint as invoices but with `isCreditNote: true` and a reference to the parent invoice.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isCreditNote` | boolean | Yes | Must be `true` for credit notes |
| `direction` | string | Yes | Must be `outgoing` for credit notes |
| `parentDocumentId` | string | Yes | UUID of the original invoice being credited |
| `clientId` | string | Yes | UUID of the client (must match parent invoice) |
| `seriesId` | string | Yes | UUID of the credit note series |
| `issueDate` | string | Yes | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | Yes | Due date (YYYY-MM-DD) |
| `currency` | string | Yes | Currency code (must match parent invoice) |
| `exchangeRate` | number | No | Exchange rate (defaults to 1.0 for RON) |
| `invoiceTypeCode` | string | No | Invoice type code (default: "381" - Credit Note) |
| `notes` | string | No | Public notes explaining the credit |
| `paymentTerms` | string | No | Payment/refund terms |
| `issuerName` | string | No | Name of person issuing the credit note |
| `issuerId` | string | No | UUID of the issuer user |
| `mentions` | string | No | Additional mentions |
| `internalNote` | string | No | Internal note (not visible to client) |
| `lines` | array | Yes | Array of line items (minimum 1 item) |

### Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Item description (typically from original invoice) |
| `quantity` | number | Yes | **Negative** quantity or positive with negative unit price |
| `unitPrice` | number | Yes | Unit price (positive if quantity is negative) |
| `vatRateId` | string | Yes | UUID of the VAT rate (must match original) |
| `unitOfMeasure` | string | No | Unit of measure |
| `productId` | string | No | UUID of related product |
| `discount` | number | No | Discount amount (positive, reduces credit) |
| `discountPercent` | number | No | Discount percentage (0-100) |
| `vatIncluded` | boolean | No | Whether unit price includes VAT (default: false) |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "isCreditNote": true,
    "direction": "outgoing",
    "parentDocumentId": "650e8400-e29b-41d4-a716-446655440111",
    "clientId": "750e8400-e29b-41d4-a716-446655440000",
    "seriesId": "750e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-20",
    "dueDate": "2026-03-20",
    "currency": "RON",
    "exchangeRate": 1.0,
    "invoiceTypeCode": "381",
    "notes": "Partial refund - hosting services cancelled by client request",
    "paymentTerms": "Immediate refund",
    "issuerName": "John Doe",
    "mentions": "Credit note for invoice FAC-2026-045",
    "internalNote": "Client cancelled annual hosting, refund via original payment method",
    "lines": [
      {
        "description": "Hosting Services - Annual (CREDIT)",
        "quantity": -1,
        "unitPrice": 1200,
        "unitOfMeasure": "service",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "productId": "460e8400-e29b-41d4-a716-446655440000",
        "discount": 200,
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
    isCreditNote: true,
    direction: 'outgoing',
    parentDocumentId: '650e8400-e29b-41d4-a716-446655440111',
    clientId: '750e8400-e29b-41d4-a716-446655440000',
    seriesId: '750e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-20',
    dueDate: '2026-03-20',
    currency: 'RON',
    exchangeRate: 1.0,
    invoiceTypeCode: '381',
    notes: 'Partial refund - hosting services cancelled by client request',
    paymentTerms: 'Immediate refund',
    issuerName: 'John Doe',
    mentions: 'Credit note for invoice FAC-2026-045',
    internalNote: 'Client cancelled annual hosting, refund via original payment method',
    lines: [
      {
        description: 'Hosting Services - Annual (CREDIT)',
        quantity: -1,
        unitPrice: 1200,
        unitOfMeasure: 'service',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        productId: '460e8400-e29b-41d4-a716-446655440000',
        discount: 200,
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
  "uuid": "850e8400-e29b-41d4-a716-446655440000",
  "number": "CN-2026-005",
  "direction": "outgoing",
  "isCreditNote": true,
  "seriesId": "750e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "750e8400-e29b-41d4-a716-446655440000",
    "name": "CN",
    "nextNumber": 6,
    "prefix": "CN-",
    "year": 2026
  },
  "clientId": "750e8400-e29b-41d4-a716-446655440000",
  "client": {
    "uuid": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "registrationNumber": "RO12345678",
    "address": "Str. Exemplu 123, București",
    "email": "contact@client.ro"
  },
  "parentDocumentId": "650e8400-e29b-41d4-a716-446655440111",
  "parentDocument": {
    "uuid": "650e8400-e29b-41d4-a716-446655440111",
    "number": "FAC-2026-045",
    "issueDate": "2026-02-18",
    "total": "8330.00"
  },
  "status": "draft",
  "anafStatus": null,
  "issueDate": "2026-02-20",
  "dueDate": "2026-03-20",
  "currency": "RON",
  "exchangeRate": 1.0,
  "invoiceTypeCode": "381",
  "notes": "Partial refund - hosting services cancelled by client request",
  "paymentTerms": "Immediate refund",
  "issuerName": "John Doe",
  "mentions": "Credit note for invoice FAC-2026-045",
  "internalNote": "Client cancelled annual hosting, refund via original payment method",
  "lines": [
    {
      "uuid": "910e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 1,
      "description": "Hosting Services - Annual (CREDIT)",
      "quantity": "-1.00",
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
      "vatIncluded": false,
      "subtotal": "-1000.00",
      "vatAmount": "-190.00",
      "total": "-1190.00"
    }
  ],
  "subtotal": "-1000.00",
  "totalDiscount": "200.00",
  "vatAmount": "-190.00",
  "total": "-1190.00",
  "anafUploadIndex": null,
  "createdAt": "2026-02-20T09:00:00Z",
  "updatedAt": "2026-02-20T09:00:00Z"
}
```

## Validation Rules

### Parent Invoice
- `parentDocumentId` must reference an existing invoice
- Parent invoice must belong to the same company
- Parent invoice must be validated by ANAF (recommended)
- Parent invoice cannot be a credit note itself

### Client Match
- `clientId` must match the parent invoice's client
- Cannot create credit note for different client

### Currency Match
- `currency` must match parent invoice currency
- `exchangeRate` should match parent invoice (if applicable)

### Amounts
- All calculated amounts (subtotal, vat, total) will be negative
- Line item quantities should be negative (or unit prices negative)
- Total credit should not exceed original invoice (warning, not error)

### Dates
- `issueDate` should be on or after parent invoice `issueDate`
- `issueDate` should not be in the future
- `dueDate` must be equal to or after `issueDate`

### Line Items
- Minimum 1 line item required
- Line totals must be negative
- VAT rates must match those used in parent invoice (recommended)

### Series
- `seriesId` must reference a series configured for credit notes
- Series must belong to the same company

## Invoice Type Codes

Common type codes for credit notes:
- **381** - Credit note (most common)
- **383** - Corrective invoice
- **384** - Corrected invoice

Default is 381 if not specified.

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request body structure |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Parent invoice, client, series, or VAT rate not found |
| 422 | `validation_error` | Validation failed (see error details) |
| 500 | `internal_error` | Server error occurred |

## Example Validation Error Response

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "parentDocumentId": ["Parent invoice not found"],
      "clientId": ["Client must match parent invoice client"],
      "currency": ["Currency must match parent invoice currency"],
      "lines.0.quantity": ["Quantity must be negative for credit notes"],
      "issueDate": ["Issue date must be after parent invoice date"]
    }
  }
}
```

## Credit Note Scenarios

### Full Refund
Credit all line items from original invoice:
```javascript
{
  // ... other fields
  lines: [
    { quantity: -40, unitPrice: 150, ... },  // All web dev hours
    { quantity: -1, unitPrice: 1200, ... }   // All hosting
  ]
  // Result: -8,330.00 RON (full credit)
}
```

### Partial Refund
Credit only specific line items:
```javascript
{
  // ... other fields
  lines: [
    { quantity: -1, unitPrice: 1200, ... }   // Only hosting
  ]
  // Result: -1,190.00 RON (partial credit)
}
```

### Quantity Adjustment
Credit partial quantity of a line:
```javascript
{
  // ... other fields
  lines: [
    { quantity: -10, unitPrice: 150, ... }   // Only 10 of 40 hours
  ]
  // Result: -1,785.00 RON (partial credit)
}
```

### Error Correction
Full credit + new invoice with correct amounts:
```javascript
// Step 1: Credit Note (full)
{ lines: [{ quantity: -40, unitPrice: 150, ... }] }

// Step 2: New Invoice (corrected)
{ lines: [{ quantity: 45, unitPrice: 150, ... }] }
```

## Best Practices

1. **Reference original clearly** - Include original invoice number in notes
2. **Explain the reason** - Clear notes about why credit is issued
3. **Use negative quantities** - More intuitive than negative prices
4. **Match original details** - Use same products, VAT rates when possible
5. **Check parent status** - Ensure parent invoice is validated first
6. **Upload promptly** - Submit to ANAF after creation
7. **Notify client** - Send credit note with clear explanation
8. **Track cumulative credits** - Monitor total credited per invoice
9. **Coordinate refunds** - Link credit note to actual payment refund
10. **Update accounting** - Sync to accounting system immediately

## Next Steps

After creating a credit note:
1. Upload to ANAF (`POST /api/v1/invoices/{uuid}/upload`)
2. Generate PDF for client
3. Send to client via email
4. Process refund payment if applicable
5. Update accounting records
6. Track against original invoice
