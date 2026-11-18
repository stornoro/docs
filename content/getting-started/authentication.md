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

Exchange a Google ID token for API credentials. Send the token in the `credential` field:

```bash
curl -X POST https://api.storno.ro/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "credential": "google_id_token_here"
  }'
```

**Response:**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "def50200a..."
}
```

If the user doesn't exist, an account is created automatically. When the user has MFA enabled, the response is the MFA challenge described below instead of tokens.

### Passkey (WebAuthn)

Passkey authentication is a two-step process:

**Step 1: Request login options**

```bash
curl -X POST https://api.storno.ro/api/auth/passkey/login/options \
  -H "Content-Type: application/json"
```

The request has no body. The response is the WebAuthn request options (`challenge`, `rpId`, `timeout` and so on) plus a `sessionId`. The user's authenticator signs the challenge.

**Step 2: Submit signed response**

```bash
curl -X POST https://api.storno.ro/api/auth/passkey/login \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "a1b2c3d4e5f6...",
    "credential": { ... }
  }'
```

`sessionId` is the value from step 1 and `credential` is the assertion returned by the authenticator. The session expires after a short time.

**Response:**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "def50200a..."
}
```

## Multi-Factor Authentication (MFA)

When a user has two-factor authentication enabled, login via email/password, Google or Apple returns an MFA challenge instead of tokens:

```json
{
  "mfa_required": true,
  "mfa_token": "a1b2c3d4e5f6...",
  "mfa_methods": ["totp", "backup_code", "email_otp"]
}
```

`mfa_methods` lists the methods the user can use. `backup_code` appears only while unused backup codes remain, and `email_otp` is always offered. Complete the challenge with `POST /api/auth/mfa/verify`. The `type` field is `totp`, `backup`, `email_otp` or `passkey`:

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

## API Keys

For programmatic or long-lived access, you can use API keys instead of JWT tokens. API keys use scoped permissions and are ideal for CI/CD pipelines, scripts, and integrations.

Create an API key via the [Create API token](/api-reference/api-keys/create) endpoint or from the web application under **Settings > API Keys**.

{% callout type="warning" %}
API keys must be sent **without** the `Bearer` prefix. The `Bearer` prefix is reserved for JWT tokens.
{% /callout %}

```bash
curl https://api.storno.ro/api/v1/invoices \
  -H "Authorization: af_a1b2c3d4e5f6..." \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```

API keys use the `af_` prefix for easy identification. Each key carries a list of permission scopes (for example `invoice.view`), and a key can only hold permissions its owner has. A request succeeds only when the key's scopes and the user's role both grant access. See [API Keys](/api-reference/api-keys/create) for details on creating and managing keys.

## Refreshing Tokens

JWT tokens expire after a configured period. Use the refresh token to obtain a new JWT without re-authenticating:

```bash
curl -X POST https://api.storno.ro/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "def50200a..."
  }'
```

**Response:**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "def50200a..."
}
```

{% callout type="warning" %}
Keep using the refresh token you received at login until it expires. The refresh response returns a new access token and the same refresh token. Once the refresh token expires, log in again.
{% /callout %}

## Company Context

Most API endpoints operate within a company context. Send the `X-Company` header with the company UUID. An organization with a single company can omit it. If the company cannot be resolved, the endpoint answers `404` with `Company not found.`:

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
| Access token (JWT) | 1 hour |
| Refresh token | 30 days |

## Error Responses

| Status | Description |
|--------|-------------|
| 401 | Invalid credentials, expired token, invalid API key |
| 403 | Account is inactive (`account_inactive`) or email not confirmed (`email_not_confirmed`) |
| 401 | Also returned when login is rate limited (message `Too many requests.`), or when a browser login needs a captcha (`captcha_required`) |
