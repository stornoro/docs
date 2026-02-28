---
title: Reset Password
description: Reset password using a reset token
method: POST
endpoint: /api/auth/reset-password
---

# Reset Password

Reset a user's password using a valid reset token received via email. This completes the password recovery process started with [Forgot Password](/api-reference/auth/forgot-password).

## Request

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | Password reset token from email link |
| `password` | string | Yes | New password (minimum 8 characters) |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123xyz789def456ghi...",
    "password": "NewSecurePassword123!"
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
// Extract token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const response = await fetch('https://api.storno.ro/api/auth/reset-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: token,
    password: 'NewSecurePassword123!',
  }),
});

if (response.ok) {
  window.location.href = '/login?reset=success';
}
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->post('https://api.storno.ro/api/auth/reset-password', [
    'json' => [
        'token' => $_GET['token'],
        'password' => $_POST['password'],
    ],
]);

if ($response->getStatusCode() === 200) {
    header('Location: /login?reset=success');
    exit;
}
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (200 OK)

```json
{
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid token format or password validation failed |
| `401` | Unauthorized - Token is invalid, expired, or already used |
| `422` | Unprocessable Entity - Password doesn't meet security requirements |

### Error Response Examples

**Invalid or Expired Token (401)**

```json
{
  "code": 401,
  "message": "Password reset token is invalid or has expired."
}
```

**Token Already Used (401)**

```json
{
  "code": 401,
  "message": "This password reset token has already been used."
}
```

**Weak Password (422)**

```json
{
  "code": 422,
  "message": "Validation failed",
  "errors": {
    "password": [
      "Password must be at least 8 characters long.",
      "Password must contain at least one uppercase letter.",
      "Password must contain at least one number."
    ]
  }
}
```

## Password Requirements

New passwords must meet the following criteria:

- **Minimum length**: 8 characters
- **Recommended**: Include uppercase letters, lowercase letters, numbers, and special characters
- **Prohibited**: Cannot be a commonly used password (e.g., "password123", "12345678")
- **Security**: Should not contain personal information (name, email, etc.)

## Security Behavior

When a password is successfully reset:

1. **Password Updated** - New password hash is stored
2. **Token Invalidated** - Reset token is marked as used
3. **Previous Tokens Cleared** - All other reset tokens for this user are invalidated
4. **Sessions Revoked** - All existing user sessions are terminated
5. **Security Event Logged** - Password change is recorded for audit purposes
6. **Notification Sent** - User receives confirmation email (if email notifications are enabled)

## Complete User Flow

### 1. User Requests Reset

User visits forgot password page and enters their email.

```js
await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' }),
});
```

### 2. User Receives Email

System sends email with reset link:
```
https://storno.ro/reset-password?token=abc123xyz789def456ghi...
```

### 3. User Clicks Link

User is redirected to password reset form with token in URL.

### 4. User Submits New Password

```js
const response = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'abc123xyz789def456ghi...',
    password: 'NewSecurePassword123!',
  }),
});
```

### 5. User Logs In

User is redirected to login page and can access their account with the new password.

## Implementation Example

### Frontend Reset Password Form

```html
<!-- reset-password.html -->
<form id="resetPasswordForm">
  <h2>Reset Your Password</h2>

  <div class="form-group">
    <label for="password">New Password</label>
    <input
      type="password"
      id="password"
      name="password"
      required
      minlength="8"
      placeholder="Enter new password"
    />
  </div>

  <div class="form-group">
    <label for="confirmPassword">Confirm Password</label>
    <input
      type="password"
      id="confirmPassword"
      name="confirmPassword"
      required
      minlength="8"
      placeholder="Confirm new password"
    />
  </div>

  <button type="submit">Reset Password</button>
</form>

<script>
  document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Client-side validation
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      alert('Invalid reset link. Please request a new password reset.');
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        alert('Password reset successful! You can now log in.');
        window.location.href = '/login';
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to reset password');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  });
</script>
```

### Password Strength Indicator

```js
function checkPasswordStrength(password) {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  const levels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return {
    score: strength,
    level: levels[Math.min(strength - 1, levels.length - 1)],
    percentage: (strength / 6) * 100,
  };
}
```

## Token Expiration

Reset tokens have a limited lifetime:

- **Validity**: 1 hour from issuance
- **Single-use**: Token is invalidated after successful use
- **Automatic cleanup**: Expired tokens are periodically removed from database

If a token expires:
1. User must request a new password reset
2. Previous token becomes permanently invalid
3. New token is generated and sent via email

## Troubleshooting

### Common Issues

**"Token is invalid or has expired"**
- Token has expired (older than 1 hour)
- Token has already been used
- Token was copied incorrectly from email
- **Solution**: Request a new password reset

**"Password doesn't meet requirements"**
- Password is too short
- Password lacks complexity
- **Solution**: Use a stronger password with mixed characters

**"Unable to reset password"**
- Network connectivity issue
- Server temporarily unavailable
- **Solution**: Try again in a few minutes

### Best Practices

1. **Token handling**:
   - Extract token from URL query parameter
   - Validate token format before submission
   - Handle expired tokens gracefully

2. **Password validation**:
   - Show password requirements clearly
   - Provide real-time strength indicator
   - Require password confirmation

3. **User feedback**:
   - Show loading state during submission
   - Display clear error messages
   - Redirect to login after success

4. **Security**:
   - Never log or display tokens
   - Clear form on success
   - Don't reuse tokens

## Related Endpoints

- [Forgot Password](/api-reference/auth/forgot-password) - Request a password reset email
- [Login](/api-reference/auth/login) - Authenticate with new password
- [Update Profile](/api-reference/auth/me) - Change password while logged in

## Security Notes

- Tokens are cryptographically secure random strings (minimum 32 bytes)
- Tokens are hashed before storage in database
- Rate limiting prevents brute-force token guessing
- All password reset attempts are logged with IP address and timestamp
- Successful password reset triggers email notification to user
- Old sessions are invalidated to force re-authentication
