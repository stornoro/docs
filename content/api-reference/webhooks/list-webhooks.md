---
title: List webhooks
description: Retrieve all webhook endpoints configured for the current company
method: GET
endpoint: /api/v1/webhooks
---

# List webhooks

Returns an array of all webhook endpoints registered for the company identified by the `X-Company` header. Secrets are masked in this listing — retrieve a single webhook to see the masked secret or regenerate to obtain a new full secret.

```
GET /api/v1/webhooks
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl https://api.storno.ro/api/v1/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/webhooks', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const webhooks = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns an array of webhook endpoint objects.

```json
[
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
    "secret": "whsec_••••••••••••••••••••••••",
    "createdAt": "2026-02-10T09:00:00Z",
    "updatedAt": "2026-02-15T14:30:00Z"
  },
  {
    "uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "url": "https://your-app.example.com/webhooks/sync",
    "description": "ANAF sync monitoring",
    "events": [
      "sync.completed",
      "sync.failed"
    ],
    "isActive": false,
    "secret": "whsec_••••••••••••••••••••••••",
    "createdAt": "2026-01-20T11:15:00Z",
    "updatedAt": "2026-01-20T11:15:00Z"
  }
]
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier for the webhook endpoint |
| `url` | string | The HTTPS URL that receives webhook POST requests |
| `description` | string | Optional human-readable label for this webhook |
| `events` | array | List of event type names this endpoint is subscribed to |
| `isActive` | boolean | Whether the webhook will receive deliveries |
| `secret` | string | Masked signing secret; shown in full only on creation or regeneration |
| `createdAt` | string | ISO 8601 timestamp when the webhook was created |
| `updatedAt` | string | ISO 8601 timestamp of the last update |

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions — requires `webhook.view` permission |
