---
title: Refresh Token
description: Refresh an expired JWT access token
method: POST
endpoint: /api/auth/token/refresh
---

# Refresh Token

Exchange a refresh token for a new JWT access token and refresh token pair. Both tokens are rotated for enhanced security.

## Request

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refresh_token` | string | Yes | Valid refresh token from previous login or refresh |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/auth/token/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "def50200a1b2c3d4e5f6..."
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/auth/token/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    refresh_token: 'def50200a1b2c3d4e5f6...',
  }),
});

const { token, refresh_token } = await response.json();
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->post('https://api.storno.ro/api/auth/token/refresh', [
    'json' => [
        'refresh_token' => 'def50200a1b2c3d4e5f6...',
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
  "refresh_token": "def50200b2c3d4e5f6a7..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | New JWT access token, valid for 1 hour |
| `refresh_token` | string | New refresh token (the old one is invalidated) |

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Missing refresh token parameter |
| `401` | Unauthorized - Invalid, expired, or revoked refresh token |
| `403` | Forbidden - User account is inactive or deleted |

### Error Response Examples

**Invalid Refresh Token (401)**

```json
{
  "code": 401,
  "message": "Invalid refresh token."
}
```

**Expired Refresh Token (401)**

```json
{
  "code": 401,
  "message": "Refresh token has expired. Please login again."
}
```

## Usage Notes

- **Token Rotation**: Both the access token and refresh token are replaced with new values on every refresh
- **Old Token Invalidation**: The previous refresh token becomes invalid immediately after use
- **Refresh Token Lifetime**: Refresh tokens are valid for 30 days from last use
- **Security**: Store refresh tokens securely; do not expose them in URLs or logs
- **Automatic Refresh**: Implement automatic token refresh before the access token expires to maintain uninterrupted sessions
- **Single Use**: Each refresh token can only be used once; attempting to reuse it will fail

## Best Practices

```js
// Example: Automatic token refresh
let accessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...';
let refreshToken = 'def50200a1b2c3d4e5f6...';

async function fetchWithAuth(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  // If token expired, refresh and retry
  if (response.status === 401) {
    const refreshResponse = await fetch('/api/auth/token/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (refreshResponse.ok) {
      const tokens = await refreshResponse.json();
      accessToken = tokens.token;
      refreshToken = tokens.refresh_token;

      // Retry original request
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }
  }

  return response;
}
```
