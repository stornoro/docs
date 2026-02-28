---
title: Regenerate webhook secret
description: Issue a new signing secret for a webhook endpoint, immediately invalidating the previous one
method: POST
endpoint: /api/v1/webhooks/{uuid}/regenerate-secret
---

# Regenerate webhook secret

Issues a new HMAC-SHA256 signing secret for the specified webhook endpoint. The previous secret is immediately invalidated — any deliveries that arrive after this call will be signed with the new secret. Update your endpoint's verification logic before calling this in production.

```
POST /api/v1/webhooks/{uuid}/regenerate-secret
```

{% callout type="warning" %}
The new secret is returned in full only in this response. Store it securely immediately. All subsequent GET requests will return the masked value. If the endpoint is active, deliveries sent after this call will carry a signature computed with the new secret — update your verification logic first.
{% /callout %}

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

Returns the full webhook object with the new unmasked signing secret.

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
  "secret": "whsec_c2b04e8f3d5a6e1f9b0c4d7a2e8f5b1c3d6a9e2f5b8c1d4a7e0f3b6c9d2a5e8f",
  "createdAt": "2026-02-10T09:00:00Z",
  "updatedAt": "2026-02-18T10:30:00Z"
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Webhook endpoint UUID |
| `url` | string | Destination URL (unchanged) |
| `description` | string | Description label (unchanged) |
| `events` | array | Subscribed event types (unchanged) |
| `isActive` | boolean | Active state (unchanged) |
| `secret` | string | The new full HMAC-SHA256 signing secret — save this value immediately |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 timestamp of this regeneration |

### Rotation procedure

To safely rotate a signing secret without dropping deliveries:

1. Call this endpoint to obtain the new secret.
2. Update your server to accept signatures from **both** the old and new secrets temporarily.
3. Verify that recent deliveries are arriving with the new signature.
4. Remove the old secret from your server's verification logic.

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions — requires `webhook.manage` permission |
| `404` | Webhook endpoint not found for this company |

## Related endpoints

- [Get webhook](/api-reference/webhooks/get-webhook) — View current webhook configuration
- [Test webhook](/api-reference/webhooks/test-webhook) — Verify your endpoint handles the new secret correctly
