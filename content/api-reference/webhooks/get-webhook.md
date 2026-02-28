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
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Webhook endpoint UUID |

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

const webhook = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the webhook endpoint object with a masked secret.

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
  "secret": "whsec_••••••••••••••••••••••••",
  "deliveriesCount": 142,
  "lastDeliveryAt": "2026-02-18T09:45:00Z",
  "lastDeliveryStatus": "success",
  "createdAt": "2026-02-10T09:00:00Z",
  "updatedAt": "2026-02-15T14:30:00Z"
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier for the webhook endpoint |
| `url` | string | The HTTPS destination URL |
| `description` | string | Human-readable label |
| `events` | array | List of subscribed event type names |
| `isActive` | boolean | Whether the webhook is receiving deliveries |
| `secret` | string | Masked signing secret (format: `whsec_••••••••`) |
| `deliveriesCount` | integer | Total number of delivery attempts made for this webhook |
| `lastDeliveryAt` | string | ISO 8601 timestamp of the most recent delivery attempt |
| `lastDeliveryStatus` | string | Outcome of the last delivery: `success`, `failed`, or `pending` |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 last-updated timestamp |

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions — requires `webhook.view` permission |
| `404` | Webhook endpoint not found for this company |
