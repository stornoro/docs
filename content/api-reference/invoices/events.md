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
| `X-Company` | string | No | Not used on this route: the invoice is found by its UUID |

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

Returns an array of event objects, newest first. There is no pagination and no filtering.

```json
[
  {
    "id": "9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",
    "previousStatus": "sent_to_provider",
    "newStatus": "validated",
    "metadata": {
      "action": "anaf_validated",
      "downloadId": "DL-987654"
    },
    "createdAt": "2024-02-15T10:00:00+00:00",
    "createdBy": null
  },
  {
    "id": "8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
    "previousStatus": "issued",
    "newStatus": "sent_to_provider",
    "metadata": {
      "action": "submitted_to_anaf"
    },
    "createdAt": "2024-02-15T09:30:00+00:00",
    "createdBy": "john@yourcompany.example"
  },
  {
    "id": "4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e",
    "previousStatus": null,
    "newStatus": "draft",
    "metadata": {
      "action": "created"
    },
    "createdAt": "2024-02-15T08:30:00+00:00",
    "createdBy": "john@yourcompany.example"
  }
]
```

## Event object fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Event UUID |
| `previousStatus` | string or null | Status before the event. `null` for the first event |
| `newStatus` | string | Status after the event. For events that do not change the status, the current one |
| `metadata` | object or null | Details of the event. `metadata.action` names the kind of event |
| `createdAt` | string | ISO 8601 timestamp |
| `createdBy` | string or null | Email of the user who triggered the event, `null` for system events |

## Actions

The kind of event is in `metadata.action`. Values written by the API include:

| Action | Description |
|--------|-------------|
| `created` | Invoice created |
| `created_from_recurring` | Invoice generated from a recurring template |
| `issued` | Invoice issued (`metadata` carries `efacturaDelayHours` and `scheduledSendAt`) |
| `refund_issued` | Credit note or storno issued |
| `refunded` | The invoice was refunded by an issued credit note or storno |
| `storno_created` | Storno draft created |
| `submitted_to_anaf` | Submitted to ANAF |
| `submitted_to_einvoice` | Submitted to another e-invoice provider |
| `anaf_validated` | ANAF validated the invoice |
| `anaf_rejected` | ANAF rejected the invoice (`metadata.error` holds the message) |
| `synced_from_anaf` | Received invoice synced from ANAF |
| `payment_recorded` | Payment recorded, or the invoice was settled automatically |
| `payment_deleted`, `all_payments_deleted` | Payment removed |
| `receipt_issued` | Cash receipt issued for a payment |
| `efactura_message_sent` | Message sent to the issuer of a received invoice |
| `cancelled` | Invoice cancelled (`metadata.reason`) |
| `restored` | Invoice restored to draft |

Events that do not change the status have equal `previousStatus` and `newStatus`, or no `previousStatus`.

## Error codes

Error bodies have the form `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | The invoice belongs to another organization, or the user cannot view invoices |
| `404` | Invoice not found |

## Related endpoints

- [Get invoice details](/api-reference/invoices/get) - Get current invoice state
- [Issue invoice](/api-reference/invoices/issue) - Creates issue event
- [Submit invoice](/api-reference/invoices/submit) - Creates submission event
- [Cancel invoice](/api-reference/invoices/cancel) - Creates cancellation event
