---
title: User Profile
description: Get and update current user profile information
---

# User Profile

Manage the authenticated user's profile, including personal information, preferences, and account settings.

---

## Get Current User

Retrieve the authenticated user's profile with organization and membership details.

**Endpoint**: `GET /api/v1/me`

**Authentication**: Required (Bearer token)

### Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl https://api.storno.ro/api/v1/me \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/v1/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const user = await response.json();
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->get('https://api.storno.ro/api/v1/me', [
    'headers' => [
        'Authorization' => 'Bearer ' . $accessToken,
    ],
]);

$user = json_decode($response->getBody(), true);
```
{% /tab %}
{% /tabs %}

### Response (200 OK)

Returns flat JSON with user profile, organization, memberships, and subscription information.

```json
{
  "id": "01HQZX1234ABCDEF5678WXYZ",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+40721234567",
  "timezone": "Europe/Bucharest",
  "emailConfirmed": true,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-02-16T09:15:00Z",
  "preferences": {
    "language": "ro",
    "theme": "light",
    "notifications": {
      "email": true,
      "push": false
    }
  },
  "organization": {
    "id": "01HQZY5678GHIJKL9012STUV",
    "name": "My Company SRL",
    "slug": "my-company-srl",
    "createdAt": "2026-01-15T10:30:00Z"
  },
  "memberships": [
    {
      "id": "01HR0Z9012MNOPQR3456UVWX",
      "organizationId": "01HQZY5678GHIJKL9012STUV",
      "organizationName": "My Company SRL",
      "role": "owner",
      "joinedAt": "2026-01-15T10:30:00Z"
    }
  ],
  "subscription": {
    "plan": "pro",
    "status": "active",
    "expiresAt": "2027-01-15T10:30:00Z",
    "features": {
      "maxInvoices": 1000,
      "maxCompanies": 5,
      "apiAccess": true
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | User's unique identifier (ULID) |
| `email` | string | User's email address |
| `firstName` | string | User's first name |
| `lastName` | string | User's last name |
| `phone` | string | User's phone number |
| `timezone` | string | User's timezone (IANA format) |
| `emailConfirmed` | boolean | Whether email has been confirmed |
| `createdAt` | string | Account creation timestamp (ISO 8601) |
| `updatedAt` | string | Last profile update timestamp (ISO 8601) |
| `preferences` | object | User preferences and settings |
| `organization` | object | Current/default organization details |
| `memberships` | array | All organization memberships |
| `subscription` | object | Subscription plan and features |

---

## Update User Profile

Update the authenticated user's profile information.

**Endpoint**: `PATCH /api/v1/me`

**Authentication**: Required (Bearer token)

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `firstName` | string | No | User's first name |
| `lastName` | string | No | User's last name |
| `phone` | string | No | Phone number (E.164 format recommended) |
| `timezone` | string | No | Timezone (IANA format, e.g., "Europe/Bucharest") |
| `preferences` | object | No | User preferences object |
| `password` | string | No | New password (requires `currentPassword`) |
| `currentPassword` | string | No | Current password (required when changing password) |

### Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X PATCH https://api.storno.ro/api/v1/me \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+40721234567",
    "timezone": "Europe/Bucharest",
    "preferences": {
      "language": "ro",
      "theme": "dark",
      "notifications": {
        "email": true,
        "push": true
      }
    }
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/v1/me', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Smith',
    phone: '+40721234567',
    timezone: 'Europe/Bucharest',
    preferences: {
      language: 'ro',
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
      },
    },
  }),
});

const updatedUser = await response.json();
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->patch('https://api.storno.ro/api/v1/me', [
    'headers' => [
        'Authorization' => 'Bearer ' . $accessToken,
        'Content-Type' => 'application/json',
    ],
    'json' => [
        'firstName' => 'John',
        'lastName' => 'Smith',
        'phone' => '+40721234567',
        'timezone' => 'Europe/Bucharest',
        'preferences' => [
            'language' => 'ro',
            'theme' => 'dark',
            'notifications' => [
                'email' => true,
                'push' => true,
            ],
        ],
    ],
]);

$updatedUser = json_decode($response->getBody(), true);
```
{% /tab %}
{% /tabs %}

### Change Password Example

```js
const response = await fetch('https://api.storno.ro/api/v1/me', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    currentPassword: 'OldPassword123!',
    password: 'NewSecurePassword456!',
  }),
});
```

### Response (200 OK)

Returns the updated user profile in the same format as `GET /api/v1/me`.

```json
{
  "id": "01HQZX1234ABCDEF5678WXYZ",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+40721234567",
  "timezone": "Europe/Bucharest",
  "emailConfirmed": true,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-02-16T10:45:00Z",
  "preferences": {
    "language": "ro",
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": true
    }
  },
  "organization": { ... },
  "memberships": [ ... ],
  "subscription": { ... }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid parameters or validation failed |
| `401` | Unauthorized - Invalid or expired token |
| `403` | Forbidden - Incorrect current password |
| `422` | Unprocessable Entity - Invalid timezone or phone format |

### Error Response Examples

**Validation Error (400)**

```json
{
  "code": 400,
  "message": "Validation failed",
  "errors": {
    "phone": ["Phone number must be in E.164 format."],
    "timezone": ["Invalid timezone identifier."]
  }
}
```

**Incorrect Current Password (403)**

```json
{
  "code": 403,
  "message": "Current password is incorrect."
}
```

---

## Delete Account

Permanently delete the user's account. This action soft-deletes the account and anonymizes personally identifiable information (PII).

**Endpoint**: `DELETE /api/v1/me`

**Authentication**: Required (Bearer token)

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `password` | string | Yes | Current password for confirmation |

### Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X DELETE https://api.storno.ro/api/v1/me \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "password": "UserPassword123!"
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/v1/me', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    password: 'UserPassword123!',
  }),
});

if (response.ok) {
  // Account deleted, redirect to homepage
  window.location.href = '/';
}
```
{% /tab %}
{% /tabs %}

### Response (204 No Content)

No response body. The account is successfully deleted and all tokens are invalidated.

### What Gets Deleted

When you delete your account:

1. **User record** is soft-deleted (marked as deleted, not physically removed)
2. **Personal information** is anonymized:
   - Email replaced with `deleted-{timestamp}@example.com`
   - First and last name removed
   - Phone number removed
   - Profile picture removed
3. **Organization ownership** is transferred to the next admin (if any)
4. **Memberships** are removed from all organizations
5. **Sessions and tokens** are immediately revoked
6. **Invoices and financial data** are preserved for legal/tax compliance (anonymized)

### Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Missing password |
| `401` | Unauthorized - Invalid or expired token |
| `403` | Forbidden - Incorrect password |
| `409` | Conflict - Cannot delete account with active subscriptions or pending invoices |

### Error Response Examples

**Incorrect Password (403)**

```json
{
  "code": 403,
  "message": "Password is incorrect. Account not deleted."
}
```

**Active Subscription (409)**

```json
{
  "code": 409,
  "message": "Cannot delete account with active subscription. Please cancel your subscription first."
}
```

---

## Usage Notes

### Preferences Object

The `preferences` object is flexible and can contain any custom user settings:

```json
{
  "language": "ro",
  "theme": "dark",
  "currency": "RON",
  "dateFormat": "d/m/Y",
  "notifications": {
    "email": true,
    "push": false,
    "sms": false,
    "invoiceReminders": true
  },
  "dashboard": {
    "defaultView": "grid",
    "showStats": true
  }
}
```

### Timezone Support

Valid timezone values follow the [IANA Time Zone Database](https://www.iana.org/time-zones):

- `Europe/Bucharest` (Romania)
- `Europe/London` (UK)
- `America/New_York` (US Eastern)
- `Asia/Tokyo` (Japan)
- etc.

### Phone Number Format

While any format is accepted, E.164 format is recommended for international compatibility:

- **E.164 format**: `+40721234567`
- **Alternative**: `0721234567` (national format)

### Security Best Practices

1. **Password changes** require the current password
2. **Account deletion** requires password confirmation
3. **Email changes** may require re-confirmation (check with support)
4. **Token invalidation** occurs on password change (user must re-login)
5. **Audit logging** tracks all profile changes for security

### Rate Limiting

- Profile updates: 10 requests per minute
- Account deletion: 3 attempts per hour (failed password attempts)
