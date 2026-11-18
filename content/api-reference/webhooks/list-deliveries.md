---
title: List webhook deliveries
description: Retrieve a paginated list of delivery attempts for a webhook endpoint
method: GET
endpoint: /api/v1/webhooks/{uuid}/deliveries
---

# List webhook deliveries

Returns a paginated list of deliveries for the specified webhook endpoint, newest first. Each record summarizes the event type, outcome, response code and timing. Use the [get delivery endpoint](/api-reference/webhooks/get-delivery) to inspect the full request and response payload for any entry.

```
GET /api/v1/webhooks/{uuid}/deliveries
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Conditional | Company UUID. Optional when the organization has a single company. The `?company=` query parameter is also accepted |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Webhook endpoint ID |

## Query parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page, 1 to 100 |

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl "https://api.storno.ro/api/v1/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890/deliveries?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const params = new URLSearchParams({ page: 1, limit: 20 });

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

```json
{
  "data": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "eventType": "invoice.validated",
      "status": "retrying",
      "responseStatusCode": 503,
      "durationMs": 5002,
      "attempt": 1,
      "errorMessage": "HTTP 503",
      "triggeredAt": "2026-02-18T09:45:00+00:00",
      "completedAt": null
    },
    {
      "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
      "eventType": "invoice.created",
      "status": "success",
      "responseStatusCode": 200,
      "durationMs": 87,
      "attempt": 1,
      "errorMessage": null,
      "triggeredAt": "2026-02-18T08:30:00+00:00",
      "completedAt": "2026-02-18T08:30:00+00:00"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}
```

### Pagination fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Delivery summary objects |
| `meta.page` | integer | Current page |
| `meta.limit` | integer | Items per page |
| `meta.total` | integer | Total deliveries for this endpoint |

### Delivery summary fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Delivery UUID. Also sent as the `X-Webhook-Id` header |
| `eventType` | string | The event that triggered the delivery |
| `status` | string | `pending`, `success`, `retrying` or `failed` |
| `responseStatusCode` | integer\|null | HTTP status returned by your endpoint. `null` when there was no response |
| `durationMs` | integer\|null | Round-trip time in milliseconds |
| `attempt` | integer | Attempt number, 1 to 3 |
| `errorMessage` | string\|null | `HTTP <status>`, `Delivery failed.` or `Endpoint URL is not allowed.` |
| `triggeredAt` | string | ISO 8601 time the delivery was created |
| `completedAt` | string\|null | ISO 8601 time the delivery finished. `null` while a retry is pending |

A delivery keeps one record across its retries. The record is updated with each attempt.

## Error codes

| Code | Description |
|------|-------------|
| `400` | No company selected |
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions. Requires `webhook.view` |
| `404` | Webhook endpoint not found for this company |

## Related endpoints

- [Get delivery](/api-reference/webhooks/get-delivery) — Inspect the full payload and response for a single delivery
- [Test webhook](/api-reference/webhooks/test-webhook) — Trigger a new test delivery
