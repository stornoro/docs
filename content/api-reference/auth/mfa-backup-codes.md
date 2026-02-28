---
title: Regenerate Backup Codes
description: Generate a new set of backup codes, invalidating all previous codes
method: POST
endpoint: /api/v1/me/mfa/backup-codes/regenerate
---

# Regenerate Backup Codes

Generate a fresh set of 10 backup codes, immediately invalidating all previous codes. Requires password confirmation and TOTP to be enabled.

## Request

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `password` | string | Yes | User's current account password |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/me/mfa/backup-codes/regenerate \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{ "password": "your-password" }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/v1/me/mfa/backup-codes/regenerate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ password: 'your-password' }),
});

const { backupCodes } = await response.json();
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (200 OK)

```json
{
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

{% callout type="warning" %}
All previous backup codes are immediately invalidated. Prompt the user to save the new codes securely.
{% /callout %}

## Error Codes

| Code | Description |
|------|-------------|
| `400` | MFA is not enabled |
| `401` | Unauthorized — missing or invalid JWT token |
| `422` | Invalid password |
