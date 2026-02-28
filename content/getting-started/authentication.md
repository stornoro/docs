---
title: Authentication
description: Learn how to authenticate with the Storno.ro API using JWT tokens, refresh tokens, Google OAuth, and passkeys.
---

# Authentication

The Storno.ro API uses JWT (JSON Web Tokens) for authentication. You can obtain tokens via email/password login, Google OAuth, or passkey (WebAuthn) authentication.

## Obtaining a Token

### Email & Password

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'your_password'
  })
});
const { token, refresh_token } = await response.json();
```
{% /tab %}
{% /tabs %}

**Response:**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "def50200a..."
}
```

### Google OAuth

Exchange a Google ID token for API credentials:

```bash
curl -X POST https://api.storno.ro/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "google_id_token_here"
  }'
```

**Response:**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "def50200a...",
  "isNewUser": false
}
```

If the user doesn't exist, an account is automatically created and `isNewUser` will be `true`.

### Passkey (WebAuthn)

Passkey authentication is a two-step process:

**Step 1: Request login options**

```bash
curl -X POST https://api.storno.ro/api/auth/passkey/login/options \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

Returns a WebAuthn challenge that must be signed by the user's authenticator.

**Step 2: Submit signed response**

```bash
curl -X POST https://api.storno.ro/api/auth/passkey/login \
  -H "Content-Type: application/json" \
  -d '{
    "response": { ... }
  }'
```

**Response:**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "def50200a..."
}
```

## Multi-Factor Authentication (MFA)

When a user has two-factor authentication enabled, login via email/password or Google OAuth returns an MFA challenge instead of tokens:

```json
{
  "mfa_required": true,
  "mfa_token": "a1b2c3d4e5f6...",
  "mfa_methods": ["totp", "backup_code"]
}
```

You must then complete the challenge by submitting a TOTP code or backup code:

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
{% /tabs %}

**Response:**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "def50200a..."
}
```

{% callout type="note" %}
**Passkey logins skip MFA entirely.** Passkeys inherently satisfy multi-factor authentication (possession of the device + biometric or PIN), so no additional challenge is required.
{% /callout %}

See the [MFA API reference](/api-reference/auth/mfa-verify) for details on challenge verification, and [MFA Status](/api-reference/auth/mfa-status) for managing MFA settings.

## Using the Token

Include the JWT token in the `Authorization` header of every request:

```bash
curl https://api.storno.ro/api/v1/me \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
```

## Refreshing Tokens

JWT tokens expire after a configured period. Use the refresh token to obtain a new JWT without re-authenticating:

```bash
curl -X POST https://api.storno.ro/api/auth/token/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "def50200a..."
  }'
```

**Response:**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "def50200b..."
}
```

{% callout type="warning" %}
Both the access token and refresh token are rotated on each refresh. Store the new refresh token for subsequent refreshes.
{% /callout %}

## Company Context

Most API endpoints operate within a company context. You must include the `X-Company` header with the company UUID:

```bash
curl https://api.storno.ro/api/v1/invoices \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```

To get the list of companies you have access to:

```bash
curl https://api.storno.ro/api/v1/companies \
  -H "Authorization: Bearer {token}"
```

## Registering a Passkey

Authenticated users can register passkeys for passwordless login:

**Step 1: Get registration options**

```bash
curl -X POST https://api.storno.ro/api/v1/passkey/register/options \
  -H "Authorization: Bearer {token}"
```

**Step 2: Submit registration response**

```bash
curl -X POST https://api.storno.ro/api/v1/passkey/register \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My MacBook",
    "response": { ... }
  }'
```

## Managing Passkeys

```bash
# List passkeys
curl https://api.storno.ro/api/v1/me/passkeys \
  -H "Authorization: Bearer {token}"

# Delete a passkey
curl -X DELETE https://api.storno.ro/api/v1/me/passkeys/{id} \
  -H "Authorization: Bearer {token}"
```

## Token Lifetime

| Token | Lifetime |
|-------|----------|
| Access token (JWT) | Configured per deployment (typically 1 hour) |
| Refresh token | Configured per deployment (typically 30 days) |

## Error Responses

| Status | Description |
|--------|-------------|
| 401 | Invalid credentials or expired token |
| 403 | Account is inactive or email not confirmed |
| 429 | Too many login attempts (rate limited) |
