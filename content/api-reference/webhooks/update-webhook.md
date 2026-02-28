---
title: Update webhook
description: Update the URL, events, description, or active state of an existing webhook endpoint
method: PATCH
endpoint: /api/v1/webhooks/{uuid}
---

# Update webhook

Partially updates an existing webhook endpoint for the current company. Only the fields provided in the request body are changed — omitted fields retain their current values.

```
PATCH /api/v1/webhooks/{uuid}
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Webhook endpoint UUID |

## Request body

All fields are optional. At least one field must be provided.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | string | No | New HTTPS destination URL |
| `events` | array | No | Replacement list of event type names to subscribe to |
| `description` | string | No | Updated human-readable label |
| `isActive` | boolean | No | Enable (`true`) or pause (`false`) deliveries |

{% callout type="note" %}
Providing `events` replaces the entire subscription list — it is not additive. Send the complete desired set of event types each time.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X PATCH https://api.storno.ro/api/v1/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "events": ["invoice.created", "invoice.validated", "invoice.rejected", "invoice.paid", "sync.completed"],
    "description": "Production notifications — expanded",
    "isActive": true
  }'
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const response = await fetch(`https://api.storno.ro/api/v1/webhooks/${uuid}`, {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    events: ['invoice.created', 'invoice.validated', 'invoice.rejected', 'invoice.paid', 'sync.completed'],
    description: 'Production notifications — expanded',
    isActive: true
  })
});

const webhook = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the updated webhook endpoint object.

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "url": "https://your-app.example.com/webhooks/storno",
  "description": "Production notifications — expanded",
  "events": [
    "invoice.created",
    "invoice.validated",
    "invoice.rejected",
    "invoice.paid",
    "sync.completed"
  ],
  "isActive": true,
  "secret": "whsec_••••••••••••••••••••••••",
  "createdAt": "2026-02-10T09:00:00Z",
  "updatedAt": "2026-02-18T10:15:00Z"
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier for the webhook endpoint |
| `url` | string | Current destination URL |
| `description` | string | Current description label |
| `events` | array | Current list of subscribed event type names |
| `isActive` | boolean | Current active state |
| `secret` | string | Masked signing secret (unchanged by this operation) |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 timestamp of this update |

## Error codes

| Code | Description |
|------|-------------|
| `400` | Validation error — no fields provided or invalid data format |
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions — requires `webhook.manage` permission |
| `404` | Webhook endpoint not found for this company |
| `422` | Business validation error — URL must use HTTPS, or unknown event type specified |

## Related endpoints

- [Get webhook](/api-reference/webhooks/get-webhook) — Retrieve current webhook configuration
- [Regenerate secret](/api-reference/webhooks/regenerate-secret) — Issue a new signing secret
- [Delete webhook](/api-reference/webhooks/delete-webhook) — Permanently remove this webhook
