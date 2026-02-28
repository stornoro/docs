---
title: Update Delivery Note
description: Update an existing delivery note (draft or issued status)
method: PUT
endpoint: /api/v1/delivery-notes/{uuid}
---

# Update Delivery Note

Updates an existing delivery note. Delivery notes in both `draft` and `issued` status can be updated. Once converted or cancelled, the delivery note becomes immutable.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note to update |

## Request Body

All fields from the create endpoint can be updated. The entire delivery note is replaced with the new data.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clientId` | string | Yes | UUID of the client |
| `documentSeriesId` | string | No | UUID of the delivery note series. Can be changed to any active `delivery_note` series; if omitted, the existing series is preserved |
| `issueDate` | string | Yes | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | Yes | Due date for invoicing (YYYY-MM-DD) |
| `currency` | string | Yes | Currency code |
| `exchangeRate` | number | No | Exchange rate |
| `deliveryLocation` | string | No | Delivery address |
| `projectReference` | string | No | Project reference |
| `issuerName` | string | No | Issuer name |
| `issuerId` | string | No | Issuer UUID |
| `salesAgent` | string | No | Sales agent name |
| `deputyName` | string | No | Deputy name |
| `deputyIdentityCard` | string | No | Deputy ID card |
| `deputyAuto` | string | No | Vehicle registration |
| `notes` | string | No | Public notes |
| `mentions` | string | No | Additional mentions |
| `internalNote` | string | No | Internal note |
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

## Request

```bash {% title="cURL" %}
curl -X PUT https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "750e8400-e29b-41d4-a716-446655440000",
    "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-18",
    "dueDate": "2026-03-20",
    "currency": "RON",
    "deliveryLocation": "Updated: Client new warehouse - Str. Nou 10",
    "projectReference": "PROJECT-2026-002",
    "issuerName": "John Doe",
    "deputyName": "Updated Deputy Name",
    "deputyIdentityCard": "CD789012",
    "deputyAuto": "B-456-XYZ",
    "notes": "Updated delivery notes",
    "lines": [
      {
        "uuid": "A10e8400-e29b-41d4-a716-446655440000",
        "description": "Laptop Dell Latitude 7420 (Updated qty)",
        "quantity": 12,
        "unitPrice": 450,
        "unitOfMeasure": "piece",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "productId": "B50e8400-e29b-41d4-a716-446655440000"
      },
      {
        "description": "USB-C Cable 2m",
        "quantity": 12,
        "unitPrice": 15,
        "unitOfMeasure": "piece",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000"
      }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientId: '750e8400-e29b-41d4-a716-446655440000',
    documentSeriesId: '850e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-18',
    dueDate: '2026-03-20',
    currency: 'RON',
    deliveryLocation: 'Updated: Client new warehouse - Str. Nou 10',
    projectReference: 'PROJECT-2026-002',
    issuerName: 'John Doe',
    deputyName: 'Updated Deputy Name',
    deputyIdentityCard: 'CD789012',
    deputyAuto: 'B-456-XYZ',
    notes: 'Updated delivery notes',
    lines: [
      {
        uuid: 'A10e8400-e29b-41d4-a716-446655440000',
        description: 'Laptop Dell Latitude 7420 (Updated qty)',
        quantity: 12,
        unitPrice: 450,
        unitOfMeasure: 'piece',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        productId: 'B50e8400-e29b-41d4-a716-446655440000'
      },
      {
        description: 'USB-C Cable 2m',
        quantity: 12,
        unitPrice: 15,
        unitOfMeasure: 'piece',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000'
      }
    ]
  })
});

const data = await response.json();
```

## Response

Returns the updated delivery note object with recalculated totals:

```json
{
  "uuid": "950e8400-e29b-41d4-a716-446655440000",
  "number": "DN-2026-012",
  "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
  "clientId": "750e8400-e29b-41d4-a716-446655440000",
  "status": "draft",
  "issueDate": "2026-02-18",
  "dueDate": "2026-03-20",
  "currency": "RON",
  "exchangeRate": 1.0,
  "deliveryLocation": "Updated: Client new warehouse - Str. Nou 10",
  "projectReference": "PROJECT-2026-002",
  "issuerName": "John Doe",
  "deputyName": "Updated Deputy Name",
  "deputyIdentityCard": "CD789012",
  "deputyAuto": "B-456-XYZ",
  "notes": "Updated delivery notes",
  "lines": [
    {
      "uuid": "A10e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 1,
      "description": "Laptop Dell Latitude 7420 (Updated qty)",
      "quantity": "12.00",
      "unitPrice": "450.00",
      "unitOfMeasure": "piece",
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "productId": "B50e8400-e29b-41d4-a716-446655440000",
      "subtotal": "5400.00",
      "vatAmount": "1026.00",
      "total": "6426.00"
    },
    {
      "uuid": "A30e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 2,
      "description": "USB-C Cable 2m",
      "quantity": "12.00",
      "unitPrice": "15.00",
      "unitOfMeasure": "piece",
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "subtotal": "180.00",
      "vatAmount": "34.20",
      "total": "214.20"
    }
  ],
  "subtotal": "5580.00",
  "vatAmount": "1060.20",
  "total": "6640.20",
  "createdAt": "2026-02-18T09:00:00Z",
  "updatedAt": "2026-02-18T11:30:00Z"
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
- Delivery note must be in `draft` or `issued` status
- Cannot update after it's converted or cancelled

### Dates
- `issueDate` must be valid YYYY-MM-DD format
- `dueDate` must be equal to or after `issueDate`

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
| 403 | `forbidden` | Invalid or missing X-Company header, or delivery note is not editable |
| 404 | `not_found` | Delivery note not found or doesn't belong to the company |
| 409 | `conflict` | Delivery note status prevents updates (converted or cancelled) |
| 422 | `validation_error` | Validation failed (see error details) |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict

```json
{
  "error": {
    "code": "conflict",
    "message": "Delivery note cannot be updated",
    "details": {
      "status": "converted",
      "reason": "Converted or cancelled delivery notes cannot be updated",
      "convertedAt": "2026-02-20T15:00:00Z"
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

## Common Update Scenarios

### Update Quantities Before Delivery
```javascript
// Adjust quantities to match actual stock
lines: [
  { uuid: "A10...", quantity: 12, ... },  // Was 10, now 12
  { uuid: "A20...", quantity: 10, ... }   // Unchanged
]
```

### Add Items to Delivery
```javascript
// Keep existing + add new items
lines: [
  { uuid: "A10...", description: "Item 1", ... },  // Keep existing
  { description: "New Item", quantity: 5, ... }     // Add new
]
```

### Remove Items from Delivery
```javascript
// Only include items being delivered
lines: [
  { uuid: "A10...", description: "Item 1", ... }   // Keep only this
  // Item 2 removed by omitting it
]
```

### Update Delivery Details
```javascript
// Change delivery location or deputy
{
  deliveryLocation: "New warehouse address",
  deputyName: "Different person receiving",
  deputyIdentityCard: "New ID number"
}
```

### Correct Data Entry Errors
```javascript
// Fix mistakes before issuing
{
  projectReference: "Corrected project code",
  notes: "Corrected delivery notes",
  lines: [{ ...corrected line data }]
}
```

## Best Practices

1. **Update before issuing** - Make all corrections while in draft status
2. **Verify totals** - Check calculated totals after updating quantities
3. **Track changes** - Log what was changed and why in your system
4. **Confirm with client** - If delivery details change, notify client
5. **Update promptly** - Make changes as soon as discrepancies are discovered
6. **Check inventory** - Ensure updated quantities match available stock
7. **Issue when ready** - Once finalized, mark as issued immediately

## When to Update vs Create New

### Update Existing
- Delivery note is in `draft` or `issued` status
- Fixing errors before or after issue
- Adjusting quantities to match stock
- Correcting client or location details

### Create New Delivery Note
- Need to document an additional, separate delivery
- Delivery note is already converted or cancelled
- Separate shipment or delivery event
- Historical record of the original must remain unchanged

## Next Steps

After updating a delivery note:
1. Review all changes carefully
2. Verify totals and calculations
3. Confirm inventory availability
4. Mark as issued when ready for delivery
5. Convert to invoice after successful delivery
