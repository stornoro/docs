---
title: Cancel Proforma Invoice
description: Cancel a proforma invoice
method: POST
endpoint: /api/v1/proforma-invoices/{uuid}/cancel
---

# Cancel Proforma Invoice

Cancels a proforma invoice by transitioning it to `cancelled` status. This action is used when you need to withdraw or invalidate a proforma without deleting it from the system.

Unlike deletion, cancellation preserves the proforma for historical records and audit trail while preventing any further actions.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the proforma invoice to cancel |

## Request Body (Optional)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cancellationReason` | string | No | Reason for cancellation |
| `cancellationNotes` | string | No | Internal notes about the cancellation |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "cancellationReason": "Client changed requirements",
    "cancellationNotes": "New proforma to be created with updated specs"
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/cancel', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cancellationReason: 'Client changed requirements',
    cancellationNotes: 'New proforma to be created with updated specs'
  })
});

const data = await response.json();
```

## Response

Returns the updated proforma invoice with `status = cancelled` and `cancelledAt` timestamp:

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
  "status": "cancelled",
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
  "cancellationReason": "Client changed requirements",
  "cancellationNotes": "New proforma to be created with updated specs",
  "sentAt": "2026-02-16T10:30:00Z",
  "acceptedAt": null,
  "rejectedAt": null,
  "cancelledAt": "2026-02-18T14:45:00Z",
  "convertedAt": null,
  "convertedInvoiceId": null,
  "createdAt": "2026-02-16T09:00:00Z",
  "updatedAt": "2026-02-18T14:45:00Z"
}
```

## State Changes

### Status Transition
- **Before:** Any status except `converted` or `cancelled`
- **After:** `status = cancelled`

### Timestamp
- Sets `cancelledAt` to current UTC timestamp (ISO 8601 format)
- Updates `updatedAt` timestamp

### Restrictions Applied
Once cancelled:
- Cannot be converted to invoice
- Cannot be accepted or rejected
- Cannot be edited or deleted
- Cannot be sent (if was in draft)
- Serves as historical record only

## Validation Rules

### Status Requirement
Can cancel proforma in these statuses:
- `draft` - Not yet sent
- `sent` - Sent but not yet responded to
- `accepted` - Accepted but not yet converted
- `rejected` - Previously rejected

Cannot cancel proforma in these statuses:
- `converted` - Already converted to invoice (use credit note instead)
- `cancelled` - Already cancelled

### Business Logic
Cancelling a proforma indicates:
- Offer is no longer valid
- Terms have changed significantly
- Project is cancelled or postponed
- Error in proforma that cannot be corrected
- Duplicate proforma created by mistake

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Proforma invoice not found or doesn't belong to the company |
| 409 | `conflict` | Proforma status prevents cancellation (already converted or cancelled) |
| 422 | `validation_error` | Invalid request body (if cancellation reason/notes provided) |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict - Already Cancelled

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be cancelled",
    "details": {
      "status": "cancelled",
      "reason": "Proforma invoice is already cancelled",
      "cancelledAt": "2026-02-18T14:45:00Z"
    }
  }
}
```

### Status Conflict - Already Converted

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be cancelled",
    "details": {
      "status": "converted",
      "reason": "Proforma invoice has already been converted to an invoice. Use credit note to reverse the invoice instead.",
      "convertedAt": "2026-02-17T10:00:00Z",
      "convertedInvoiceId": "650e8400-e29b-41d4-a716-446655440111"
    }
  }
}
```

## Cancellation Reasons

### Common Reasons
- **Client request** - Client asked to cancel
- **Requirements changed** - Scope or specifications changed
- **Pricing error** - Wrong prices or calculations
- **Duplicate** - Created by mistake
- **Project postponed** - Client delays project
- **Project cancelled** - Client cancels entirely
- **Wrong client** - Sent to wrong client
- **Expired** - Validity period passed without response
- **Terms unacceptable** - Couldn't agree on terms
- **Budget constraints** - Client has no budget

## Cancel vs Delete vs Reject

### Cancel
- **Use when:** You want to withdraw the offer from your side
- **Preserves:** Full audit trail and historical data
- **Status:** `cancelled`
- **Can be done:** At any status (except converted/cancelled)

### Delete
- **Use when:** Proforma created by mistake (draft only)
- **Preserves:** Nothing - permanently removed
- **Status:** N/A - record is deleted
- **Can be done:** Only in `draft` status

### Reject
- **Use when:** Client declines the offer
- **Preserves:** Full audit trail with client feedback
- **Status:** `rejected`
- **Can be done:** When client provides response

## Workflow Integration

### Cancellation Flow
1. Determine cancellation is necessary
2. **Call cancel endpoint** (`POST /api/v1/proforma-invoices/{uuid}/cancel`) ← You are here
3. Notify relevant stakeholders
4. Create replacement proforma if needed
5. Update CRM and project management systems

### Notification Strategy
After cancellation:
- Notify sales team
- Update project management system
- Log reason in CRM
- Inform client if already sent
- Archive related documents

## Best Practices

1. **Always provide cancellation reason** - Essential for analytics and audit
2. **Communicate with client** - Inform client if proforma was already sent
3. **Create replacement** - Issue new proforma with correct information if needed
4. **Track patterns** - Monitor cancellation reasons to improve processes
5. **Update linked systems** - Sync status to CRM and project tools
6. **Preserve relationships** - Handle cancellations professionally
7. **Document context** - Use internal notes for detailed context

## Analytics and Reporting

### Cancellation Metrics
Track these metrics for process improvement:
- Cancellation rate by status
- Time between creation and cancellation
- Most common cancellation reasons
- Cancellations by client or sales agent
- Conversion rate after cancellation (new proforma created)

### Process Improvement
Use cancellation data to:
- Identify training needs
- Improve validation workflows
- Reduce errors in proforma creation
- Optimize pricing strategies
- Better qualify leads before sending proformas

## Recovery After Cancellation

Common next steps after cancellation:
1. **Create new proforma** - With corrected information
2. **Close opportunity** - If project is truly cancelled
3. **Schedule follow-up** - If project is postponed
4. **Negotiate terms** - If cancellation was due to disagreement
5. **Learn from errors** - If cancellation was due to mistake
