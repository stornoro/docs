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

Returns flat JSON with the user profile, the current organization, memberships and plan.

```json
{
  "id": "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "phone": "+40721234567",
  "locale": "ro",
  "timezone": "Europe/Bucharest",
  "respectQuietHours": true,
  "roles": [
    "ROLE_USER"
  ],
  "active": true,
  "emailVerified": true,
  "mfaEnabled": false,
  "hasPassword": true,
  "createdAt": "2026-01-15T10:30:00+00:00",
  "preferences": {
    "language": "ro",
    "theme": "light",
    "notifications": {
      "email": true,
      "push": false
    }
  },
  "avatarUrl": null,
  "organization": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Company SRL",
    "slug": "my-company-srl-a1b2c3",
    "createdAt": "2026-01-15T10:30:00+00:00",
    "whiteLabel": null
  },
  "plan": {
    "plan": "professional",
    "expired": false,
    "features": {
      "maxCompanies": 5,
      "apiAccess": true
    },
    "selfHosted": false,
    "communityEdition": false
  },
  "memberships": [
    {
      "id": "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a61",
      "role": "owner",
      "organization": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "My Company SRL",
        "slug": "my-company-srl-a1b2c3"
      }
    }
  ],
  "permissions": [
    "company.view",
    "invoice.view"
  ],
  "currentRole": "owner"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | User UUID |
| `email` | string | User's email address |
| `firstName` | string\|null | User's first name |
| `lastName` | string\|null | User's last name |
| `fullName` | string | First and last name combined |
| `phone` | string\|null | User's phone number |
| `locale` | string | Interface language, `ro` or `en` |
| `timezone` | string | User's timezone (IANA format) |
| `respectQuietHours` | boolean | When true, push notifications are skipped between 22:00 and 08:00 in the user's timezone |
| `roles` | string[] | Platform roles, for example `ROLE_USER` |
| `active` | boolean | Whether the account is active |
| `emailVerified` | boolean | Whether email has been confirmed |
| `mfaEnabled` | boolean | Whether TOTP two-factor authentication is enabled |
| `hasPassword` | boolean | `false` for accounts that signed up with a social login only |
| `createdAt` | string | Account creation timestamp (ISO 8601) |
| `preferences` | object\|null | User preferences and settings |
| `avatarUrl` | string\|null | Avatar path, `null` when there is no avatar |
| `organization` | object | Current organization: `id`, `name`, `slug`, `createdAt`, `whiteLabel` (`appName`, `logoUrl`, `primaryColor`, `removeBranding`, or `null` when white label is off) |
| `plan` | object | Plan status of the organization: `plan`, `expired`, `features`, `selfHosted`, `communityEdition`, and `trialEndsAt`, `trialActive`, `trialDaysLeft` when a trial exists |
| `memberships` | array | Active memberships, each with `id`, `role` (lowercase) and `organization` (`id`, `name`, `slug`) |
| `permissions` | string[] | Effective permissions of the user in the current organization |
| `currentRole` | string\|null | Role in the current organization: `owner`, `admin`, `accountant` or `employee` |

When the request carries an impersonation token, the response also has `impersonating` (`true`) and `impersonator` (`id`, `email`, `fullName`).

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
| `respectQuietHours` | boolean | No | Mute push notifications during quiet hours (22:00–08:00 user-local) |
| `preferences` | object | No | User preferences object |
| `newPassword` | string | No | New password. Requires `currentPassword` |
| `currentPassword` | string | With `newPassword` | Current password. Accounts without a password (social login only) send `verificationToken` instead |
| `verificationToken` | string | Social-only accounts | Step-up MFA verification token, used to set a first password |

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
    newPassword: 'NewSecurePassword456!',
  }),
});
```

### Response (200 OK)

```json
{
  "message": "Profile updated."
}
```

Fetch the profile with `GET /api/v1/me` to read the new values.

### Error Codes

| Code | Description |
|------|-------------|
| `401` | Unauthorized - Invalid or expired token |
| `422` | Unprocessable Entity - The current password is incorrect, or the verification token is missing or invalid |

Error bodies use the form `{"error": "..."}`. The timezone and phone number are stored as sent, without validation.

---

## Delete Account

Delete the user's account. The account is soft-deleted and deactivated at once, its personal information is anonymized, and the rest of the data is removed by a background job.

**Endpoint**: `DELETE /api/v1/me`

**Authentication**: Required (Bearer token)

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `password` | string | Yes | Current password for confirmation |
| `verificationToken` | string | Social-only accounts | Step-up MFA verification token, sent instead of `password` by accounts that have no password |

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

No response body. The account is deactivated at once, so later API calls with its tokens are refused.

### What gets deleted

1. The user record is soft-deleted and deactivated
2. Email is replaced with `deleted_{userId}@deleted.local`
3. First name, last name, phone, password, social login ids, Telegram link and preferences are cleared
4. The avatar file is deleted

### Error Codes

| Code | Description |
|------|-------------|
| `401` | Unauthorized - Invalid or expired token |
| `422` | Unprocessable Entity - Wrong or missing password, or missing or invalid verification token |

Error bodies use the form `{"error": "..."}`.

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

### Security notes

1. Password changes require the current password
2. Account deletion requires password confirmation
