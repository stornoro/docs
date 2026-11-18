---
title: Get webhook delivery
description: Retrieve full details of a single webhook delivery attempt including request and response payloads
method: GET
endpoint: /api/v1/webhooks/{uuid}/deliveries/{deliveryUuid}
---

# Get webhook delivery

Returns the details of a single delivery: the payload sent to your endpoint, the response status and the first 200 characters of the response body. Use it to debug failed deliveries or audit successful ones.

```
GET /api/v1/webhooks/{uuid}/deliveries/{deliveryUuid}
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
| `deliveryUuid` | string | Yes | Delivery ID |

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl "https://api.storno.ro/api/v1/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890/deliveries/c3d4e5f6-a7b8-9012-cdef-123456789012" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const webhookUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const deliveryUuid = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

const response = await fetch(
  `https://api.storno.ro/api/v1/webhooks/${webhookUuid}/deliveries/${deliveryUuid}`,
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
      'X-Company': '550e8400-e29b-41d4-a716-446655440000'
    }
  }
);

const { data: delivery } = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

```json
{
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "eventType": "invoice.validated",
    "status": "retrying",
    "payload": {
      "id": "0192b3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
      "event": "invoice.validated",
      "created_at": "2026-02-18T09:45:00+00:00",
      "data": {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "number": "FAC-2026-042",
        "status": "validated",
        "direction": "outgoing",
        "total": "1190.00",
        "currency": "RON"
      }
    },
    "responseStatusCode": 503,
    "responseBody": "Service Unavailable",
    "durationMs": 5002,
    "attempt": 1,
    "errorMessage": "HTTP 503",
    "triggeredAt": "2026-02-18T09:45:00+00:00",
    "completedAt": null,
    "nextRetryAt": "2026-02-18T09:46:00+00:00"
  }
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Delivery UUID. Also sent as the `X-Webhook-Id` header |
| `eventType` | string | The event that triggered the delivery |
| `status` | string | `pending`, `success`, `retrying` or `failed` |
| `payload` | object | The JSON body sent to your endpoint, in the [envelope](/concepts/webhooks-events#webhook-payload-format) format |
| `responseStatusCode` | integer\|null | HTTP status returned by your endpoint. `null` when there was no response |
| `responseBody` | string\|null | First 200 characters of the response body |
| `durationMs` | integer\|null | Round-trip time in milliseconds |
| `attempt` | integer | Current attempt number, 1 to 3 |
| `errorMessage` | string\|null | `HTTP <status>`, `Delivery failed.` or `Endpoint URL is not allowed.` |
| `triggeredAt` | string | ISO 8601 time the delivery was created |
| `completedAt` | string\|null | ISO 8601 time the delivery finished. `null` while a retry is pending |
| `nextRetryAt` | string\|null | ISO 8601 time of the next retry. `null` when none is pending |

The `data` of `payload` depends on the event. See [List event types](/api-reference/webhooks/list-events) for each event.

## Error codes

| Code | Description |
|------|-------------|
| `400` | No company selected |
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions. Requires `webhook.view` |
| `404` | Webhook endpoint or delivery not found for this company |

## Retry a delivery

Sends the stored payload of a past delivery again.

```
POST /api/v1/webhooks/{uuid}/deliveries/{deliveryUuid}/retry
```

The call queues a new delivery with attempt 1 and the same event type and payload. The original record is not changed. The new delivery follows the normal retry behaviour. Retrying needs `webhook.manage` and the Professional or Business plan.

Headers and path parameters are the same as above.

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST "https://api.storno.ro/api/v1/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890/deliveries/c3d4e5f6-a7b8-9012-cdef-123456789012/retry" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% /code-snippet-group %}

Returns `202 Accepted`:

```json
{
  "status": "queued"
}
```

| Code | Description |
|------|-------------|
| `400` | No company selected |
| `401` | Missing or invalid authentication token |
| `402` | The plan does not include webhooks. Body has `code: "PLAN_LIMIT"` |
| `403` | Insufficient permissions. Requires `webhook.manage` |
| `404` | Webhook endpoint or delivery not found |
| `409` | The webhook endpoint is disabled |
| `429` | More than 10 test or retry requests in 10 minutes |

## Related endpoints

- [List deliveries](/api-reference/webhooks/list-deliveries): Browse the deliveries of an endpoint
- [Test webhook](/api-reference/webhooks/test-webhook): Send a test delivery
