---
title: Admin User Management
description: Manage users (SUPER_ADMIN only)
---

# Admin User Management

Manage user accounts with administrative privileges. These endpoints are restricted to SUPER_ADMIN users.

---

## List All Users

```http
GET /api/v1/admin/users
```

Get a paginated, searchable list of all users on the platform.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token (SUPER_ADMIN required) |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 50, max: 200) |
| search | string | No | Search by name or email |
| status | string | No | Filter by status: `active`, `inactive`, `verified`, `unverified` |
| role | string | No | Filter by role |

### Response

```json
{
  "data": [
    {
      "id": 123,
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "isVerified": true,
      "role": "USER",
      "createdAt": "2026-01-15T10:00:00Z",
      "lastLoginAt": "2026-02-16T09:00:00Z",
      "organizations": [
        {
          "uuid": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Acme Corp",
          "role": "OWNER"
        }
      ]
    }
  ],
  "total": 1523,
  "page": 1,
  "limit": 50,
  "pages": 31
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | integer | User database ID |
| uuid | string | User UUID |
| email | string | User email address |
| firstName | string | First name |
| lastName | string | Last name |
| isActive | boolean | Account active status |
| isVerified | boolean | Email verification status |
| role | string | System role |
| createdAt | string | ISO 8601 registration timestamp |
| lastLoginAt | string\|null | ISO 8601 last login timestamp |
| organizations | array | User's organizations and roles |

---

## Get User Details

```http
GET /api/v1/admin/users/{id}
```

Get detailed information about a specific user.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | User ID |

### Response

```json
{
  "id": 123,
  "uuid": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "isVerified": true,
  "role": "USER",
  "createdAt": "2026-01-15T10:00:00Z",
  "lastLoginAt": "2026-02-16T09:00:00Z",
  "emailVerifiedAt": "2026-01-15T10:05:00Z",
  "organizations": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corp",
      "role": "OWNER",
      "joinedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "devices": [
    {
      "platform": "ios",
      "registeredAt": "2026-02-10T14:00:00Z"
    }
  ],
  "stats": {
    "invoiceCount": 234,
    "organizationCount": 1
  }
}
```

---

## Toggle User Active Status

```http
POST /api/v1/admin/users/{id}/toggle-active
```

Toggle a user's active status (activate/deactivate account).

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | User ID |

### Response

```json
{
  "id": 123,
  "isActive": false,
  "message": "User account deactivated"
}
```

### Notes

- Deactivated users cannot log in
- Existing sessions remain valid until expiry
- Cannot deactivate SUPER_ADMIN users

---

## Verify User Email

```http
POST /api/v1/admin/users/{id}/verify-email
```

Manually verify a user's email address.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | User ID |

### Response

```json
{
  "id": 123,
  "isVerified": true,
  "message": "User email verified"
}
```

---

## Resend Confirmation Email

```http
POST /api/v1/admin/users/{id}/resend-confirmation
```

Resend the email confirmation link to a user.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | User ID |

### Response

```json
{
  "message": "Confirmation email sent"
}
```

### Error Responses

All endpoints return:

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - requires SUPER_ADMIN role |
| 404 | User not found |
| 422 | Validation error |

### Notes

- All user management actions are logged
- Cannot modify other SUPER_ADMIN accounts
- Email changes require re-verification
- Use with caution - affects user access
