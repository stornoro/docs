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

Get a paginated, searchable list of all users on the platform, newest first.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token (SUPER_ADMIN required) |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10, max: 20, larger values are clamped) |
| search | string | No | Partial match on email, first name or last name |

### Response

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "phone": null,
      "roles": ["ROLE_USER"],
      "active": true,
      "emailVerified": true,
      "lastConnectedAt": "2026-02-16T09:00:00+00:00",
      "createdAt": "2026-01-15T10:00:00+00:00"
    }
  ],
  "total": 1523,
  "page": 1,
  "limit": 10
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | User UUID |
| email | string | User email address |
| firstName | string | First name |
| lastName | string | Last name |
| fullName | string | First and last name |
| phone | string\|null | Phone number |
| roles | array | System roles, for example `ROLE_USER` or `ROLE_SUPER_ADMIN` |
| active | boolean | Account active status |
| emailVerified | boolean | Email verification status |
| lastConnectedAt | string\|null | Last login timestamp |
| createdAt | string | Registration timestamp |

---

## Get User Details

```http
GET /api/v1/admin/users/{id}
```

Get one user. The response is a single user object with the fields above.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User UUID |

---

## Toggle User Active Status

```http
POST /api/v1/admin/users/{id}/toggle-active
```

Switch a user's `active` flag. An active user becomes inactive and the other way round.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User UUID |

### Response

```json
{
  "active": false,
  "message": "User deactivated."
}
```

`message` is `User activated.` when the user is now active.

---

## Verify User Email

```http
POST /api/v1/admin/users/{id}/verify-email
```

Mark a user's email address as verified.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User UUID |

### Response

```json
{
  "message": "Email verified."
}
```

---

## Resend Confirmation Email

```http
POST /api/v1/admin/users/{id}/resend-confirmation
```

Queue the email confirmation message again.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User UUID |

### Response

```json
{
  "message": "Confirmation email sent."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Resend only: the email is already verified |
| 401 | Unauthorized, invalid authentication |
| 403 | Forbidden, requires SUPER_ADMIN role |
| 404 | User not found |
