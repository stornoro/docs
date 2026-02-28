---
title: MFA Status
description: Get multi-factor authentication status for the current user
method: GET
endpoint: /api/v1/me/mfa/status
---

# MFA Status

Retrieve the current MFA configuration for the authenticated user, including whether TOTP is enabled, remaining backup codes, and registered passkeys count.

## Request

No request body required.

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl https://api.storno.ro/api/v1/me/mfa/status \
  -H "Authorization: Bearer {token}"
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/v1/me/mfa/status', {
  headers: { 'Authorization': `Bearer ${token}` },
});

const status = await response.json();
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (200 OK)

```json
{
  "totpEnabled": true,
  "backupCodesRemaining": 8,
  "passkeysCount": 2
}
```

| Field | Type | Description |
|-------|------|-------------|
| `totpEnabled` | boolean | Whether TOTP-based 2FA is enabled |
| `backupCodesRemaining` | integer | Number of unused backup codes remaining |
| `passkeysCount` | integer | Number of registered WebAuthn passkeys |

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Unauthorized — missing or invalid JWT token |
