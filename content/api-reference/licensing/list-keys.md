---
title: List License Keys
description: List all license keys for the current organization.
method: GET
endpoint: /api/v1/licensing/keys
---

# List License Keys

Retrieve all license keys issued for the current organization. Keys are returned with masked values for security. Only the organization owner can list keys.

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl https://app.storno.ro/api/v1/licensing/keys \
  -H "Authorization: Bearer {token}"
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://app.storno.ro/api/v1/licensing/keys', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const { keys } = await response.json();
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->get('https://app.storno.ro/api/v1/licensing/keys', [
    'headers' => [
        'Authorization' => 'Bearer ' . $token,
    ],
]);

$data = json_decode($response->getBody(), true);
$keys = $data['keys'];
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (200 OK)

```json
{
  "keys": [
    {
      "id": "019c8a12-4567-7abc-def0-123456789abc",
      "licenseKey": "a1b2c3d4...e5f6a1b2",
      "instanceName": "Production Server",
      "instanceUrl": "https://factura.mycompany.ro",
      "active": true,
      "lastValidatedAt": "2026-02-20T08:00:00+00:00",
      "activatedAt": "2026-02-01T12:00:00+00:00",
      "createdAt": "2026-02-01T10:30:00+00:00"
    },
    {
      "id": "019c8b34-5678-7def-0123-456789abcdef",
      "licenseKey": "b2c3d4e5...f6a1b2c3",
      "instanceName": "Staging",
      "instanceUrl": null,
      "active": true,
      "lastValidatedAt": null,
      "activatedAt": null,
      "createdAt": "2026-02-15T14:00:00+00:00"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID of the license key |
| `licenseKey` | string | Masked key (first 8 + last 8 characters) |
| `instanceName` | string\|null | Human-readable instance label |
| `instanceUrl` | string\|null | URL reported by the self-hosted instance during validation |
| `active` | boolean | Whether the key is active |
| `lastValidatedAt` | string\|null | Last time this key was validated by a self-hosted instance |
| `activatedAt` | string\|null | When the key was first used |
| `createdAt` | string | ISO 8601 creation timestamp |

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Unauthorized — Missing or invalid token |
| `403` | Forbidden — User is not the organization owner |
| `404` | Not Found — Organization not found |

## Usage Notes

- License keys are **masked** in list responses — only the first and last 8 characters are shown
- Use `lastValidatedAt` to verify that a self-hosted instance is actively running
- Keys with `lastValidatedAt: null` have been created but never used
- Inactive keys (revoked) are still returned in the list with `active: false`
