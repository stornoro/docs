---
title: Register
description: Create a new user account
method: POST
endpoint: /api/auth/register
---

# Register

Create a new user account with email and password. A default organization is automatically created with the user as the owner.

## Request

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User's email address (must be unique and valid) |
| `password` | string | Yes | Password (minimum 8 characters) |
| `firstName` | string | No | User's first name |
| `lastName` | string | No | User's last name |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe',
  }),
});

const { token, refresh_token } = await response.json();
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->post('https://api.storno.ro/api/auth/register', [
    'json' => [
        'email' => 'user@example.com',
        'password' => 'SecurePass123!',
        'firstName' => 'John',
        'lastName' => 'Doe',
    ],
]);

$data = json_decode($response->getBody(), true);
$token = $data['token'];
$refreshToken = $data['refresh_token'];
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (201 Created)

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
| `400` | Bad Request - Validation errors (invalid email, weak password, etc.) |
| `409` | Conflict - Email address already registered |
| `429` | Too Many Requests - Rate limit exceeded |

### Error Response Examples

**Validation Error (400)**

```json
{
  "code": 400,
  "message": "Validation failed",
  "errors": {
    "email": ["This value is not a valid email address."],
    "password": ["Password must be at least 8 characters long."]
  }
}
```

**Email Already Exists (409)**

```json
{
  "code": 409,
  "message": "An account with this email address already exists."
}
```

## Automatic Setup

When you register a new account, the system automatically:

1. **Creates a User** with the provided email and hashed password
2. **Creates a Default Organization** named after the user's email
3. **Assigns Owner Role** via an organization membership
4. **Issues JWT Tokens** for immediate authenticated access

## Password Requirements

Passwords must meet the following criteria:

- Minimum 8 characters
- At least one uppercase letter (recommended)
- At least one lowercase letter (recommended)
- At least one number (recommended)
- Special characters are allowed and encouraged

## Email Confirmation

Depending on configuration, the account may require email confirmation before full access is granted:

- A confirmation email is sent to the provided address
- The user may need to click the confirmation link before logging in
- Check the [Confirm Email](/api-reference/auth/confirm-email) documentation for details

## Usage Notes

- Email addresses are case-insensitive and stored in lowercase
- The user is immediately authenticated after successful registration
- Rate limiting applies: maximum 3 registration attempts per hour per IP address
- The default organization can be renamed later via the organization settings
- Users can create or join additional organizations after registration

## Next Steps

After successful registration:

1. Store the tokens securely
2. Fetch user profile via [GET /api/v1/me](/api-reference/auth/me)
3. Set up company information for invoicing
4. Configure ANAF e-Factura integration
