---
title: List webhook deliveries
description: Retrieve a paginated list of delivery attempts for a webhook endpoint
method: GET
endpoint: /api/v1/webhooks/{uuid}/deliveries
---

# List webhook deliveries

Returns a paginated list of delivery attempts for the specified webhook endpoint. Each record summarizes the event type, outcome, response code, and timing of a single delivery attempt. Use the [get delivery endpoint](/api-reference/webhooks/get-delivery) to inspect the full request and response payload for any entry.

```
GET /api/v1/webhooks/{uuid}/deliveries
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Webhook endpoint UUID |

## Query parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `limit` | integer | 20 | Number of items per page (max 100) |
| `status` | string | - | Filter by delivery status: `success` or `failed` |
| `eventType` | string | - | Filter by event type name (e.g., `invoice.validated`) |
| `from` | string | - | Start date filter (ISO 8601 format: YYYY-MM-DD) |
| `to` | string | - | End date filter (ISO 8601 format: YYYY-MM-DD) |

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl "https://api.storno.ro/api/v1/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890/deliveries?page=1&limit=20&status=failed" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const params = new URLSearchParams({ page: 1, limit: 20, status: 'failed' });

const response = await fetch(
  `https://api.storno.ro/api/v1/webhooks/${uuid}/deliveries?${params}`,
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
      'X-Company': '550e8400-e29b-41d4-a716-446655440000'
    }
  }
);

const data = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns a paginated list of delivery attempt summaries.

```json
{
  "data": [
    {
      "uuid": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "eventType": "invoice.validated",
      "status": "failed",
      "responseCode": 503,
      "durationMs": 5002,
      "deliveredAt": "2026-02-18T09:45:00Z",
      "attempt": 1
    },
    {
      "uuid": "d4e5f6a7-b8c9-0123-def0-234567890123",
      "eventType": "invoice.created",
      "status": "success",
      "responseCode": 200,
      "durationMs": 87,
      "deliveredAt": "2026-02-18T08:30:00Z",
      "attempt": 1
    },
    {
      "uuid": "e5f6a7b8-c9d0-1234-ef01-345678901234",
      "eventType": "invoice.paid",
      "status": "success",
      "responseCode": 204,
      "durationMs": 112,
      "deliveredAt": "2026-02-17T16:00:00Z",
      "attempt": 1
    }
  ],
  "total": 142,
  "page": 1,
  "limit": 20,
  "pages": 8
}
```

### Pagination fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of delivery summary objects |
| `total` | integer | Total number of delivery attempts matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `pages` | integer | Total number of pages |

### Delivery summary fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique delivery attempt identifier |
| `eventType` | string | The event type that triggered this delivery |
| `status` | string | Outcome: `success` (2xx response) or `failed` (timeout or non-2xx) |
| `responseCode` | integer | HTTP status code returned by your endpoint, or `0` on timeout |
| `durationMs` | integer | Round-trip time in milliseconds |
| `deliveredAt` | string | ISO 8601 timestamp when the delivery was attempted |
| `attempt` | integer | Attempt number (1 for initial, higher for retries) |

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions — requires `webhook.view` permission |
| `404` | Webhook endpoint not found for this company |
| `422` | Invalid query parameter value |

## Related endpoints

- [Get delivery](/api-reference/webhooks/get-delivery) — Inspect the full payload and response for a single delivery
- [Test webhook](/api-reference/webhooks/test-webhook) — Trigger a new test delivery
