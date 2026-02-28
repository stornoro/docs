---
title: Convert Delivery Note to Invoice
description: Convert a delivery note into an invoice for payment
method: POST
endpoint: /api/v1/delivery-notes/{uuid}/convert
---

# Convert Delivery Note to Invoice

Converts a delivery note into a final, legally-binding invoice. This action creates a new invoice with all the delivery note's data, marks the delivery note as `converted`, and establishes a link between the two documents.

Once converted, the delivery note cannot be modified and serves as a historical reference to the original delivery.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note to convert |

## Request Body (Optional)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `invoiceSeriesId` | string | No | UUID of invoice series (if different from delivery note series) |
| `issueDate` | string | No | Override issue date (default: today) |
| `dueDate` | string | No | Override due date (default: delivery note's due date) |
| `overrideFields` | object | No | Fields to override from the delivery note data |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceSeriesId": "660e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-20",
    "dueDate": "2026-03-20"
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    invoiceSeriesId: '660e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-20',
    dueDate: '2026-03-20'
  })
});

const data = await response.json();
```

## Response

Returns the newly created invoice object along with updated delivery note status:

```json
{
  "invoice": {
    "uuid": "650e8400-e29b-41d4-a716-446655440222",
    "number": "FAC-2026-050",
    "direction": "outgoing",
    "isCreditNote": false,
    "seriesId": "660e8400-e29b-41d4-a716-446655440000",
    "series": {
      "uuid": "660e8400-e29b-41d4-a716-446655440000",
      "name": "FAC",
      "nextNumber": 51,
      "prefix": "FAC-",
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
    "issueDate": "2026-02-20",
    "dueDate": "2026-03-20",
    "currency": "RON",
    "exchangeRate": 1.0,
    "invoiceTypeCode": "380",
    "deliveryLocation": "Client warehouse - Str. Depozit 5, București",
    "projectReference": "PROJECT-2026-002",
    "deliveryNoteReference": "DN-2026-012",
    "deliveryNoteId": "950e8400-e29b-41d4-a716-446655440000",
    "notes": "Handle with care - fragile items",
    "issuerName": "John Doe",
    "lines": [
      {
        "uuid": "A40e8400-e29b-41d4-a716-446655440000",
        "lineNumber": 1,
        "description": "Laptop Dell Latitude 7420",
        "quantity": "10.00",
        "unitPrice": "450.00",
        "unitOfMeasure": "piece",
        "productId": "B50e8400-e29b-41d4-a716-446655440000",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "vatRate": {
          "percentage": "19.00"
        },
        "subtotal": "4500.00",
        "vatAmount": "855.00",
        "total": "5355.00"
      },
      {
        "uuid": "A50e8400-e29b-41d4-a716-446655440000",
        "lineNumber": 2,
        "description": "Wireless Mouse Logitech MX Master 3",
        "quantity": "10.00",
        "unitPrice": "50.00",
        "unitOfMeasure": "piece",
        "productId": "B60e8400-e29b-41d4-a716-446655440000",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "vatRate": {
          "percentage": "19.00"
        },
        "subtotal": "500.00",
        "vatAmount": "95.00",
        "total": "595.00"
      }
    ],
    "subtotal": "5000.00",
    "vatAmount": "950.00",
    "total": "5950.00",
    "anafStatus": null,
    "anafUploadIndex": null,
    "createdAt": "2026-02-20T15:00:00Z",
    "updatedAt": "2026-02-20T15:00:00Z"
  },
  "deliveryNote": {
    "uuid": "950e8400-e29b-41d4-a716-446655440000",
    "number": "DN-2026-012",
    "status": "converted",
    "convertedAt": "2026-02-20T15:00:00Z",
    "convertedInvoiceId": "650e8400-e29b-41d4-a716-446655440222",
    "convertedInvoiceNumber": "FAC-2026-050",
    "updatedAt": "2026-02-20T15:00:00Z"
  }
}
```

## State Changes

### Delivery Note Changes
- **Status:** Changed from `draft` or `issued` → `converted`
- **convertedAt:** Set to current UTC timestamp
- **convertedInvoiceId:** Set to the UUID of the created invoice
- **convertedInvoiceNumber:** Set to the invoice number for easy reference

### Invoice Creation
- New invoice created with status `draft`
- All line items copied from delivery note
- Client, pricing, and terms copied from delivery note
- `deliveryNoteId` and `deliveryNoteReference` fields set to link back to delivery note
- Ready to be uploaded to ANAF

## Data Mapping

The following fields are copied from delivery note to invoice:

### Basic Information
- `clientId` - Same client
- `currency` and `exchangeRate` - Same currency settings
- `invoiceTypeCode` - Defaults to "380" (Commercial Invoice)

### Dates
- `issueDate` - Defaults to today (can be overridden)
- `dueDate` - Defaults to delivery note's due date (can be overridden)

### References
- `deliveryLocation` - Delivery location from delivery note
- `projectReference` - Project reference
- `notes` - Public notes
- `mentions` - Additional mentions
- `issuerName` and `issuerId` - Issuer information
- `salesAgent` - Sales agent

### Line Items
- All line items with same details:
  - Description, quantity, unit price
  - VAT rate, unit of measure
  - Product reference
  - All calculations

### New Fields Added to Invoice
- `deliveryNoteId` - UUID of source delivery note
- `deliveryNoteReference` - Delivery note number for display

## Validation Rules

### Delivery Note Status
Can convert delivery note in these statuses:
- `draft` - Can convert immediately (uncommon)
- `issued` - Recommended status for conversion

Cannot convert delivery note in these statuses:
- `cancelled` - Delivery was cancelled
- `converted` - Already converted

### Data Validation
- All delivery note data must be valid
- Client must still exist
- VAT rates must still exist
- Products (if referenced) must still exist
- Series must be valid for invoices

### Series Selection
- If `invoiceSeriesId` is not provided, the company's default `invoice` series is auto-assigned to the created invoice
- Series must be configured for outgoing invoices
- Series must belong to the same company

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Delivery note not found or doesn't belong to the company |
| 409 | `conflict` | Delivery note status prevents conversion or already converted |
| 422 | `validation_error` | Invalid request body or delivery note data cannot be converted |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict - Already Converted

```json
{
  "error": {
    "code": "conflict",
    "message": "Delivery note cannot be converted",
    "details": {
      "status": "converted",
      "reason": "Delivery note has already been converted to an invoice",
      "convertedAt": "2026-02-20T15:00:00Z",
      "convertedInvoiceId": "650e8400-e29b-41d4-a716-446655440222",
      "convertedInvoiceNumber": "FAC-2026-050"
    }
  }
}
```

### Status Conflict - Cancelled

```json
{
  "error": {
    "code": "conflict",
    "message": "Delivery note cannot be converted",
    "details": {
      "status": "cancelled",
      "reason": "Cannot convert cancelled delivery note to invoice",
      "cancelledAt": "2026-02-19T09:15:00Z"
    }
  }
}
```

## Workflow Integration

### Standard Conversion Flow
1. Create delivery note (`POST /api/v1/delivery-notes`)
2. Issue delivery note (`POST /api/v1/delivery-notes/{uuid}/issue`)
3. Deliver goods/services
4. **Convert to invoice** (`POST /api/v1/delivery-notes/{uuid}/convert`) ← You are here
5. Upload invoice to ANAF (`POST /api/v1/invoices/{uuid}/upload`)
6. Send invoice to client

### Batch Conversion Flow
For multiple deliveries to same client:
1. Issue multiple delivery notes throughout month
2. At month-end, convert all to separate invoices
3. OR manually create single invoice referencing all delivery notes

### Immediate Invoicing
For immediate billing:
1. Create delivery note
2. **Convert immediately** (skip issue step)
3. Upload to ANAF
4. Issue goods with invoice

## Post-Conversion Actions

After conversion, you should:
1. **Upload to ANAF** - Submit the invoice to ANAF e-Factura system
2. **Generate PDF** - Create PDF version for client
3. **Send to client** - Email invoice to client
4. **Update CRM** - Sync invoice status to CRM
5. **Track payment** - Monitor payment against this invoice
6. **Archive delivery note** - Keep delivery note as reference

## Conversion Timing

### When to Convert

**Immediately after delivery:**
- Standard practice for most deliveries
- Client expects invoice soon after delivery
- No batch invoicing arrangement

**At period end:**
- Monthly batch invoicing agreement
- Multiple deliveries to accumulate
- Client prefers consolidated invoices

**Upon client request:**
- Client-specific invoicing schedule
- Project milestone completion
- Accumulated value threshold reached

**Before payment deadline:**
- Ensure invoice issued in time for payment
- Consider payment terms when timing conversion
- Don't delay beyond client's processing needs

## Best Practices

1. **Convert promptly** - Don't delay invoicing after delivery
2. **Review before converting** - Ensure all delivery note data is correct
3. **Choose correct series** - Use appropriate invoice series
4. **Set correct dates** - Issue date typically = today or delivery date
5. **Link documents** - Delivery note reference is automatically maintained
6. **Upload quickly** - Submit to ANAF within required timeframe
7. **Notify stakeholders** - Alert accounting and sales teams
8. **Track conversions** - Monitor which delivery notes still need invoicing
9. **Batch strategically** - Group deliveries when it makes business sense
10. **Document flow** - Keep clear record of delivery note → invoice linkage

## Conversion Metrics

Track these metrics for performance:
- **Conversion rate** - % of delivery notes converted to invoices
- **Time to conversion** - Days from issue to conversion
- **Outstanding delivery notes** - Not yet converted
- **Value not invoiced** - Total value in unconverted delivery notes
- **Conversion by client** - Which clients have unconverted deliveries
- **Aging analysis** - How old are unconverted delivery notes

## Reversing a Conversion

If the invoice needs to be cancelled after conversion:
1. **Cannot "unconvert"** - The conversion is permanent
2. **Use credit note** - Create a credit note to reverse the invoice
3. **Delivery note remains converted** - Original delivery note status doesn't change
4. **Create new delivery note** - If needed for corrected delivery

The bidirectional link between delivery note and invoice is maintained for audit trail purposes.

## Multiple Deliveries to One Invoice

For batch invoicing scenarios:

### Option 1: Multiple Conversions
- Convert each delivery note to separate invoice
- Client receives multiple invoices
- Each invoice linked to its delivery note

### Option 2: Manual Invoice Creation
- Keep delivery notes as reference
- Manually create invoice listing all deliveries
- Reference all delivery note numbers in invoice notes
- Don't use convert endpoint (delivery notes remain issued)

### Option 3: Periodic Summary Invoice
- Accumulate delivered items throughout period
- Create single invoice with summary line items
- Reference delivery note numbers in mentions
- Delivery notes remain issued (not converted)

## Integration Points

### Accounting Systems
- Sync invoice creation to accounting
- Link to delivery documentation
- Update revenue recognition
- Track receivables

### Warehouse Management
- Confirm inventory deduction
- Close delivery records
- Update stock cards
- Archive delivery documentation

### Payment Tracking
- Create payment tracking record
- Monitor invoice payment status
- Send payment reminders
- Update delivery note with payment info

## Compliance Notes

### Tax Implications
- Invoice date determines tax period
- Must match or follow delivery date
- Required for VAT deduction by client
- Keep delivery note as supporting documentation

### Retention Period
- Keep both delivery note and invoice
- Maintain clear linkage between documents
- Minimum 5-10 years retention
- Both physical and digital copies

## After Conversion

Next steps:
1. Verify invoice created correctly
2. Review invoice details match delivery
3. Upload to ANAF immediately
4. Generate PDF for client
5. Send invoice to client with delivery note reference
6. Set up payment tracking
7. Update all integrated systems
