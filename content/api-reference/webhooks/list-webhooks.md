---
title: List webhooks
description: Retrieve all webhook endpoints configured for the current company
method: GET
endpoint: /api/v1/webhooks
---

# List webhooks

Returns an array of all webhook endpoints registered for the company identified by the `X-Company` header. Secrets are masked in this listing. Regenerate the secret to obtain a new full value.

```
GET /api/v1/webhooks
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Conditional | Company UUID. Optional when the organization has a single company. The `?company=` query parameter is also accepted |

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

const { data: webhooks } = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns `data`, an array of webhook endpoint objects.

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "url": "https://your-app.example.com/webhooks/storno",
      "description": "Production invoice notifications",
      "events": [
        "invoice.created",
        "invoice.validated",
        "invoice.rejected",
        "payment.received"
      ],
      "secret": "***15d6c15b",
      "isActive": true,
      "createdAt": "2026-02-10T09:00:00+00:00",
      "updatedAt": "2026-02-15T14:30:00+00:00"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "url": "https://your-app.example.com/webhooks/sync",
      "description": "ANAF sync monitoring",
      "events": [
        "sync.completed",
        "sync.error"
      ],
      "secret": "***0f00a008",
      "isActive": false,
      "createdAt": "2026-01-20T11:15:00+00:00",
      "updatedAt": "2026-01-20T11:15:00+00:00"
    }
  ]
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Webhook endpoint UUID |
| `url` | string | The HTTPS URL that receives webhook POST requests |
| `description` | string\|null | Optional label |
| `events` | array | Event names this endpoint is subscribed to |
| `secret` | string | Masked signing secret: `***` followed by its last 8 characters |
| `isActive` | boolean | Whether the endpoint receives deliveries |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 timestamp of the last update |

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `400` | No company selected |
| `403` | Insufficient permissions. Requires `webhook.view` |
