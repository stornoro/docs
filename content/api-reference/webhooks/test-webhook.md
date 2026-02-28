---
title: Test webhook
description: Send a synchronous test delivery to a webhook endpoint
method: POST
endpoint: /api/v1/webhooks/{uuid}/test
---

# Test webhook

Sends a synchronous test event delivery to the specified webhook endpoint and returns the outcome immediately. Use this to verify your endpoint URL is reachable, your signature verification logic is correct, and your server responds with a `2xx` status.

```
POST /api/v1/webhooks/{uuid}/test
```

{% callout type="note" %}
The test delivery uses a synthetic payload with event type `webhook.test`. Your endpoint must respond within 10 seconds with any `2xx` HTTP status code for the test to be considered successful. The delivery is recorded in the webhook's delivery history.
{% /callout %}

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | No | Optionally `application/json` if providing a body |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Webhook endpoint UUID |

## Request body

The request body is optional. If omitted, a default test payload is used.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `eventType` | string | No | Override the test event type name (default: `webhook.test`) |

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const response = await fetch(`https://api.storno.ro/api/v1/webhooks/${uuid}/test`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const result = await response.json();
console.log('Test result:', result.status, result.responseCode);
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the outcome of the synchronous test delivery with status `200 OK`.

```json
{
  "deliveryUuid": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "status": "success",
  "eventType": "webhook.test",
  "requestPayload": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "type": "webhook.test",
    "createdAt": "2026-02-18T10:00:00Z",
    "company": "550e8400-e29b-41d4-a716-446655440000",
    "data": {
      "message": "This is a test delivery from Storno.ro",
      "webhookUuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    }
  },
  "requestHeaders": {
    "Content-Type": "application/json",
    "X-Storno-Event": "webhook.test",
    "X-Storno-Signature": "sha256=3e7b3a...",
    "X-Storno-Delivery": "c3d4e5f6-a7b8-9012-cdef-123456789012"
  },
  "responseCode": 200,
  "responseBody": "OK",
  "durationMs": 143,
  "deliveredAt": "2026-02-18T10:00:00Z"
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `deliveryUuid` | string | UUID of the delivery record created for this test |
| `status` | string | Outcome: `success` (2xx response received) or `failed` (timeout or non-2xx) |
| `eventType` | string | The event type name used for the test payload |
| `requestPayload` | object | The exact JSON body sent to your endpoint |
| `requestHeaders` | object | HTTP headers included in the delivery request |
| `responseCode` | integer | HTTP status code returned by your endpoint |
| `responseBody` | string | First 1,024 characters of your endpoint's response body |
| `durationMs` | integer | Round-trip time in milliseconds |
| `deliveredAt` | string | ISO 8601 timestamp of the delivery attempt |

### Delivery payload structure

Every webhook delivery (including test deliveries) sends a JSON body with this shape:

```json
{
  "id": "<delivery-uuid>",
  "type": "<event-type>",
  "createdAt": "<ISO 8601 timestamp>",
  "company": "<company-uuid>",
  "data": { }
}
```

The `X-Storno-Signature` header contains `sha256=<hmac-hex>` where the HMAC is computed over the raw request body using your webhook's signing secret.

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions — requires `webhook.manage` permission |
| `404` | Webhook endpoint not found for this company |
| `422` | Webhook is inactive — activate it before sending a test delivery |
