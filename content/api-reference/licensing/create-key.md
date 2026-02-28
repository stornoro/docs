---
title: Create License Key
description: Generate a new license key for self-hosted instances.
method: POST
endpoint: /api/v1/licensing/keys
---

# Create License Key

Generate a new license key for the current organization. The key can be used to configure a self-hosted Docker instance. Only the organization owner can create license keys.

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instanceName` | string | No | Human-readable name for the instance (e.g., "Production", "Staging") |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://app.storno.ro/api/v1/licensing/keys \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "Production Server"
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://app.storno.ro/api/v1/licensing/keys', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    instanceName: 'Production Server',
  }),
});

const data = await response.json();
// data.licenseKey — save this! It's shown only once at full length.
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->post('https://app.storno.ro/api/v1/licensing/keys', [
    'headers' => [
        'Authorization' => 'Bearer ' . $token,
    ],
    'json' => [
        'instanceName' => 'Production Server',
    ],
]);

$data = json_decode($response->getBody(), true);
// $data['licenseKey'] — save this!
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (201 Created)

```json
{
  "id": "019c8a12-4567-7abc-def0-123456789abc",
  "licenseKey": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  "instanceName": "Production Server",
  "active": true,
  "createdAt": "2026-02-20T10:30:00+00:00"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID of the license key |
| `licenseKey` | string | The 64-character license key. **Save this immediately** — it is only returned in full on creation. Subsequent list requests show a masked version. |
| `instanceName` | string | Instance label, if provided |
| `active` | boolean | Whether the key is active |
| `createdAt` | string | ISO 8601 creation timestamp |

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Unauthorized — Missing or invalid token |
| `403` | Forbidden — User is not the organization owner |
| `404` | Not Found — Organization not found |

## Usage Notes

- **Only the organization owner** can create license keys
- The full license key is returned **only at creation time**. Copy it immediately.
- There is no limit on the number of keys per organization, but each self-hosted instance should use its own key
- The key inherits the organization's current subscription plan
