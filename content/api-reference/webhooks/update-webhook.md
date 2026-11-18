---
title: Update webhook
description: Update the URL, events, description, or active state of an existing webhook endpoint
method: PATCH
endpoint: /api/v1/webhooks/{uuid}
---

# Update webhook

Partially updates an existing webhook endpoint for the current company. Only the fields provided in the request body are changed. Omitted fields keep their current values. Updating needs the Professional or Business plan, otherwise the call returns `402` with `code: "PLAN_LIMIT"`.

```
PATCH /api/v1/webhooks/{uuid}
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Conditional | Company UUID. Optional when the organization has a single company. The `?company=` query parameter is also accepted |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Webhook endpoint ID |

## Request body

All fields are optional.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | string | No | New destination. Public HTTPS URL on port 443 |
| `events` | array | No | Replacement list of event names, at least one. See [List event types](/api-reference/webhooks/list-events). `["*"]` is not accepted |
| `description` | string\|null | No | Updated label. `null` clears it |
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
    "events": ["invoice.created", "invoice.validated", "invoice.rejected", "payment.received", "sync.completed"],
    "description": "Production notifications expanded",
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
    events: ['invoice.created', 'invoice.validated', 'invoice.rejected', 'payment.received', 'sync.completed'],
    description: 'Production notifications expanded',
    isActive: true
  })
});

const { data: webhook } = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the updated webhook endpoint under `data`.

```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "url": "https://your-app.example.com/webhooks/storno",
    "description": "Production notifications expanded",
    "events": [
      "invoice.created",
      "invoice.validated",
      "invoice.rejected",
      "payment.received",
      "sync.completed"
    ],
    "secret": "***15d6c15b",
    "isActive": true,
    "createdAt": "2026-02-10T09:00:00+00:00",
    "updatedAt": "2026-02-18T10:15:00+00:00"
  }
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Webhook endpoint UUID |
| `url` | string | Current destination URL |
| `description` | string\|null | Current label |
| `events` | array | Current subscribed event names |
| `secret` | string | Masked signing secret, unchanged by this call |
| `isActive` | boolean | Current active state |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 timestamp of this update |

## Error codes

| Code | Description |
|------|-------------|
| `400` | No company selected, invalid URL, empty `events`, or an unknown event type |
| `401` | Missing or invalid authentication token |
| `402` | The plan does not include webhooks. Body has `code: "PLAN_LIMIT"` |
| `403` | Insufficient permissions. Requires `webhook.manage` |
| `404` | Webhook endpoint not found for this company |

## Related endpoints

- [Get webhook](/api-reference/webhooks/get-webhook) — Retrieve current webhook configuration
- [Regenerate secret](/api-reference/webhooks/regenerate-secret) — Issue a new signing secret
- [Delete webhook](/api-reference/webhooks/delete-webhook) — Permanently remove this webhook
