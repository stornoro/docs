---
title: Login
description: Authenticate a user with email and password
method: POST
endpoint: /api/auth
---

# Login

Authenticate a user with their email and password to receive JWT access and refresh tokens.

## Request

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User's email address |
| `password` | string | Yes | User's password |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-secure-password"
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'your-secure-password',
  }),
});

const { token, refresh_token } = await response.json();
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->post('https://api.storno.ro/api/auth', [
    'json' => [
        'email' => 'user@example.com',
        'password' => 'your-secure-password',
    ],
]);

$data = json_decode($response->getBody(), true);
$token = $data['token'];
$refreshToken = $data['refresh_token'];
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
| `token` | string | JWT access token, valid for 1 hour |
| `refresh_token` | string | Refresh token used to obtain new access tokens |

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Missing or invalid parameters |
| `401` | Unauthorized - Invalid email or password |
| `403` | Forbidden - Account is inactive or email not confirmed |
| `429` | Too Many Requests - Rate limit exceeded |

### Error Response Examples

**Invalid Credentials (401)**

```json
{
  "code": 401,
  "message": "Invalid credentials."
}
```

**Email Not Confirmed (403)**

```json
{
  "code": 403,
  "message": "Please confirm your email address before logging in."
}
```

**Account Inactive (403)**

```json
{
  "code": 403,
  "message": "Your account has been deactivated. Please contact support."
}
```

### MFA Challenge Response (200 OK)

If the user has two-factor authentication enabled, the login endpoint returns an MFA challenge instead of tokens:

```json
{
  "mfa_required": true,
  "mfa_token": "a1b2c3d4e5f6789...",
  "mfa_methods": ["totp", "backup_code"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `mfa_required` | boolean | Always `true` when MFA is needed |
| `mfa_token` | string | 64-character challenge token (valid for 5 minutes) |
| `mfa_methods` | string[] | Available verification methods: `totp` and/or `backup_code` |

Complete the challenge by calling [Verify MFA Challenge](/api-reference/auth/mfa-verify) with the `mfa_token` and a valid code.

## Usage Notes

- Store the `token` securely (e.g., in memory or secure storage)
- Include the token in subsequent requests via the `Authorization: Bearer {token}` header
- Use the `refresh_token` to obtain a new access token when it expires
- Tokens are rotated on refresh for enhanced security
- Rate limiting applies: maximum 5 login attempts per minute per IP address
- When the user has MFA enabled, handle the `mfa_required` response by redirecting to MFA verification
