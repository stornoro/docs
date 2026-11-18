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
| `password` | string | Yes | Password |
| `firstName` | string | No | User's first name |
| `lastName` | string | No | User's last name |
| `organizationName` | string | No | Name of the default organization. Defaults to the user's full name followed by `'s Organization` |
| `locale` | string | No | `ro` or `en`. Defaults from the `Accept-Language` header |
| `turnstileToken` | string | Yes | Cloudflare Turnstile token. Without a valid token the response is 403 |

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

const { message, email } = await response.json();
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
$message = $data['message'];
$email = $data['email'];
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (201 Created)

```json
{
  "message": "Registration successful. Please check your email to confirm your account.",
  "email": "user@example.com"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Confirmation text |
| `email` | string | The registered email address, lowercased |

The response carries no tokens. The user must confirm the email address, then [log in](/api-reference/auth/login).

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - email or password missing, invalid email address, or a name that is too long, contains a link or contains line breaks |
| `403` | Forbidden - captcha verification failed, registration is disabled, or the instance supports a single organization only |
| `409` | Conflict - Email address already registered |
| `429` | Too Many Requests - Rate limit exceeded |

Error bodies use the form `{"error": "..."}`.

**Email Already Exists (409)**

```json
{
  "error": "An account with this email already exists."
}
```

## Automatic Setup

When you register a new account, the system automatically:

1. **Creates a User** with the provided email and hashed password
2. **Creates a Default Organization** named after the user, or with `organizationName` when sent
3. **Assigns Owner Role** via an organization membership
4. **Starts a 14-day trial** on the new organization
5. **Sends a confirmation email**

## Email Confirmation

The account must be confirmed before the first login:

- A confirmation email is sent to the provided address
- The user must click the confirmation link before logging in
- Check the [Confirm Email](/api-reference/auth/confirm-email) documentation for details

## Usage Notes

- Email addresses are case-insensitive and stored in lowercase
- Rate limiting applies: maximum 10 registration attempts per hour per IP address
- The default organization can be renamed later via the organization settings
- Users can create or join additional organizations after registration

## Next Steps

After successful registration:

1. Confirm the email address with [Confirm Email](/api-reference/auth/confirm-email)
2. Log in with [Login](/api-reference/auth/login), then fetch the profile via [GET /api/v1/me](/api-reference/auth/me)
3. Set up company information for invoicing
4. Configure ANAF e-Factura integration
