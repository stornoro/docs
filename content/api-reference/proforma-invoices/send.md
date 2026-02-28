---
title: Send Proforma Invoice
description: Mark a proforma invoice as sent to the client
method: POST
endpoint: /api/v1/proforma-invoices/{uuid}/send
---

# Send Proforma Invoice

Marks a proforma invoice as sent to the client. This action transitions the proforma from `draft` status to `sent` status and records the timestamp when it was sent.

Once sent, the proforma becomes read-only and can no longer be edited or deleted. It can only be accepted, rejected, cancelled, or converted to an invoice.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the proforma invoice to mark as sent |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

Returns the updated proforma invoice with `status = sent` and `sentAt` timestamp:

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
  "status": "sent",
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
  "sentAt": "2026-02-16T14:30:00Z",
  "acceptedAt": null,
  "rejectedAt": null,
  "cancelledAt": null,
  "convertedAt": null,
  "convertedInvoiceId": null,
  "createdAt": "2026-02-16T09:00:00Z",
  "updatedAt": "2026-02-16T14:30:00Z"
}
```

## State Changes

### Status Transition
- **Before:** `status = draft`
- **After:** `status = sent`

### Timestamp
- Sets `sentAt` to current UTC timestamp (ISO 8601 format)
- Updates `updatedAt` timestamp

### Restrictions Applied
Once marked as sent:
- Cannot be updated (PUT requests will fail)
- Cannot be deleted (DELETE requests will fail)
- Can be accepted, rejected, cancelled, or converted

## Validation Rules

### Status Requirement
- Proforma must have `status = draft`
- Cannot send a proforma that is already sent, accepted, rejected, converted, or cancelled

### Data Completeness
Before sending, ensure the proforma has:
- Valid client information
- At least one line item
- All required fields populated
- Correct totals calculated

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Proforma invoice not found or doesn't belong to the company |
| 409 | `conflict` | Proforma status prevents sending (not in draft status) |
| 422 | `validation_error` | Proforma data is incomplete or invalid |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be sent",
    "details": {
      "status": "sent",
      "reason": "Proforma invoice is already marked as sent",
      "sentAt": "2026-02-16T10:30:00Z"
    }
  }
}
```

### Validation Error

```json
{
  "error": {
    "code": "validation_error",
    "message": "Proforma invoice data is incomplete",
    "details": {
      "client.email": ["Client email is required before sending"],
      "lines": ["At least one line item is required"]
    }
  }
}
```

## Integration Notes

### Email Integration
This endpoint only changes the status in the database. To actually send the proforma via email, you should:

1. Call this endpoint to mark as sent
2. Use the [Email Sending API](/api-reference/emails/send) to deliver the PDF to the client
3. The email API will automatically attach the generated PDF

### Workflow Integration
After marking as sent, you may want to:
- Generate and download the PDF for your records
- Send email notification to the client
- Set up reminders for follow-up
- Track when the client views/downloads the document

### Reversibility
There is no "unsend" action. Once sent, the proforma remains in sent status until:
- Client accepts it (→ `accepted`)
- Client rejects it (→ `rejected`)
- You cancel it (→ `cancelled`)
- You convert it to an invoice (→ `converted`)

## Best Practices

1. **Validate before sending** - Review all data before marking as sent
2. **Email immediately** - Send the email right after this API call
3. **Log the action** - Record who sent it and when in your application logs
4. **Notify stakeholders** - Alert relevant team members that proforma was sent
5. **Set follow-up reminders** - Based on `validUntil` date
