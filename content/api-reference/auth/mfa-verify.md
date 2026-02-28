---
title: Verify MFA Challenge
description: Complete a multi-factor authentication challenge with a TOTP code or backup code
method: POST
endpoint: /api/auth/mfa/verify
---

# Verify MFA Challenge

Complete a pending MFA challenge by submitting a TOTP code from an authenticator app or a single-use backup code. Returns JWT tokens on success.

## Request

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mfaToken` | string | Yes | The 64-character challenge token received from the login response |
| `code` | string | Yes | 6-digit TOTP code or 8-character backup code (format: `xxxx-xxxx`) |
| `type` | string | No | `totp` (default) or `backup` |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/auth/mfa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "mfaToken": "a1b2c3d4e5f6...",
    "code": "123456",
    "type": "totp"
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/auth/mfa/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mfaToken: 'a1b2c3d4e5f6...',
    code: '123456',
    type: 'totp',
  }),
});

const { token, refresh_token } = await response.json();
```
{% /tab %}
{% tab label="PHP" %}
```php
$response = $client->post('https://api.storno.ro/api/auth/mfa/verify', [
    'json' => [
        'mfaToken' => 'a1b2c3d4e5f6...',
        'code' => '123456',
        'type' => 'totp',
    ],
]);

$data = json_decode($response->getBody(), true);
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (200 OK)

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "def50200a1b2c3d4e5f6..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | JWT access token |
| `refresh_token` | string | Refresh token for obtaining new access tokens |

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Missing `mfaToken` or `code` |
| `401` | Invalid or expired challenge token, or invalid code |
| `429` | Too many failed attempts (max 5 per challenge) |

### Error Response Examples

**Invalid Code (401)**

```json
{
  "error": "Invalid code."
}
```

**Expired Challenge (401)**

```json
{
  "error": "Invalid or expired MFA challenge."
}
```

**Rate Limited (429)**

```json
{
  "error": "Too many failed attempts. Please log in again."
}
```

## Usage Notes

- Challenge tokens expire after **5 minutes**
- Each challenge allows a maximum of **5 attempts** before being invalidated
- Challenge tokens are single-use — they are deleted after successful verification
- Backup codes are also single-use and cannot be reused
- Backup codes accept input with or without dashes and are case-insensitive
