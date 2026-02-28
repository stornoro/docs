---
title: Create webhook
description: Register a new webhook endpoint for the current company
method: POST
endpoint: /api/v1/webhooks
---

# Create webhook

Registers a new webhook endpoint for the company identified by the `X-Company` header. The response includes the full signing secret — store it securely immediately, as it will be masked in all subsequent responses.

```
POST /api/v1/webhooks
```

{% callout type="warning" %}
The `secret` field is returned in full only on creation. Copy it to a secure location before leaving this page — subsequent GET requests will return a masked value. If you lose the secret, use the [regenerate-secret endpoint](/api-reference/webhooks/regenerate-secret) to issue a new one.
{% /callout %}

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | string | Yes | HTTPS destination URL that will receive POST requests |
| `events` | array | Yes | Array of event type names to subscribe to (see [List event types](/api-reference/webhooks/list-events)) |
| `description` | string | No | Human-readable label for this webhook endpoint |
| `isActive` | boolean | No | Whether the webhook is active on creation (default: `true`) |

{% callout type="note" %}
The `url` must use HTTPS. HTTP URLs are rejected. Use the wildcard value `["*"]` for `events` to subscribe to all current and future event types.
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
    "events": ["invoice.created", "invoice.validated", "invoice.rejected", "invoice.paid"],
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
    events: ['invoice.created', 'invoice.validated', 'invoice.rejected', 'invoice.paid'],
    description: 'Production invoice notifications',
    isActive: true
  })
});

// Returns 201 Created
const webhook = await response.json();

// Store webhook.secret securely — it will be masked in future responses
console.log('Signing secret:', webhook.secret);
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the created webhook object with status `201 Created`. The `secret` field contains the full HMAC-SHA256 signing key.

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "url": "https://your-app.example.com/webhooks/storno",
  "description": "Production invoice notifications",
  "events": [
    "invoice.created",
    "invoice.validated",
    "invoice.rejected",
    "invoice.paid"
  ],
  "isActive": true,
  "secret": "whsec_9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  "createdAt": "2026-02-18T10:00:00Z",
  "updatedAt": "2026-02-18T10:00:00Z"
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier for the new webhook endpoint |
| `url` | string | The registered destination URL |
| `description` | string | The provided description label |
| `events` | array | List of subscribed event type names |
| `isActive` | boolean | Active status of the webhook |
| `secret` | string | Full HMAC-SHA256 signing secret — save this value immediately |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 last-updated timestamp |

### Verifying webhook signatures

Each delivery includes an `X-Storno-Signature` header containing a HMAC-SHA256 hex digest of the raw request body signed with the secret. Verify it server-side:

```javascript
const crypto = require('crypto');

function verifySignature(rawBody, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}
```

## Error codes

| Code | Description |
|------|-------------|
| `400` | Validation error — missing required fields or invalid data |
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions — requires `webhook.manage` permission |
| `422` | Business validation error — URL must use HTTPS, or unknown event type specified |
