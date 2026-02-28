---
title: Enable TOTP
description: Verify a TOTP code to activate two-factor authentication
method: POST
endpoint: /api/v1/me/mfa/totp/enable
---

# Enable TOTP

Verify a TOTP code from the user's authenticator app to activate two-factor authentication. On success, generates 10 single-use backup codes that should be stored securely.

Must be called after [Setup TOTP](/api-reference/auth/mfa-totp-setup).

## Request

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | 6-digit TOTP code from authenticator app |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/me/mfa/totp/enable \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{ "code": "123456" }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/v1/me/mfa/totp/enable', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ code: '123456' }),
});

const { enabled, backupCodes } = await response.json();
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (200 OK)

```json
{
  "enabled": true,
  "backupCodes": [
    "a3km-v7np",
    "h2bx-q9wt",
    "f4jy-m6cr",
    "d8ns-w3gp",
    "k5ht-b2xv",
    "p7mf-j4qs",
    "r9cw-n6yd",
    "t2gv-k8hb",
    "v6xp-f3mt",
    "w4qn-s7jc"
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Always `true` on success |
| `backupCodes` | string[] | Array of 10 single-use backup codes (format: `xxxx-xxxx`) |

{% callout type="warning" %}
Backup codes are shown **only once**. Prompt the user to save them securely — they cannot be retrieved later. Each code can only be used once.
{% /callout %}

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Missing `code` parameter |
| `401` | Unauthorized — missing or invalid JWT token |
| `409` | Conflict — TOTP is already enabled |
| `422` | Invalid TOTP code |

## Usage Notes

- The TOTP code is validated with a window of ±1 time step (allows 30 seconds of clock drift)
- After enabling, all future email/password and Google OAuth logins will require a second factor
- Passkey logins are **not** affected — passkeys inherently satisfy multi-factor requirements
- Backup codes use only unambiguous characters (`abcdefghjkmnpqrstuvwxyz23456789`)
