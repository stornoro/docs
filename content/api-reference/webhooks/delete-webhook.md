---
title: Delete webhook
description: Permanently delete a webhook endpoint and all its delivery history
method: DELETE
endpoint: /api/v1/webhooks/{uuid}
---

# Delete webhook

Permanently deletes a webhook endpoint and all associated delivery records. This is a hard delete — there is no soft-delete or recovery mechanism.

```
DELETE /api/v1/webhooks/{uuid}
```

{% callout type="warning" %}
This action is permanent and cannot be undone. All delivery history for this endpoint will also be deleted. If you only want to stop receiving deliveries temporarily, set `isActive` to `false` via the [update endpoint](/api-reference/webhooks/update-webhook) instead.
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

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X DELETE https://api.storno.ro/api/v1/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const response = await fetch(`https://api.storno.ro/api/v1/webhooks/${uuid}`, {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

// Returns 204 No Content on success
if (response.status === 204) {
  console.log('Webhook deleted successfully');
}
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns `204 No Content` on successful deletion with an empty response body.

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions — requires `webhook.manage` permission |
| `404` | Webhook endpoint not found for this company |

## Related endpoints

- [List webhooks](/api-reference/webhooks/list-webhooks) — List all remaining webhook endpoints
- [Update webhook](/api-reference/webhooks/update-webhook) — Pause deliveries without deleting
