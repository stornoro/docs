---
title: Regenerate webhook secret
description: Issue a new signing secret for a webhook endpoint, immediately invalidating the previous one
method: POST
endpoint: /api/v1/webhooks/{uuid}/regenerate-secret
---

# Regenerate webhook secret

Issues a new signing secret for the specified webhook endpoint. The previous secret stops working immediately. Deliveries sent after this call are signed with the new secret. Regenerating needs the Professional or Business plan, otherwise the call returns `402` with `code: "PLAN_LIMIT"`.

```
POST /api/v1/webhooks/{uuid}/regenerate-secret
```

{% callout type="warning" %}
The new secret is returned in full only in this response. Store it securely immediately. Later reads return a masked value.
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

## Request

This endpoint requires no request body.

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890/regenerate-secret \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const response = await fetch(
  `https://api.storno.ro/api/v1/webhooks/${uuid}/regenerate-secret`,
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
      'X-Company': '550e8400-e29b-41d4-a716-446655440000'
    }
  }
);

const result = await response.json();

// Store the new secret securely — future responses will mask it
console.log('New signing secret:', result.secret);
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns `200` with the endpoint under `data` and the new secret both inside `data.secret` and at the top level as `secret`.

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
    "secret": "c2b04e8f3d5a6e1f9b0c4d7a2e8f5b1c3d6a9e2f5b8c1d4a7e0f3b6c9d2a5e8f",
    "isActive": true,
    "createdAt": "2026-02-10T09:00:00+00:00",
    "updatedAt": "2026-02-18T10:30:00+00:00"
  },
  "secret": "c2b04e8f3d5a6e1f9b0c4d7a2e8f5b1c3d6a9e2f5b8c1d4a7e0f3b6c9d2a5e8f"
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | object | The webhook endpoint with the new full secret in `data.secret` |
| `secret` | string | The new signing secret, 64 hexadecimal characters |

### Rotation procedure

To rotate a signing secret without rejecting deliveries:

The old secret stops working at once, so the switch is not gradual. Deliveries queued for retry are signed with the secret current at the time of each attempt.

1. Prepare your server to read the new secret from configuration.
2. Call this endpoint and deploy the new secret.
3. Use [Test webhook](/api-reference/webhooks/test-webhook) to confirm the signature check passes.

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `400` | No company selected |
| `402` | The plan does not include webhooks. Body has `code: "PLAN_LIMIT"` |
| `403` | Insufficient permissions. Requires `webhook.manage` |
| `404` | Webhook endpoint not found for this company |

## Related endpoints

- [Get webhook](/api-reference/webhooks/get-webhook) — View current webhook configuration
- [Test webhook](/api-reference/webhooks/test-webhook) — Verify your endpoint handles the new secret correctly
