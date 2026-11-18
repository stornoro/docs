---
title: Get webhook
description: Retrieve details of a single webhook endpoint
method: GET
endpoint: /api/v1/webhooks/{uuid}
---

# Get webhook

Returns the full configuration of a single webhook endpoint belonging to the current company. The `secret` field is always masked in this response. Use the [regenerate-secret endpoint](/api-reference/webhooks/regenerate-secret) if you need to obtain a new signing secret.

```
GET /api/v1/webhooks/{uuid}
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

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl https://api.storno.ro/api/v1/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const response = await fetch(`https://api.storno.ro/api/v1/webhooks/${uuid}`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const { data: webhook } = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the webhook endpoint under `data`, with a masked secret.

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
    "secret": "***15d6c15b",
    "isActive": true,
    "createdAt": "2026-02-10T09:00:00+00:00",
    "updatedAt": "2026-02-15T14:30:00+00:00"
  }
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Webhook endpoint UUID |
| `url` | string | The HTTPS destination URL |
| `description` | string\|null | Optional label |
| `events` | array | Subscribed event names |
| `secret` | string | Masked signing secret: `***` followed by its last 8 characters |
| `isActive` | boolean | Whether the endpoint receives deliveries |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 last-updated timestamp |

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `400` | No company selected |
| `403` | Insufficient permissions. Requires `webhook.view` |
| `404` | Webhook endpoint not found for this company |
