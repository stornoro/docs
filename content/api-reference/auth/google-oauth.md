---
title: Google OAuth Login
description: Authenticate or register using Google OAuth
method: POST
endpoint: /api/auth/google
---

# Google OAuth Login

Authenticate or register a user using Google OAuth. If the user doesn't exist, a new account is automatically created.

## Request

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idToken` | string | Yes | Google ID token from Google Sign-In |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5ZmUyYTdiNjc5NTIzOTYwNmNhMGE3NTA3N..."
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
// After Google Sign-In
const googleUser = await google.accounts.id.prompt();
const idToken = googleUser.credential;

const response = await fetch('https://api.storno.ro/api/auth/google', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    idToken: idToken,
  }),
});

const { token, refresh_token, isNewUser } = await response.json();
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->post('https://api.storno.ro/api/auth/google', [
    'json' => [
        'idToken' => $googleIdToken,
    ],
]);

$data = json_decode($response->getBody(), true);
$token = $data['token'];
$refreshToken = $data['refresh_token'];
$isNewUser = $data['isNewUser'];
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (200 OK)

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "def50200a1b2c3d4e5f6...",
  "isNewUser": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | JWT access token, valid for 1 hour |
| `refresh_token` | string | Refresh token used to obtain new access tokens |
| `isNewUser` | boolean | `true` if account was just created, `false` for existing user |

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Missing or invalid ID token |
| `401` | Unauthorized - Invalid Google ID token or token verification failed |
| `403` | Forbidden - Google account email not verified |
| `429` | Too Many Requests - Rate limit exceeded |

### Error Response Examples

**Invalid ID Token (401)**

```json
{
  "code": 401,
  "message": "Invalid Google ID token."
}
```

**Email Not Verified (403)**

```json
{
  "code": 403,
  "message": "Google account email must be verified."
}
```

## Automatic Account Creation

When a user signs in with Google for the first time:

1. **Email Verification**: The system verifies the Google ID token with Google's servers
2. **User Lookup**: Checks if a user with the Google email already exists
3. **Auto-Registration**: If not found, creates a new user account with:
   - Email from Google account
   - First and last name from Google profile
   - Email marked as confirmed (no confirmation email needed)
   - Default organization created with owner role
4. **Token Issuance**: Returns JWT tokens for immediate authenticated access

## Integration with Google Sign-In

### Frontend Setup (HTML/JavaScript)

```html
<!-- Load Google Sign-In library -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<script>
  function handleCredentialResponse(response) {
    // Send ID token to your backend
    fetch('https://api.storno.ro/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: response.credential }),
    })
      .then(res => res.json())
      .then(data => {
        // Store tokens
        localStorage.setItem('token', data.token);
        localStorage.setItem('refresh_token', data.refresh_token);

        // Handle new vs returning user
        if (data.isNewUser) {
          console.log('Welcome! Account created successfully.');
          // Redirect to onboarding
          window.location.href = '/onboarding';
        } else {
          console.log('Welcome back!');
          // Redirect to dashboard
          window.location.href = '/dashboard';
        }
      })
      .catch(error => {
        console.error('Authentication failed:', error);
      });
  }

  // Initialize Google Sign-In
  window.onload = function() {
    google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
      document.getElementById('googleSignInButton'),
      { theme: 'outline', size: 'large' }
    );
  };
</script>

<div id="googleSignInButton"></div>
```

### Mobile Setup (React Native)

```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
});

// Sign in function
async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.idToken;

    const response = await fetch('https://api.storno.ro/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    // Store tokens and navigate
  } catch (error) {
    console.error('Google Sign-In failed:', error);
  }
}
```

### MFA Challenge Response (200 OK)

If the user has two-factor authentication enabled, the endpoint returns an MFA challenge instead of tokens:

```json
{
  "mfa_required": true,
  "mfa_token": "a1b2c3d4e5f6789...",
  "mfa_methods": ["totp", "backup_code"]
}
```

Complete the challenge by calling [Verify MFA Challenge](/api-reference/auth/mfa-verify) with the `mfa_token` and a valid code.

## Usage Notes

- Google ID tokens are verified server-side for security
- When the user has MFA enabled, handle the `mfa_required` response by redirecting to MFA verification
- Token verification includes checking signature, expiration, and audience
- Users can link multiple authentication methods (password + Google) to the same email
- Google OAuth does not require a separate password
- Email confirmation is not required for Google OAuth users
- Rate limiting: maximum 10 OAuth attempts per minute per IP address

## Security Considerations

- Always validate ID tokens on the server side
- Never trust client-side token validation alone
- ID tokens expire quickly (typically 1 hour)
- Store Google ID tokens securely and never expose them in URLs
- Use HTTPS for all authentication requests
