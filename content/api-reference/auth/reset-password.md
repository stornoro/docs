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
  "message": "Password has been reset successfully."
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - `token` or `password` missing, password shorter than 8 characters, or the token is invalid, already used or expired |
| `429` | Too Many Requests - rate limit exceeded |

Error bodies use the form `{"error": "..."}`.

**Invalid or expired token (400)**

```json
{
  "error": "Invalid or expired reset token."
}
```

**Short password (400)**

```json
{
  "error": "Password must be at least 8 characters."
}
```

## Password Requirements

The only rule enforced is a minimum length of 8 characters.

## Security Behavior

When a password is successfully reset:

1. **Password updated** - The new password hash is stored
2. **Token deleted** - The reset token cannot be used again

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

- **Validity**: 2 hours from issuance
- **Single-use**: Token is invalidated after successful use

If a token expires:
1. User must request a new password reset
2. Previous token becomes permanently invalid
3. New token is generated and sent via email

## Troubleshooting

### Common Issues

**"Token is invalid or has expired"**
- Token has expired (older than 2 hours)
- Token has already been used
- Token was copied incorrectly from email
- **Solution**: Request a new password reset

**"Password doesn't meet requirements"**
- Password is shorter than 8 characters
- **Solution**: Use a password of at least 8 characters

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

- Tokens are random strings of 32 bytes, valid for 2 hours
- Rate limiting allows 3 reset attempts per 15 minutes per IP address
