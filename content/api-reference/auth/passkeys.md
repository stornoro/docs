---
title: Passkeys (WebAuthn)
description: Passwordless authentication using WebAuthn passkeys
---

# Passkeys (WebAuthn)

Implement passwordless authentication using WebAuthn passkeys. Users can register biometric or security key-based credentials for secure, phishing-resistant authentication.

## Overview

Passkeys provide a modern, secure alternative to passwords using public-key cryptography. The system supports:

- **Biometric authentication** (fingerprint, Face ID, Touch ID)
- **Platform authenticators** (built into devices)
- **Security keys** (YubiKey, etc.)
- **Multiple passkeys** per user for different devices

---

## Registration Flow

### 1. Get Registration Options

Generate a WebAuthn challenge for registering a new passkey.

**Endpoint**: `POST /api/v1/passkey/register/options`

**Authentication**: Required (Bearer token)

#### Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/passkey/register/options \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/v1/passkey/register/options', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

const options = await response.json();
```
{% /tab %}
{% /tabs %}

#### Response (200 OK)

```json
{
  "rp": {
    "name": "Storno.ro",
    "id": "storno.ro"
  },
  "user": {
    "id": "dXNlci1pZC0xMjM=",
    "name": "user@example.com",
    "displayName": "John Doe"
  },
  "challenge": "cD_Q3UtKzJK8RpzGgqtbqA",
  "pubKeyCredParams": [
    { "type": "public-key", "alg": -7 },
    { "type": "public-key", "alg": -257 }
  ],
  "timeout": 60000,
  "attestation": "none",
  "authenticatorSelection": {
    "authenticatorAttachment": "platform",
    "requireResidentKey": true,
    "residentKey": "required",
    "userVerification": "required"
  }
}
```

### 2. Register Passkey

Complete passkey registration with the credential response from the browser.

**Endpoint**: `POST /api/v1/passkey/register`

**Authentication**: Required (Bearer token)

#### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Friendly name for the passkey (e.g., "iPhone 15", "YubiKey") |
| `response` | object | Yes | WebAuthn credential creation response from browser |

#### Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/passkey/register \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "response": {
      "id": "AaFdkcE...",
      "rawId": "AaFdkcE...",
      "response": {
        "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiY0RfUTNVdEt6Sko4UnB6R2dxdGJxQSIsIm9yaWdpbiI6Imh0dHBzOi8vYXV0b2ZhY3R1cmEucm8ifQ",
        "attestationObject": "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVikSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NFAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAGhXZHBAk..."
      },
      "type": "public-key"
    }
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
// Step 1: Get options
const optionsResponse = await fetch('/api/v1/passkey/register/options', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
const options = await optionsResponse.json();

// Step 2: Create credential with browser WebAuthn API
const credential = await navigator.credentials.create({
  publicKey: options,
});

// Step 3: Register the passkey
const registerResponse = await fetch('/api/v1/passkey/register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'iPhone 15 Pro',
    response: credential,
  }),
});

const result = await registerResponse.json();
```
{% /tab %}
{% /tabs %}

#### Response (201 Created)

```json
{
  "id": "01HQZX1234ABCDEF5678WXYZ",
  "name": "iPhone 15 Pro",
  "createdAt": "2026-02-16T10:30:00Z",
  "lastUsedAt": null
}
```

---

## Authentication Flow

### 1. Get Login Options

Generate a WebAuthn challenge for authentication.

**Endpoint**: `POST /api/auth/passkey/login/options`

**Authentication**: Not required (public endpoint)

#### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | No | User's email (optional, for filtering available passkeys) |

#### Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/auth/passkey/login/options \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/auth/passkey/login/options', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com', // Optional
  }),
});

const options = await response.json();
```
{% /tab %}
{% /tabs %}

#### Response (200 OK)

```json
{
  "challenge": "Z3vY8KpMqWr4TnxBftauDw",
  "timeout": 60000,
  "rpId": "storno.ro",
  "allowCredentials": [
    {
      "type": "public-key",
      "id": "AaFdkcE..."
    }
  ],
  "userVerification": "required"
}
```

### 2. Login with Passkey

Authenticate using a passkey credential.

**Endpoint**: `POST /api/auth/passkey/login`

**Authentication**: Not required (public endpoint)

#### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `response` | object | Yes | WebAuthn assertion response from browser |

#### Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/auth/passkey/login \
  -H "Content-Type: application/json" \
  -d '{
    "response": {
      "id": "AaFdkcE...",
      "rawId": "AaFdkcE...",
      "response": {
        "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiWjN2WThLcE1xV3I0VG54QmZ0YXVEdyIsIm9yaWdpbiI6Imh0dHBzOi8vYXV0b2ZhY3R1cmEucm8ifQ",
        "authenticatorData": "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MFAAAAAQ",
        "signature": "MEUCIQCvXW..."
      },
      "type": "public-key"
    }
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
// Step 1: Get options
const optionsResponse = await fetch('/api/auth/passkey/login/options', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' }),
});
const options = await optionsResponse.json();

// Step 2: Get credential with browser WebAuthn API
const assertion = await navigator.credentials.get({
  publicKey: options,
});

// Step 3: Login with passkey
const loginResponse = await fetch('/api/auth/passkey/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    response: assertion,
  }),
});

const { token, refresh_token } = await loginResponse.json();
```
{% /tab %}
{% /tabs %}

#### Response (200 OK)

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "def50200a1b2c3d4e5f6..."
}
```

---

## Passkey Management

### List User Passkeys

Get all passkeys registered for the current user.

**Endpoint**: `GET /api/v1/me/passkeys`

**Authentication**: Required (Bearer token)

#### Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl https://api.storno.ro/api/v1/me/passkeys \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/v1/me/passkeys', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const passkeys = await response.json();
```
{% /tab %}
{% /tabs %}

#### Response (200 OK)

```json
[
  {
    "id": "01HQZX1234ABCDEF5678WXYZ",
    "name": "iPhone 15 Pro",
    "createdAt": "2026-02-15T14:22:00Z",
    "lastUsedAt": "2026-02-16T09:15:00Z"
  },
  {
    "id": "01HQZY5678GHIJKL9012STUV",
    "name": "MacBook Pro",
    "createdAt": "2026-02-10T11:30:00Z",
    "lastUsedAt": "2026-02-16T08:00:00Z"
  },
  {
    "id": "01HR0Z9012MNOPQR3456UVWX",
    "name": "YubiKey 5",
    "createdAt": "2026-02-01T16:45:00Z",
    "lastUsedAt": "2026-02-14T10:30:00Z"
  }
]
```

### Delete Passkey

Remove a registered passkey.

**Endpoint**: `DELETE /api/v1/me/passkeys/{id}`

**Authentication**: Required (Bearer token)

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Passkey ID (path parameter) |

#### Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X DELETE https://api.storno.ro/api/v1/me/passkeys/01HQZX1234ABCDEF5678WXYZ \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch(
  `https://api.storno.ro/api/v1/me/passkeys/${passkeyId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);
```
{% /tab %}
{% /tabs %}

#### Response (204 No Content)

No response body.

---

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid request parameters or WebAuthn response |
| `401` | Unauthorized - Invalid or expired authentication token |
| `403` | Forbidden - User verification failed |
| `404` | Not Found - Passkey not found or doesn't belong to user |
| `409` | Conflict - Passkey already registered for this credential |
| `422` | Unprocessable Entity - WebAuthn verification failed |

### Error Response Examples

**Invalid WebAuthn Response (422)**

```json
{
  "code": 422,
  "message": "WebAuthn verification failed: Invalid signature."
}
```

**Passkey Already Registered (409)**

```json
{
  "code": 409,
  "message": "This passkey is already registered."
}
```

---

## Browser Compatibility

Passkeys are supported in modern browsers with WebAuthn API:

- **Chrome/Edge**: 67+
- **Firefox**: 60+
- **Safari**: 13+
- **Mobile browsers**: iOS 14+, Android Chrome 70+

Check availability:

```js
if (window.PublicKeyCredential) {
  // WebAuthn is supported
} else {
  // Fallback to password authentication
}
```

## Best Practices

1. **Always offer fallback authentication** (password or OAuth)
2. **Use descriptive names** for passkeys (device/location)
3. **Allow multiple passkeys** per user for redundancy
4. **Handle errors gracefully** with clear user messaging
5. **Test across devices** to ensure compatibility
6. **Update lastUsedAt** tracking for security monitoring

## Security Notes

- Passkeys use public-key cryptography, making them phishing-resistant
- Private keys never leave the user's device
- User verification (biometrics/PIN) is required by default
- Passkeys cannot be reused across different domains
- Server-side challenge validation prevents replay attacks
