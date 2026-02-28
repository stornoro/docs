---
title: Update Credit Note
description: Update an existing credit note (draft status only)
method: PUT
endpoint: /api/v1/invoices/{uuid}
---

# Update Credit Note

Updates an existing credit note. Only credit notes in `draft` status can be updated. Once uploaded to ANAF, the credit note becomes immutable.

Credit notes use the same update endpoint as invoices.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the credit note to update |

## Request Body

All fields from the create endpoint can be updated. The entire credit note is replaced with the new data.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isCreditNote` | boolean | Yes | Must be `true` |
| `direction` | string | Yes | Must be `outgoing` |
| `parentDocumentId` | string | Yes | UUID of the original invoice (cannot be changed) |
| `clientId` | string | Yes | UUID of the client (must match parent) |
| `seriesId` | string | Yes | UUID of the credit note series |
| `issueDate` | string | Yes | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | Yes | Due date (YYYY-MM-DD) |
| `currency` | string | Yes | Currency code (must match parent) |
| `exchangeRate` | number | No | Exchange rate |
| `invoiceTypeCode` | string | No | Invoice type code |
| `notes` | string | No | Public notes |
| `paymentTerms` | string | No | Payment/refund terms |
| `issuerName` | string | No | Issuer name |
| `issuerId` | string | No | Issuer UUID |
| `mentions` | string | No | Additional mentions |
| `internalNote` | string | No | Internal note |
| `lines` | array | Yes | Array of line items (replaces all existing lines) |

### Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uuid` | string | No | UUID of existing line (if updating); omit to create new line |
| `description` | string | Yes | Item description |
| `quantity` | number | Yes | **Negative** quantity |
| `unitPrice` | number | Yes | Unit price |
| `vatRateId` | string | Yes | UUID of the VAT rate |
| `unitOfMeasure` | string | No | Unit of measure |
| `productId` | string | No | UUID of related product |
| `discount` | number | No | Discount amount |
| `discountPercent` | number | No | Discount percentage |
| `vatIncluded` | boolean | No | Whether unit price includes VAT |

## Request

```bash {% title="cURL" %}
curl -X PUT https://api.storno.ro/api/v1/invoices/850e8400-e29b-41d4-a716-446655440000 \
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
    "notes": "Updated: Full refund - all services cancelled",
    "paymentTerms": "Immediate refund",
    "issuerName": "John Doe",
    "mentions": "Credit note for invoice FAC-2026-045 (UPDATED)",
    "internalNote": "Client cancelled entire order, full refund approved",
    "lines": [
      {
        "uuid": "910e8400-e29b-41d4-a716-446655440000",
        "description": "Hosting Services - Annual (CREDIT)",
        "quantity": -1,
        "unitPrice": 1200,
        "unitOfMeasure": "service",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "productId": "460e8400-e29b-41d4-a716-446655440000",
        "discount": 200,
        "vatIncluded": false
      },
      {
        "description": "Web Development Services - Phase 1 (CREDIT)",
        "quantity": -40,
        "unitPrice": 150,
        "unitOfMeasure": "hour",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "productId": "450e8400-e29b-41d4-a716-446655440000",
        "vatIncluded": false
      }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/invoices/850e8400-e29b-41d4-a716-446655440000', {
  method: 'PUT',
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
    notes: 'Updated: Full refund - all services cancelled',
    paymentTerms: 'Immediate refund',
    issuerName: 'John Doe',
    mentions: 'Credit note for invoice FAC-2026-045 (UPDATED)',
    internalNote: 'Client cancelled entire order, full refund approved',
    lines: [
      {
        uuid: '910e8400-e29b-41d4-a716-446655440000',
        description: 'Hosting Services - Annual (CREDIT)',
        quantity: -1,
        unitPrice: 1200,
        unitOfMeasure: 'service',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        productId: '460e8400-e29b-41d4-a716-446655440000',
        discount: 200,
        vatIncluded: false
      },
      {
        description: 'Web Development Services - Phase 1 (CREDIT)',
        quantity: -40,
        unitPrice: 150,
        unitOfMeasure: 'hour',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        productId: '450e8400-e29b-41d4-a716-446655440000',
        vatIncluded: false
      }
    ]
  })
});

const data = await response.json();
```

## Response

Returns the updated credit note object with recalculated totals:

```json
{
  "uuid": "850e8400-e29b-41d4-a716-446655440000",
  "number": "CN-2026-005",
  "direction": "outgoing",
  "isCreditNote": true,
  "seriesId": "750e8400-e29b-41d4-a716-446655440000",
  "clientId": "750e8400-e29b-41d4-a716-446655440000",
  "parentDocumentId": "650e8400-e29b-41d4-a716-446655440111",
  "status": "draft",
  "issueDate": "2026-02-20",
  "dueDate": "2026-03-20",
  "currency": "RON",
  "exchangeRate": 1.0,
  "notes": "Updated: Full refund - all services cancelled",
  "paymentTerms": "Immediate refund",
  "issuerName": "John Doe",
  "mentions": "Credit note for invoice FAC-2026-045 (UPDATED)",
  "internalNote": "Client cancelled entire order, full refund approved",
  "lines": [
    {
      "uuid": "910e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 1,
      "description": "Hosting Services - Annual (CREDIT)",
      "quantity": "-1.00",
      "unitPrice": "1200.00",
      "unitOfMeasure": "service",
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "productId": "460e8400-e29b-41d4-a716-446655440000",
      "discount": "200.00",
      "vatIncluded": false,
      "subtotal": "-1000.00",
      "vatAmount": "-190.00",
      "total": "-1190.00"
    },
    {
      "uuid": "920e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 2,
      "description": "Web Development Services - Phase 1 (CREDIT)",
      "quantity": "-40.00",
      "unitPrice": "150.00",
      "unitOfMeasure": "hour",
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "productId": "450e8400-e29b-41d4-a716-446655440000",
      "discount": "0.00",
      "vatIncluded": false,
      "subtotal": "-6000.00",
      "vatAmount": "-1140.00",
      "total": "-7140.00"
    }
  ],
  "subtotal": "-7000.00",
  "totalDiscount": "200.00",
  "vatAmount": "-1330.00",
  "total": "-8330.00",
  "createdAt": "2026-02-20T09:00:00Z",
  "updatedAt": "2026-02-20T11:30:00Z"
}
```

## Line Item Behavior

When updating lines:
- Lines with existing `uuid` values are updated
- Lines without `uuid` are created as new lines
- Existing lines not included in the request are **deleted**
- Line numbers are automatically reassigned sequentially

## Validation Rules

### Status Restriction
- Credit note must be in `draft` status
- Cannot update after uploading to ANAF
- Cannot update validated, uploaded, or error status credit notes

### Parent Invoice Immutability
- `parentDocumentId` cannot be changed after creation
- Attempting to change it will result in validation error

### Client Match
- `clientId` must match parent invoice client
- Cannot change to different client

### Currency Match
- `currency` must match parent invoice currency
- Cannot change currency

### Dates
- `issueDate` must be valid YYYY-MM-DD format
- `issueDate` should be on or after parent invoice issue date
- `dueDate` must be equal to or after `issueDate`

### Amounts
- All line totals must be negative
- Total credit should not exceed original invoice (warning)

### Line Items
- Minimum 1 line required
- All line validation rules from create endpoint apply

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request body structure |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header, or credit note is not editable |
| 404 | `not_found` | Credit note not found or doesn't belong to the company |
| 409 | `conflict` | Credit note status prevents updates (not in draft) |
| 422 | `validation_error` | Validation failed (see error details) |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict

```json
{
  "error": {
    "code": "conflict",
    "message": "Credit note cannot be updated",
    "details": {
      "status": "uploaded",
      "reason": "Only draft credit notes can be updated",
      "uploadedAt": "2026-02-20T10:00:00Z"
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
      "parentDocumentId": ["Parent document cannot be changed"],
      "clientId": ["Client must match parent invoice client"],
      "lines.0.quantity": ["Quantity must be negative for credit notes"],
      "total": ["Warning: Credit total exceeds original invoice amount"]
    }
  }
}
```

## Common Update Scenarios

### Change Credit Amount
Update quantities or add/remove line items:
```javascript
// Original: -1,190.00 (partial)
// Updated: -8,330.00 (full)
lines: [
  { uuid: "910...", quantity: -1, ... },    // Keep existing
  { quantity: -40, unitPrice: 150, ... }    // Add new line
]
```

### Update Notes/Reason
Clarify the reason for credit:
```javascript
notes: "Updated: Full refund approved by management",
internalNote: "Client escalated, full refund authorized"
```

### Correct Line Details
Fix description or product reference:
```javascript
lines: [{
  uuid: "910...",
  description: "Corrected description",
  productId: "corrected-product-uuid",
  // ... other fields
}]
```

### Change Issue Date
Adjust the credit note date:
```javascript
issueDate: "2026-02-21",  // Changed from 2026-02-20
dueDate: "2026-03-21"     // Adjust accordingly
```

## Best Practices

1. **Review before uploading** - Update while in draft, finalize before upload
2. **Track changes** - Log what was changed and why
3. **Verify totals** - Ensure credit doesn't exceed original invoice
4. **Update notes** - Reflect any changes in the notes field
5. **Coordinate with client** - If credit amount changes, notify client
6. **Check parent status** - Ensure parent invoice is still valid
7. **Upload promptly** - Once finalized, upload to ANAF quickly

## When to Update vs Create New

### Update Existing
- Credit note is still in draft
- Fixing errors before upload
- Adjusting amounts before client sees it
- Correcting descriptions or references

### Create New Credit Note
- Original credit note already uploaded
- Need to issue additional credit
- Original credit note validated by ANAF
- Historical record should be preserved

## Next Steps

After updating a credit note:
1. Review all changes carefully
2. Verify totals and calculations
3. Upload to ANAF when ready
4. Generate PDF for client
5. Send to client if amounts changed
