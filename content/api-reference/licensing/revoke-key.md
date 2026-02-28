---
title: Revoke License Key
description: Deactivate a license key to revoke access for a self-hosted instance.
method: DELETE
endpoint: /api/v1/licensing/keys/{id}
---

# Revoke License Key

Deactivate a license key, revoking access for the associated self-hosted instance. The instance will fall back to the Community (free) plan on its next validation cycle. Only the organization owner can revoke keys.

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | UUID of the license key to revoke |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X DELETE https://app.storno.ro/api/v1/licensing/keys/019c8a12-4567-7abc-def0-123456789abc \
  -H "Authorization: Bearer {token}"
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch(
  `https://app.storno.ro/api/v1/licensing/keys/${keyId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

const data = await response.json();
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->delete(
    'https://app.storno.ro/api/v1/licensing/keys/' . $keyId,
    [
        'headers' => [
            'Authorization' => 'Bearer ' . $token,
        ],
    ]
);
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (200 OK)

```json
{
  "status": "revoked"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Unauthorized — Missing or invalid token |
| `403` | Forbidden — User is not the organization owner |
| `404` | Not Found — License key not found or belongs to a different organization |

## Usage Notes

- Revocation is **soft delete** — the key record is kept but marked as `active: false`
- Since JWT licenses are validated offline, a revoked key continues to work until it expires. Generate a new key with a shorter expiration if immediate revocation is needed.
- Revoked keys cannot be reactivated. Generate a new key instead.
