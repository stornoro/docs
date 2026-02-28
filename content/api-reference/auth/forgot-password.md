---
title: Forgot Password
description: Request a password reset email
method: POST
endpoint: /api/auth/forgot-password
---

# Forgot Password

Request a password reset email. If the email address exists in the system, a secure reset link will be sent.

## Request

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Email address associated with the account |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/auth/forgot-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
  }),
});

if (response.ok) {
  console.log('Password reset email sent (if account exists)');
}
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->post('https://api.storno.ro/api/auth/forgot-password', [
    'json' => [
        'email' => 'user@example.com',
    ],
]);

// Always returns 200, even if email doesn't exist
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (200 OK)

The endpoint always returns a success response, regardless of whether the email exists. This prevents user enumeration attacks.

```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

## Security Behavior

For security reasons, this endpoint:

1. **Always returns 200 OK** - Never reveals whether an email exists in the system
2. **Sends email only if account exists** - No email is sent for non-existent accounts
3. **Rate limits aggressively** - Prevents abuse and email bombing

## Password Reset Email

If the account exists, the user receives an email containing:

- A secure reset link valid for 1 hour
- Instructions on how to reset their password
- A warning that they didn't request this (if it wasn't them)
- Link to contact support if needed

**Example Email:**

```
Subject: Reset Your Storno.ro Password

Hi John,

You recently requested to reset your password for your Storno.ro account.
Click the link below to reset it:

https://storno.ro/reset-password?token=abc123xyz...

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.
Your password will not be changed.

Need help? Contact us at support@storno.ro

Thanks,
The Storno.ro Team
```

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Missing or invalid email address |
| `429` | Too Many Requests - Rate limit exceeded |

### Error Response Examples

**Invalid Email Format (400)**

```json
{
  "code": 400,
  "message": "Validation failed",
  "errors": {
    "email": ["This value is not a valid email address."]
  }
}
```

**Rate Limit Exceeded (429)**

```json
{
  "code": 429,
  "message": "Too many password reset requests. Please try again in 15 minutes."
}
```

## Rate Limiting

To prevent abuse, password reset requests are rate-limited:

- **Per Email**: Maximum 3 requests per hour per email address
- **Per IP**: Maximum 10 requests per hour per IP address
- **Cooldown**: 15 minutes between requests for the same email

## Usage Notes

### User Flow

1. User clicks "Forgot Password" on login page
2. User enters their email address
3. User submits the form
4. System shows generic success message
5. User checks email for reset link
6. User clicks link and is redirected to password reset page
7. User enters new password and confirms
8. User is redirected to login page with success message

### Implementation Example

```js
// Forgot password form handler
async function handleForgotPassword(email) {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      showMessage(
        'If an account with that email exists, we\'ve sent password reset instructions.',
        'success'
      );
    }
  } catch (error) {
    showMessage('An error occurred. Please try again later.', 'error');
  }
}
```

### Best Practices

1. **Generic messaging** - Never reveal if an email exists or not
2. **Clear instructions** - Tell users to check their email (including spam folder)
3. **Expiry notice** - Inform users the link expires in 1 hour
4. **Alternative options** - Provide support contact for users who can't access email
5. **Resend option** - Allow users to request another reset email after cooldown

### Security Considerations

- Reset tokens are single-use and expire after 1 hour
- Tokens are cryptographically secure random strings
- Using a reset token invalidates any previous tokens
- Successfully resetting password invalidates all existing sessions
- All password reset attempts are logged for security auditing

## Related Endpoints

- [Reset Password](/api-reference/auth/reset-password) - Complete the password reset with token
- [Login](/api-reference/auth/login) - Authenticate after resetting password
- [Register](/api-reference/auth/register) - Create a new account if you don't have one

## Troubleshooting

**User didn't receive email:**
1. Check spam/junk folder
2. Verify email address is correct
3. Wait a few minutes (email delivery can be delayed)
4. Try requesting another reset after cooldown period
5. Contact support if issue persists

**Reset link expired:**
1. Request a new password reset
2. Complete the process within 1 hour

**Multiple reset requests:**
- Only the most recent token is valid
- Previous tokens are automatically invalidated
