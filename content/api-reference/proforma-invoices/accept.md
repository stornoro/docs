---
title: Accept Proforma Invoice
description: Mark a proforma invoice as accepted by the client
method: POST
endpoint: /api/v1/proforma-invoices/{uuid}/accept
---

# Accept Proforma Invoice

Marks a proforma invoice as accepted by the client. This action transitions the proforma to `accepted` status and records the acceptance timestamp.

Once accepted, the proforma is ready to be converted into a final invoice.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the proforma invoice to mark as accepted |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/accept \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/accept', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

Returns the updated proforma invoice with `status = accepted` and `acceptedAt` timestamp:

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
  "status": "accepted",
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
  "sentAt": "2026-02-16T10:30:00Z",
  "acceptedAt": "2026-02-17T09:15:00Z",
  "rejectedAt": null,
  "cancelledAt": null,
  "convertedAt": null,
  "convertedInvoiceId": null,
  "createdAt": "2026-02-16T09:00:00Z",
  "updatedAt": "2026-02-17T09:15:00Z"
}
```

## State Changes

### Status Transition
- **Before:** `status = sent` (or `draft`)
- **After:** `status = accepted`

### Timestamp
- Sets `acceptedAt` to current UTC timestamp (ISO 8601 format)
- Updates `updatedAt` timestamp

### Next Actions
Once accepted, you can:
- [Convert to invoice](/api-reference/proforma-invoices/convert) - Create a final invoice from the proforma
- Keep as accepted - If client wants to delay invoicing
- [Cancel](/api-reference/proforma-invoices/cancel) - If deal falls through

## Validation Rules

### Status Requirement
- Proforma must have `status = sent` or `status = draft`
- Cannot accept a proforma that is already accepted, rejected, converted, or cancelled

### Business Logic
Accepting a proforma indicates:
- Client agrees with the terms and pricing
- Client commits to the purchase
- Proforma is ready for conversion to invoice
- No further changes to pricing or terms expected

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Proforma invoice not found or doesn't belong to the company |
| 409 | `conflict` | Proforma status prevents acceptance |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict - Already Accepted

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be accepted",
    "details": {
      "status": "accepted",
      "reason": "Proforma invoice is already accepted",
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
    "message": "Proforma invoice cannot be accepted",
    "details": {
      "status": "converted",
      "reason": "Proforma invoice has already been converted to an invoice",
      "convertedAt": "2026-02-17T10:00:00Z",
      "convertedInvoiceId": "650e8400-e29b-41d4-a716-446655440111"
    }
  }
}
```

### Status Conflict - Cancelled

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be accepted",
    "details": {
      "status": "cancelled",
      "reason": "Proforma invoice has been cancelled",
      "cancelledAt": "2026-02-16T15:30:00Z"
    }
  }
}
```

## Workflow Integration

### Typical Flow
1. Create proforma (`POST /api/v1/proforma-invoices`)
2. Send to client (`POST /api/v1/proforma-invoices/{uuid}/send`)
3. Client reviews and approves
4. **Mark as accepted** (`POST /api/v1/proforma-invoices/{uuid}/accept`) ← You are here
5. Convert to invoice (`POST /api/v1/proforma-invoices/{uuid}/convert`)
6. Send invoice to client and ANAF

### Alternative Flow
If client doesn't explicitly accept:
- Skip the accept step
- Convert directly from `sent` to `converted`
- This is valid for trusted clients or standard orders

### Client Portal Integration
If you have a client portal:
- Allow clients to accept proformas themselves
- Trigger this API call when they click "Accept"
- Send confirmation email after acceptance
- Notify sales team of acceptance

## Best Practices

1. **Record acceptance method** - Log how acceptance was received (email, phone, portal)
2. **Notify stakeholders** - Alert sales and accounting teams
3. **Trigger next steps** - Automatically initiate invoice conversion workflow
4. **Archive confirmation** - Store client's acceptance email/message
5. **Set conversion deadline** - Convert to invoice within reasonable timeframe
6. **Update CRM** - Sync acceptance status to your CRM system

## Acceptance vs Conversion

**Accept** when:
- Client explicitly approves the proforma
- You need to track approval as a separate business event
- There may be a delay between approval and invoicing
- You want clear audit trail of client consent

**Convert directly** when:
- Client approval is implicit (repeat orders, standing agreements)
- You want to invoice immediately after sending proforma
- Acceptance tracking is not required for your workflow
