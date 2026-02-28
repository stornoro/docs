---
title: Reject Proforma Invoice
description: Mark a proforma invoice as rejected by the client
method: POST
endpoint: /api/v1/proforma-invoices/{uuid}/reject
---

# Reject Proforma Invoice

Marks a proforma invoice as rejected by the client. This action transitions the proforma to `rejected` status and records the rejection timestamp.

Once rejected, the proforma cannot be converted to an invoice and serves as a historical record of the declined offer.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the proforma invoice to mark as rejected |

## Request Body (Optional)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rejectionReason` | string | No | Reason for rejection provided by the client |
| `rejectionNotes` | string | No | Internal notes about the rejection |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/reject \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Price too high",
    "rejectionNotes": "Client requested 15% discount, consider follow-up"
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/reject', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rejectionReason: 'Price too high',
    rejectionNotes: 'Client requested 15% discount, consider follow-up'
  })
});

const data = await response.json();
```

## Response

Returns the updated proforma invoice with `status = rejected` and `rejectedAt` timestamp:

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "number": "PRO-2026-001",
  "seriesId": "650e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "650e8400-e29b-41d4-a716-446655440000",
    "name": "PRO",
    "nextNumber": 2
  },
  "clientId": "750e8400-e29b-41d4-a716-446655440000",
  "client": {
    "uuid": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "registrationNumber": "RO12345678",
    "email": "contact@client.ro"
  },
  "status": "rejected",
  "issueDate": "2026-02-16",
  "dueDate": "2026-03-16",
  "validUntil": "2026-03-16",
  "currency": "RON",
  "exchangeRate": 1.0,
  "subtotal": "7000.00",
  "vatAmount": "1330.00",
  "total": "8330.00",
  "notes": "Payment terms: 30 days",
  "paymentTerms": "Net 30",
  "rejectionReason": "Price too high",
  "rejectionNotes": "Client requested 15% discount, consider follow-up",
  "sentAt": "2026-02-16T10:30:00Z",
  "acceptedAt": null,
  "rejectedAt": "2026-02-17T11:20:00Z",
  "cancelledAt": null,
  "convertedAt": null,
  "convertedInvoiceId": null,
  "createdAt": "2026-02-16T09:00:00Z",
  "updatedAt": "2026-02-17T11:20:00Z"
}
```

## State Changes

### Status Transition
- **Before:** `status = sent` (or `draft`)
- **After:** `status = rejected`

### Timestamp
- Sets `rejectedAt` to current UTC timestamp (ISO 8601 format)
- Updates `updatedAt` timestamp

### Restrictions Applied
Once rejected:
- Cannot be converted to invoice
- Cannot be accepted
- Cannot be edited or deleted
- Serves as historical record only

## Validation Rules

### Status Requirement
- Proforma must have `status = sent` or `status = draft`
- Cannot reject a proforma that is already accepted, rejected, converted, or cancelled

### Business Logic
Rejecting a proforma indicates:
- Client declines the offer
- No invoice will be generated from this proforma
- Opportunity to follow up with revised offer
- Record preserved for sales analytics

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Proforma invoice not found or doesn't belong to the company |
| 409 | `conflict` | Proforma status prevents rejection |
| 422 | `validation_error` | Invalid request body (if rejection reason/notes provided) |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict - Already Rejected

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be rejected",
    "details": {
      "status": "rejected",
      "reason": "Proforma invoice is already rejected",
      "rejectedAt": "2026-02-17T11:20:00Z"
    }
  }
}
```

### Status Conflict - Already Accepted

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be rejected",
    "details": {
      "status": "accepted",
      "reason": "Proforma invoice has already been accepted by the client",
      "acceptedAt": "2026-02-17T09:15:00Z"
    }
  }
}
```

### Status Conflict - Already Converted

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be rejected",
    "details": {
      "status": "converted",
      "reason": "Proforma invoice has already been converted to an invoice",
      "convertedAt": "2026-02-17T10:00:00Z",
      "convertedInvoiceId": "650e8400-e29b-41d4-a716-446655440111"
    }
  }
}
```

## Workflow Integration

### Typical Rejection Flow
1. Send proforma to client (`POST /api/v1/proforma-invoices/{uuid}/send`)
2. Client reviews and declines
3. **Mark as rejected** (`POST /api/v1/proforma-invoices/{uuid}/reject`) ← You are here
4. Create new proforma with revised terms (optional)
5. Update CRM with rejection reason
6. Schedule follow-up actions

### Client Portal Integration
If you have a client portal:
- Allow clients to reject proformas with reason
- Capture rejection reason from client directly
- Trigger notification to sales team
- Offer option to request revised quote

## Rejection Tracking

### Analytics Use Cases
Rejected proformas provide valuable insights:
- **Win/loss analysis** - Track rejection reasons
- **Pricing optimization** - Identify price sensitivity
- **Competitive analysis** - Understand why clients choose competitors
- **Sales training** - Learn from rejection patterns
- **Product fit** - Identify mismatched offerings

### Common Rejection Reasons
- Price too high
- Timeline not suitable
- Features don't match requirements
- Found alternative supplier
- Budget constraints
- Project cancelled/postponed
- Terms and conditions unacceptable
- Delivery location not supported

## Best Practices

1. **Always capture rejection reason** - Critical for sales intelligence
2. **Notify stakeholders** - Alert sales team immediately
3. **Update CRM** - Sync rejection status and reason
4. **Schedule follow-up** - Set reminder to reach out with revised offer
5. **Analyze patterns** - Review rejection reasons monthly
6. **Preserve data** - Keep rejected proformas for reporting
7. **Learn and adapt** - Use feedback to improve future offers

## Rejection vs Cancellation

**Reject** when:
- Client explicitly declines the offer
- Client decides not to proceed
- Client provides feedback or reason
- You want to track client-driven rejections

**Cancel** when:
- You want to withdraw the offer
- Terms changed and proforma is no longer valid
- Error in original proforma
- You want to track company-driven cancellations

Both statuses prevent conversion to invoice, but help distinguish between client-driven and company-driven outcomes.

## Recovery from Rejection

After rejection, you can:
1. Create a new proforma with revised terms
2. Offer discount or better payment terms
3. Adjust scope to match budget
4. Schedule follow-up meeting
5. Keep in pipeline for future opportunities

The rejected proforma remains accessible for reference when creating the revised offer.
