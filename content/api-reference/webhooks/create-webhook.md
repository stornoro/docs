---
title: Create webhook
description: Register a new webhook endpoint for the current company
method: POST
endpoint: /api/v1/webhooks
---

# Create webhook

Registers a new webhook endpoint for the company identified by the `X-Company` header. The response includes the full signing secret. Store it immediately, because later reads return a masked value.

Webhooks need the Professional or Business plan. Other plans receive `402` with `code: "PLAN_LIMIT"`. An organization can register at most 10 endpoints across all its companies. The eleventh returns `409` with `code: "WEBHOOK_LIMIT"`.

```
POST /api/v1/webhooks
```

{% callout type="warning" %}
The `secret` field is returned in full only on creation. Copy it to a secure location before leaving this page — later reads return a masked value. If you lose the secret, use the [regenerate-secret endpoint](/api-reference/webhooks/regenerate-secret) to issue a new one.
{% /callout %}

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Conditional | Company UUID. Optional when the organization has a single company. The `?company=` query parameter is also accepted |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | string | Yes | Public HTTPS URL on port 443 that receives the POST requests. Plain HTTP, other ports, credentials in the URL and hosts that resolve to private addresses are rejected |
| `events` | array | Yes | Array of event type names to subscribe to (see [List event types](/api-reference/webhooks/list-events)). At least one is required |
| `description` | string | No | Human-readable label for this webhook endpoint |
| `isActive` | boolean | No | Whether the webhook is active on creation (default: `true`) |

{% callout type="note" %}
`events` must contain exact event names from [List event types](/api-reference/webhooks/list-events). The wildcard `["*"]` is not accepted and returns `400`.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.example.com/webhooks/storno",
    "events": ["invoice.created", "invoice.validated", "invoice.rejected", "payment.received"],
    "description": "Production invoice notifications",
    "isActive": true
  }'
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/webhooks', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://your-app.example.com/webhooks/storno',
    events: ['invoice.created', 'invoice.validated', 'invoice.rejected', 'payment.received'],
    description: 'Production invoice notifications',
    isActive: true
  })
});

// Returns 201 Created
const { data: webhook } = await response.json();

// Store webhook.secret securely. Later reads return a masked value
console.log('Signing secret:', webhook.secret);
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns `201 Created` with the webhook object under `data`. The `secret` field contains the full signing key.

```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "url": "https://your-app.example.com/webhooks/storno",
    "description": "Production invoice notifications",
    "events": [
      "invoice.created",
      "invoice.validated",
      "invoice.rejected",
      "payment.received"
    ],
    "secret": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a0",
    "isActive": true,
    "createdAt": "2026-02-18T10:00:00+00:00",
    "updatedAt": "2026-02-18T10:00:00+00:00"
  }
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Webhook endpoint UUID |
| `url` | string | The registered destination URL |
| `description` | string\|null | The provided description label |
| `events` | array | List of subscribed event type names |
| `isActive` | boolean | Active status of the webhook |
| `secret` | string | Signing secret, 64 hexadecimal characters. Shown in full only here and on regeneration |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 last-updated timestamp |

### Verifying webhook signatures

Each delivery carries an `X-Webhook-Signature` header. It is the lowercase hexadecimal HMAC-SHA256 of the raw request body, computed with the endpoint secret. There is no prefix. Compute it over the raw bytes, before parsing the JSON:

```javascript
const crypto = require('crypto');

function verifySignature(rawBody, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
```

See [Webhooks & Events](/concepts/webhooks-events) for the headers, retry behaviour and timeouts.

## Error codes

| Code | Description |
|------|-------------|
| `400` | No company selected, invalid URL (it must be public HTTPS on port 443), empty `events`, or an unknown event type |
| `401` | Missing or invalid authentication token |
| `402` | The plan does not include webhooks. Body has `code: "PLAN_LIMIT"` |
| `403` | Insufficient permissions. Requires `webhook.manage` |
| `409` | The organization already has 10 webhook endpoints. Body has `code: "WEBHOOK_LIMIT"` |
