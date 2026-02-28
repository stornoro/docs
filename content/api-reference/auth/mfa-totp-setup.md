---
title: Setup TOTP
description: Generate a TOTP secret and QR code for authenticator app setup
method: POST
endpoint: /api/v1/me/mfa/totp/setup
---

# Setup TOTP

Generate a new TOTP secret for the authenticated user. Returns the secret, a QR code image (data URI), and the `otpauth://` URI for manual entry in authenticator apps.

This does **not** enable MFA yet — the user must verify the first code via [Enable TOTP](/api-reference/auth/mfa-totp-enable) to activate it.

## Request

No request body required.

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/me/mfa/totp/setup \
  -H "Authorization: Bearer {token}"
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/v1/me/mfa/totp/setup', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
});

const { secret, qrCode, otpauthUri } = await response.json();
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (200 OK)

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "otpauthUri": "otpauth://totp/Storno:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Storno"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `secret` | string | Base32-encoded TOTP secret for manual entry |
| `qrCode` | string | PNG image as a data URI (300x300px) — render as an `<img>` tag |
| `otpauthUri` | string | `otpauth://` URI for deep-linking to authenticator apps |

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Unauthorized — missing or invalid JWT token |
| `409` | Conflict — TOTP is already enabled for this user |

## Usage Notes

- If an unverified secret already exists, calling this endpoint again overwrites it
- The secret is not active until verified via [Enable TOTP](/api-reference/auth/mfa-totp-enable)
- Display the QR code for the user to scan with Google Authenticator, Authy, or any TOTP-compatible app
- Also display the `secret` string for users who prefer manual entry
