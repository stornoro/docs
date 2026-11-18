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
The test delivery uses a fixed payload with event `webhook.test`. Your endpoint must answer with a `2xx` status within 10 seconds. The delivery is recorded in the delivery history. Testing needs the Professional or Business plan, and it works on inactive endpoints too. Test and retry calls share a limit of 10 requests per 10 minutes per user.
{% /callout %}

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Conditional | Company UUID. Optional when the organization has a single company. The `?company=` query parameter is also accepted |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Webhook endpoint ID |

## Request body

The endpoint takes no body.

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
console.log('Test result:', result.success, result.statusCode);
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns `200` with the outcome of the delivery.

```json
{
  "success": true,
  "statusCode": 200,
  "durationMs": 143,
  "error": null
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` when your endpoint answered with a `2xx` status |
| `statusCode` | integer\|null | HTTP status returned by your endpoint. `null` when no response was received |
| `durationMs` | integer | Round-trip time in milliseconds |
| `error` | string\|null | `HTTP <status>` for a non-2xx answer, `Delivery failed.` for a connection error or timeout, `Endpoint URL is not allowed.` when the stored URL no longer passes the URL rules. `null` on success |

### Test payload

Your endpoint receives the standard [envelope](/concepts/webhooks-events#webhook-payload-format):

```json
{
  "id": "0192b3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
  "event": "webhook.test",
  "created_at": "2026-02-18T10:00:00+00:00",
  "data": {
    "message": "This is a test webhook from Storno.ro."
  }
}
```

The `X-Webhook-Signature` header holds the lowercase hexadecimal HMAC-SHA256 of the raw body, computed with the endpoint secret. The other headers are `X-Webhook-Event` and `X-Webhook-Id`.

## Error codes

| Code | Description |
|------|-------------|
| `400` | No company selected |
| `401` | Missing or invalid authentication token |
| `402` | The plan does not include webhooks. Body has `code: "PLAN_LIMIT"` |
| `403` | Insufficient permissions. Requires `webhook.manage` |
| `404` | Webhook endpoint not found for this company |
| `429` | More than 10 test or retry requests in 10 minutes |
