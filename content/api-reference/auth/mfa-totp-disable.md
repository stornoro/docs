---
title: Disable TOTP
description: Disable two-factor authentication for the current user
method: POST
endpoint: /api/v1/me/mfa/totp/disable
---

# Disable TOTP

Disable TOTP-based two-factor authentication. Requires password confirmation for security. Deletes the TOTP secret and all remaining backup codes.

## Request

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `password` | string | Yes | User's current account password |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/me/mfa/totp/disable \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{ "password": "your-password" }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/v1/me/mfa/totp/disable', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ password: 'your-password' }),
});
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (200 OK)

```json
{
  "disabled": true
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Unauthorized — missing or invalid JWT token |
| `422` | Invalid password |
