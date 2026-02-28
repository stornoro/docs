---
title: Update Receipt
description: Update an existing receipt (draft status only)
method: PUT
endpoint: /api/v1/receipts/{uuid}
---

# Update Receipt

Updates an existing fiscal receipt. Only receipts in `draft` status can be updated. Once issued, invoiced, or cancelled, a receipt becomes immutable.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the receipt to update |

## Request Body

All fields from the create endpoint can be updated. The entire receipt is replaced with the new data.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `documentSeriesId` | string | No | UUID of the receipt document series. Can be changed to any active `receipt` series; if omitted, the existing series is preserved |
| `issueDate` | string | Yes | Date of issue (YYYY-MM-DD) |
| `currency` | string | Yes | Currency code |
| `cashRegisterName` | string | Yes | Name or label of the cash register |
| `fiscalNumber` | string | Yes | Fiscal serial number of the cash register |
| `paymentMethod` | string | Yes | Payment method: `cash`, `card`, `mixed`, `other` |
| `cashPayment` | number | No | Amount paid in cash |
| `cardPayment` | number | No | Amount paid by card |
| `otherPayment` | number | No | Amount paid by other method |
| `customerName` | string | No | Customer name |
| `customerCif` | string | No | Customer CIF/CUI |
| `clientId` | string | No | UUID of a linked Client object |
| `notes` | string | No | Public notes |
| `internalNote` | string | No | Internal note |
| `lines` | array | Yes | Array of line items (replaces all existing lines) |

### Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uuid` | string | No | UUID of existing line (if updating); omit to create new line |
| `description` | string | Yes | Item description |
| `quantity` | number | Yes | Quantity (must be > 0) |
| `unitPrice` | number | Yes | Price per unit (excluding VAT) |
| `vatRateId` | string | Yes | UUID of the VAT rate |
| `unitOfMeasure` | string | No | Unit of measure |
| `productId` | string | No | UUID of related product |

## Request

```bash {% title="cURL" %}
curl -X PUT https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-18",
    "currency": "RON",
    "cashRegisterName": "Casa 1 - Front Desk",
    "fiscalNumber": "AAAA123456",
    "paymentMethod": "card",
    "cashPayment": 0.00,
    "cardPayment": 130.00,
    "otherPayment": 0.00,
    "customerName": "Acme SRL",
    "customerCif": "RO12345678",
    "notes": "Updated order",
    "lines": [
      {
        "uuid": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "description": "Coffee - Espresso",
        "quantity": 2,
        "unitPrice": 12.61,
        "unitOfMeasure": "pcs",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "productId": "d4e5f6a7-b8c9-0123-defa-234567890123"
      },
      {
        "description": "Pen Blue",
        "quantity": 5,
        "unitPrice": 4.20,
        "unitOfMeasure": "pcs",
        "vatRateId": "360e8400-e29b-41d4-a716-446655440000"
      }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
  method: 'PUT',
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
    paymentMethod: 'card',
    cashPayment: 0.00,
    cardPayment: 130.00,
    otherPayment: 0.00,
    customerName: 'Acme SRL',
    customerCif: 'RO12345678',
    notes: 'Updated order',
    lines: [
      {
        uuid: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
        description: 'Coffee - Espresso',
        quantity: 2,
        unitPrice: 12.61,
        unitOfMeasure: 'pcs',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        productId: 'd4e5f6a7-b8c9-0123-defa-234567890123'
      },
      {
        description: 'Pen Blue',
        quantity: 5,
        unitPrice: 4.20,
        unitOfMeasure: 'pcs',
        vatRateId: '360e8400-e29b-41d4-a716-446655440000'
      }
    ]
  })
});

const data = await response.json();
```

## Response

Returns the updated receipt object with recalculated totals:

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "BON-2026-042",
  "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
  "status": "draft",
  "issueDate": "2026-02-18",
  "currency": "RON",
  "cashRegisterName": "Casa 1 - Front Desk",
  "fiscalNumber": "AAAA123456",
  "paymentMethod": "card",
  "cashPayment": "0.00",
  "cardPayment": "130.00",
  "otherPayment": "0.00",
  "customerName": "Acme SRL",
  "customerCif": "RO12345678",
  "notes": "Updated order",
  "lines": [
    {
      "uuid": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "lineNumber": 1,
      "description": "Coffee - Espresso",
      "quantity": "2.00",
      "unitPrice": "12.61",
      "unitOfMeasure": "pcs",
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "subtotal": "25.22",
      "vatAmount": "2.27",
      "total": "27.49"
    },
    {
      "uuid": "g7h8i9j0-k1l2-3456-mnop-678901234567",
      "lineNumber": 2,
      "description": "Pen Blue",
      "quantity": "5.00",
      "unitPrice": "4.20",
      "unitOfMeasure": "pcs",
      "vatRateId": "360e8400-e29b-41d4-a716-446655440000",
      "subtotal": "17.65",
      "vatAmount": "3.35",
      "total": "21.00"
    }
  ],
  "subtotal": "42.87",
  "vatAmount": "5.62",
  "total": "48.49",
  "createdAt": "2026-02-18T10:14:00Z",
  "updatedAt": "2026-02-18T10:20:00Z"
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
- Receipt must be in `draft` status
- Cannot update after it is issued, invoiced, or cancelled

### Payment Amounts
- The sum of `cashPayment + cardPayment + otherPayment` must equal `total`
- All payment amounts must be >= 0

### Line Items
- Minimum 1 line required
- All line validation rules from the create endpoint apply

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request body structure |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Receipt not found or doesn't belong to the company |
| 409 | `conflict` | Receipt status prevents updates (not in draft) |
| 422 | `validation_error` | Validation failed (see error details) |
| 500 | `internal_error` | Server error occurred |

## Example Error Response

### Status Conflict

```json
{
  "error": {
    "code": "conflict",
    "message": "Receipt cannot be updated",
    "details": {
      "status": "issued",
      "reason": "Only draft receipts can be updated",
      "issuedAt": "2026-02-18T10:15:00Z"
    }
  }
}
```

## Best Practices

1. **Update before issuing** - Make all corrections while in draft status; receipts become immutable after issuing
2. **Verify payment totals** - Ensure payment amounts sum correctly to the receipt total
3. **Match fiscal device** - The `fiscalNumber` and `cashRegisterName` should match the actual device that printed the receipt
4. **Correct before printing** - Update data while still in draft, before the physical receipt is printed on the fiscal device
