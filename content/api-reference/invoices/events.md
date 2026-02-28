---
title: Get invoice events
description: Retrieve the timeline of status changes and actions for an invoice
---

# Get invoice events

Retrieves the complete timeline of events for an invoice, including status changes, submissions, validations, and user actions. Useful for audit trails and understanding invoice history.

```
GET /api/v1/invoices/{uuid}/events
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/events', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const events = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns an array of event objects, ordered by timestamp (newest first).

```json
[
  {
    "id": "9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",
    "type": "anaf_validated",
    "status": "validated",
    "timestamp": "2024-02-15T10:00:00Z",
    "details": "Invoice validated by e-invoice provider successfully",
    "user": {
      "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "name": "System",
      "email": null
    },
    "metadata": {
      "validationId": "ANAF-VAL-123456",
      "downloadId": "DL-987654"
    }
  },
  {
    "id": "8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
    "type": "anaf_submitted",
    "status": "sent_to_provider",
    "timestamp": "2024-02-15T09:30:00Z",
    "details": "Invoice submitted to e-invoice provider",
    "user": {
      "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "name": "John Doe",
      "email": "john@yourcompany.ro"
    },
    "metadata": {
      "submissionId": "ANAF-2024-123456"
    }
  },
  {
    "id": "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
    "type": "status_change",
    "status": "issued",
    "timestamp": "2024-02-15T09:00:00Z",
    "details": "Invoice issued successfully",
    "user": {
      "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "name": "John Doe",
      "email": "john@yourcompany.ro"
    },
    "metadata": {
      "xmlGenerated": true,
      "pdfGenerated": true
    }
  },
  {
    "id": "6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a",
    "type": "payment_received",
    "status": null,
    "timestamp": "2024-02-20T14:30:00Z",
    "details": "Payment of 500.00 RON received",
    "user": {
      "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "name": "Jane Smith",
      "email": "jane@yourcompany.ro"
    },
    "metadata": {
      "paymentId": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
      "amount": 500.00,
      "currency": "RON",
      "method": "bank_transfer"
    }
  },
  {
    "id": "5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f",
    "type": "email_sent",
    "status": null,
    "timestamp": "2024-02-15T09:05:00Z",
    "details": "Invoice emailed to billing@acme.ro",
    "user": {
      "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "name": "John Doe",
      "email": "john@yourcompany.ro"
    },
    "metadata": {
      "to": "billing@acme.ro",
      "subject": "Invoice FAC-2024-001",
      "attachments": ["pdf", "xml"]
    }
  },
  {
    "id": "4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e",
    "type": "created",
    "status": "draft",
    "timestamp": "2024-02-15T08:30:00Z",
    "details": "Invoice created",
    "user": {
      "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "name": "John Doe",
      "email": "john@yourcompany.ro"
    },
    "metadata": null
  }
]
```

## Event types

| Type | Description | Status change |
|------|-------------|---------------|
| `created` | Invoice was created | draft |
| `updated` | Invoice data was modified | - |
| `status_change` | Status changed manually | varies |
| `issued` | Invoice was issued | issued |
| `anaf_submitted` | Submitted to e-invoice provider | sent_to_provider |
| `anaf_validated` | Provider validation passed | validated |
| `anaf_rejected` | Provider validation failed | rejected |
| `email_sent` | Invoice emailed to client | - |
| `payment_received` | Payment recorded | - |
| `payment_deleted` | Payment removed | - |
| `cancelled` | Invoice cancelled | cancelled |
| `restored` | Invoice restored from cancelled | draft |
| `pdf_generated` | PDF file generated | - |
| `xml_generated` | XML file generated | - |
| `viewed` | Invoice viewed by client | - |
| `downloaded` | Invoice downloaded | - |

## Event object fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Event UUID |
| `type` | string | Event type identifier |
| `status` | string\|null | New status (if status changed) |
| `timestamp` | string | ISO 8601 timestamp |
| `details` | string | Human-readable event description |
| `user` | object\|null | User who triggered the event |
| `metadata` | object\|null | Additional event-specific data |

## Use cases

- **Audit trail** - Track who did what and when
- **Debugging** - Understand why an invoice is in a certain state
- **Timeline display** - Show invoice history to users
- **Compliance** - Maintain records of all invoice actions
- **Notifications** - Trigger alerts based on events
- **Analytics** - Analyze invoice lifecycle patterns

## Filtering events (future)

While not currently supported, future versions may support filtering:

```
GET /api/v1/invoices/{uuid}/events?type=status_change&from=2024-01-01
```

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Invoice not found |

## Related endpoints

- [Get invoice details](/api-reference/invoices/get) - Get current invoice state
- [Issue invoice](/api-reference/invoices/issue) - Creates issue event
- [Submit invoice](/api-reference/invoices/submit) - Creates submission event
- [Cancel invoice](/api-reference/invoices/cancel) - Creates cancellation event
