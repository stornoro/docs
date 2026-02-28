---
title: Email Confirmation
description: Confirm user email address and resend confirmation emails
---

# Email Confirmation

Verify user email addresses through confirmation tokens sent via email. Email confirmation may be required before accessing certain features or logging in.

---

## Confirm Email

Verify a user's email address using a confirmation token sent during registration.

**Endpoint**: `POST /api/auth/confirm-email`

**Authentication**: Not required (public endpoint)

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | Email confirmation token from verification email |

### Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/auth/confirm-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123xyz789def456ghi..."
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
// Extract token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const response = await fetch('https://api.storno.ro/api/auth/confirm-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: token,
  }),
});

if (response.ok) {
  window.location.href = '/login?confirmed=true';
}
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->post('https://api.storno.ro/api/auth/confirm-email', [
    'json' => [
        'token' => $_GET['token'],
    ],
]);

if ($response->getStatusCode() === 200) {
    header('Location: /login?confirmed=true');
    exit;
}
```
{% /tab %}
{% /tabs %}

### Response

#### Success Response (200 OK)

```json
{
  "message": "Email confirmed successfully. You can now log in to your account."
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Missing or invalid token format |
| `401` | Unauthorized - Token is invalid, expired, or already used |
| `409` | Conflict - Email is already confirmed |

### Error Response Examples

**Invalid or Expired Token (401)**

```json
{
  "code": 401,
  "message": "Email confirmation token is invalid or has expired."
}
```

**Email Already Confirmed (409)**

```json
{
  "code": 409,
  "message": "This email address has already been confirmed."
}
```

**Token Already Used (401)**

```json
{
  "code": 401,
  "message": "This confirmation token has already been used."
}
```

---

## Resend Confirmation Email

Request a new confirmation email if the original was not received or has expired.

**Endpoint**: `POST /api/auth/resend-confirmation`

**Authentication**: Not required (public endpoint)

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Email address of the account |

### Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/auth/resend-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/auth/resend-confirmation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
  }),
});

if (response.ok) {
  console.log('Confirmation email sent (if account exists and is unconfirmed)');
}
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->post('https://api.storno.ro/api/auth/resend-confirmation', [
    'json' => [
        'email' => 'user@example.com',
    ],
]);
```
{% /tab %}
{% /tabs %}

### Response

#### Success Response (200 OK)

For security reasons, the endpoint always returns success regardless of whether the email exists or is already confirmed.

```json
{
  "message": "If an unconfirmed account with that email exists, a new confirmation email has been sent."
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid email format |
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
  "message": "Too many confirmation email requests. Please try again in 5 minutes."
}
```

---

## Confirmation Email

When a user registers or requests a resend, they receive an email containing:

- A welcome message
- A confirmation link with embedded token
- Instructions on what to do if they didn't register
- Link expiration time (24 hours)

**Example Confirmation Email:**

```
Subject: Confirm Your Storno.ro Email Address

Hi John,

Welcome to Storno.ro! Please confirm your email address by clicking the link below:

https://storno.ro/confirm-email?token=abc123xyz789def456ghi...

This link will expire in 24 hours.

If you didn't create an account with Storno.ro, you can safely ignore this email.

Thanks,
The Storno.ro Team
```

---

## Token Expiration

Confirmation tokens have specific lifecycle:

- **Validity**: 24 hours from issuance
- **Single-use**: Token is invalidated after successful confirmation
- **Renewable**: User can request new token via resend endpoint
- **Automatic cleanup**: Expired tokens are periodically removed

---

## Rate Limiting

To prevent abuse, confirmation email requests are rate-limited:

- **Per Email**: Maximum 3 requests per hour per email address
- **Per IP**: Maximum 10 requests per hour per IP address
- **Cooldown**: 5 minutes between requests for the same email

---

## Complete User Flow

### Registration with Email Confirmation

1. **User Registers**
   ```js
   await fetch('/api/auth/register', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'user@example.com',
       password: 'SecurePass123!',
       firstName: 'John',
       lastName: 'Doe',
     }),
   });
   ```

2. **System Sends Confirmation Email**
   - User receives email with confirmation link
   - Link contains unique token

3. **User Clicks Confirmation Link**
   - Browser opens: `https://storno.ro/confirm-email?token=abc123xyz...`
   - Frontend extracts token and calls API

4. **Frontend Confirms Email**
   ```js
   const token = new URLSearchParams(window.location.search).get('token');

   await fetch('/api/auth/confirm-email', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ token }),
   });
   ```

5. **User Can Now Login**
   - Redirect to login page with success message
   - User authenticates with confirmed account

---

## Implementation Examples

### Email Confirmation Page

```html
<!-- confirm-email.html -->
<div id="confirmationStatus">
  <p>Confirming your email address...</p>
</div>

<script>
  async function confirmEmail() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      showError('Invalid confirmation link. Please check your email or request a new confirmation.');
      return;
    }

    try {
      const response = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        showSuccess('Email confirmed successfully! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login?confirmed=true';
        }, 2000);
      } else {
        const error = await response.json();

        if (response.status === 409) {
          showInfo('Your email is already confirmed. You can log in now.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          showError(error.message || 'Confirmation failed. Please try again.');
        }
      }
    } catch (error) {
      showError('An error occurred. Please try again later.');
    }
  }

  function showSuccess(message) {
    document.getElementById('confirmationStatus').innerHTML = `
      <div class="success">
        <svg>...</svg>
        <p>${message}</p>
      </div>
    `;
  }

  function showError(message) {
    document.getElementById('confirmationStatus').innerHTML = `
      <div class="error">
        <svg>...</svg>
        <p>${message}</p>
        <a href="/resend-confirmation">Resend confirmation email</a>
      </div>
    `;
  }

  function showInfo(message) {
    document.getElementById('confirmationStatus').innerHTML = `
      <div class="info">
        <svg>...</svg>
        <p>${message}</p>
      </div>
    `;
  }

  // Automatically confirm on page load
  confirmEmail();
</script>
```

### Resend Confirmation Form

```html
<!-- resend-confirmation.html -->
<form id="resendForm">
  <h2>Resend Confirmation Email</h2>
  <p>Didn't receive the confirmation email? Enter your email address below.</p>

  <div class="form-group">
    <label for="email">Email Address</label>
    <input
      type="email"
      id="email"
      name="email"
      required
      placeholder="user@example.com"
    />
  </div>

  <button type="submit">Resend Confirmation Email</button>
</form>

<script>
  document.getElementById('resendForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('If an unconfirmed account exists, we\'ve sent a new confirmation email. Please check your inbox.');
      } else if (response.status === 429) {
        alert('Too many requests. Please wait a few minutes before trying again.');
      } else {
        alert('An error occurred. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again later.');
    }
  });
</script>
```

---

## Configuration Options

Email confirmation requirements can vary based on system configuration:

### Optional Confirmation
- Users can login immediately after registration
- Email confirmation unlocks additional features
- Unconfirmed users may have limited access

### Required Confirmation
- Users must confirm email before first login
- Login attempts fail with "Email not confirmed" error
- Stronger security for sensitive applications

---

## Troubleshooting

### User Didn't Receive Confirmation Email

1. **Check spam/junk folder**
2. **Verify email address is correct**
3. **Wait a few minutes** (email delivery can be delayed)
4. **Use resend confirmation** endpoint
5. **Contact support** if issue persists

### Confirmation Link Expired

1. **Request new confirmation** via resend endpoint
2. **Complete confirmation within 24 hours**

### Token Invalid or Already Used

1. **Email already confirmed** - User can login directly
2. **Token malformed** - Request new confirmation email
3. **Wrong account** - Use correct email address

---

## Security Considerations

- Tokens are cryptographically secure random strings
- Tokens are hashed before database storage
- Rate limiting prevents enumeration attacks
- Generic success messages prevent email discovery
- All confirmation attempts are logged for audit
- Expired tokens are automatically cleaned up
- One-time use prevents replay attacks

---

## Related Endpoints

- [Register](/api-reference/auth/register) - Create account (triggers confirmation email)
- [Login](/api-reference/auth/login) - Authenticate after confirmation
- [User Profile](/api-reference/auth/me) - Check email confirmation status

---

## Best Practices

1. **Clear Communication**
   - Inform users to check email during registration
   - Provide resend option prominently
   - Explain what email confirmation unlocks

2. **User Experience**
   - Auto-confirm when user clicks link
   - Show loading state during confirmation
   - Redirect to login after success
   - Handle already-confirmed state gracefully

3. **Error Handling**
   - Display helpful error messages
   - Offer resend option on error
   - Log errors for monitoring

4. **Email Deliverability**
   - Use verified sender domain
   - Include text-only version
   - Clear subject line
   - Avoid spam triggers in content
