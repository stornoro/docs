---
title: Issue Delivery Note
description: Mark a delivery note as issued when delivery occurs
method: POST
endpoint: /api/v1/delivery-notes/{uuid}/issue
---

# Issue Delivery Note

Marks a delivery note as issued when the physical delivery of goods or completion of services occurs. This action transitions the delivery note from `draft` status to `issued` status and records the timestamp.

When the delivery note is issued, the next sequential number from its assigned `delivery_note` series is permanently assigned. If no series was explicitly set on the delivery note, the company's default `delivery_note` series is auto-found and used at this point.

Once issued, the delivery note becomes read-only and can only be cancelled or converted to an invoice.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note to mark as issued |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/issue \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/issue', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

Returns the updated delivery note with `status = issued` and `issuedAt` timestamp:

```json
{
  "uuid": "950e8400-e29b-41d4-a716-446655440000",
  "number": "DN-2026-012",
  "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "850e8400-e29b-41d4-a716-446655440000",
    "name": "DN",
    "nextNumber": 13
  },
  "clientId": "750e8400-e29b-41d4-a716-446655440000",
  "client": {
    "uuid": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "registrationNumber": "RO12345678",
    "email": "contact@client.ro"
  },
  "status": "issued",
  "issueDate": "2026-02-18",
  "dueDate": "2026-03-18",
  "currency": "RON",
  "exchangeRate": 1.0,
  "subtotal": "5000.00",
  "vatAmount": "950.00",
  "total": "5950.00",
  "deliveryLocation": "Client warehouse - Str. Depozit 5, București",
  "projectReference": "PROJECT-2026-002",
  "deputyName": "Maria Ionescu",
  "deputyIdentityCard": "AB123456",
  "deputyAuto": "B-123-ABC",
  "notes": "Handle with care - fragile items",
  "issuedAt": "2026-02-18T14:30:00Z",
  "convertedAt": null,
  "convertedInvoiceId": null,
  "createdAt": "2026-02-18T09:00:00Z",
  "updatedAt": "2026-02-18T14:30:00Z"
}
```

## State Changes

### Status Transition
- **Before:** `status = draft`
- **After:** `status = issued`

### Series & Number Assignment
- The next sequential number from the assigned `delivery_note` series is permanently locked in
- If no `documentSeriesId` was set on the delivery note, the company's default `delivery_note` series is auto-found and assigned at this point
- Once issued, the series and document number cannot be changed

### Timestamp
- Sets `issuedAt` to current UTC timestamp (ISO 8601 format)
- Updates `updatedAt` timestamp

### Restrictions Applied
Once marked as issued:
- Cannot be updated (PUT requests will fail)
- Cannot be deleted (DELETE requests will fail)
- Can be cancelled or converted to invoice

## Validation Rules

### Status Requirement
- Delivery note must have `status = draft`
- Cannot issue a delivery note that is already issued, converted, or cancelled

### Data Completeness
Before issuing, ensure the delivery note has:
- Valid client information
- At least one line item
- All required fields populated
- Correct totals calculated
- Delivery location specified (recommended)
- Deputy information captured (recommended)

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Delivery note not found or doesn't belong to the company |
| 409 | `conflict` | Delivery note status prevents issuing (not in draft status) |
| 422 | `validation_error` | Delivery note data is incomplete or invalid |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict

```json
{
  "error": {
    "code": "conflict",
    "message": "Delivery note cannot be issued",
    "details": {
      "status": "issued",
      "reason": "Delivery note is already marked as issued",
      "issuedAt": "2026-02-18T14:30:00Z"
    }
  }
}
```

### Validation Error

```json
{
  "error": {
    "code": "validation_error",
    "message": "Delivery note data is incomplete",
    "details": {
      "deliveryLocation": ["Delivery location is recommended before issuing"],
      "deputyName": ["Deputy name is recommended for proof of delivery"],
      "lines": ["At least one line item is required"]
    }
  }
}
```

## When to Issue

Issue the delivery note:
- **At delivery time** - When goods are physically delivered
- **Upon service completion** - When services are completed
- **After client verification** - When client confirms receipt
- **Before transport** - For shipments requiring delivery note

## Workflow Integration

### Standard Delivery Flow
1. Create delivery note (`POST /api/v1/delivery-notes`)
2. Load goods for delivery
3. Transport to delivery location
4. **Mark as issued** (`POST /api/v1/delivery-notes/{uuid}/issue`) ← You are here
5. Get client signature on physical copy
6. Convert to invoice (`POST /api/v1/delivery-notes/{uuid}/convert`)
7. Upload invoice to ANAF

### Service Completion Flow
1. Create delivery note for services
2. Perform services at client location
3. **Mark as issued** when work is complete
4. Client verifies completion
5. Convert to invoice for payment

### Batch Delivery Flow
1. Create multiple delivery notes
2. **Issue each** as deliveries occur
3. Accumulate throughout the month
4. Convert all to single invoice at month-end

## Physical Documentation

After marking as issued:
1. **Print delivery note** - Generate PDF for signature
2. **Get client signature** - Physical proof of delivery
3. **Scan signed copy** - Archive digital copy
4. **Keep original** - Store signed original per regulations
5. **Send copy to client** - Email PDF copy for their records

## Proof of Delivery

The issued delivery note serves as:
- **Legal proof** - Evidence that goods were delivered
- **Tax documentation** - Support for invoice
- **Dispute resolution** - Reference in case of conflicts
- **Logistics record** - Tracking of deliveries
- **Customs documentation** - For international shipments

### Essential Information for Proof
- Deputy name and signature
- Deputy ID card number
- Date and time of delivery
- Delivery location
- Vehicle registration (if applicable)
- Item quantities and condition

## Reversibility

There is no "unissue" action. Once issued, the delivery note remains in issued status until:
- You cancel it (→ `cancelled`)
- You convert it to an invoice (→ `converted`)

If issued by mistake:
1. Cannot revert to draft
2. Must cancel if delivery didn't occur
3. Create new delivery note if needed

## Integration Points

### Logistics Systems
After issuing:
- Update logistics system with delivery confirmation
- Close transport order
- Update driver route status
- Record delivery time

### Inventory Systems
After issuing:
- Deduct items from warehouse inventory
- Update stock levels
- Record location of goods (transferred to client)
- Trigger reorder if needed

### Accounting Systems
After issuing:
- Mark goods as delivered (revenue recognition)
- Prepare for invoicing
- Update client balance (if accrual accounting)

## Best Practices

1. **Issue at delivery time** - Mark as issued when delivery actually occurs
2. **Verify data first** - Review all details before issuing
3. **Capture signatures** - Get client signature on physical copy
4. **Photo evidence** - Take photo of delivered goods and signature
5. **Log the action** - Record who issued it and when
6. **Update systems** - Sync status to logistics and inventory systems
7. **Convert promptly** - Don't delay invoicing after delivery
8. **Archive documents** - Keep signed copies per legal requirements
9. **Notify stakeholders** - Alert accounting and sales teams
10. **Track conversions** - Monitor which delivery notes need invoicing

## Delivery Note Lifecycle

```
draft → issued → converted
         ↓
      cancelled
```

- **Draft** - Created but not yet delivered
- **Issued** - Delivery occurred, waiting for invoicing
- **Converted** - Invoice created from delivery note
- **Cancelled** - Delivery cancelled (from draft or issued)

## Compliance Notes

### Romanian Requirements
- Delivery notes (AVZ - Aviz de însoțire a mărfii) required for:
  - Transport of goods between locations
  - Deliveries to clients
  - Proof of delivery for VAT purposes

### Retention Period
- Keep signed delivery notes for minimum legal period
- Typically 5-10 years depending on regulation
- Both physical and digital copies recommended

### Tax Implications
- Delivery note date may affect revenue recognition
- Must match or precede invoice date
- Required for VAT deduction by client

## After Issuing

Next steps after marking as issued:
1. Archive signed physical copy
2. Update inventory systems
3. Schedule invoice conversion
4. Monitor payment timeline
5. Track outstanding deliveries not yet invoiced
