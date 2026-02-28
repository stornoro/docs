---
title: Create Invitation
description: Invite a user to join the organization
---

# Create Invitation

Invite a new user to join the organization with a specific role.

---

## Create Invitation

```http
POST /api/v1/invitations
```

Send an invitation email to a user to join the organization.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| Content-Type | string | Yes | Must be `application/json` |

### Request Body

```json
{
  "email": "newuser@example.com",
  "role": "ACCOUNTANT"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email address of user to invite |
| role | string | Yes | Role: `ADMIN`, `ACCOUNTANT`, or `EMPLOYEE` |

### Response

Returns `201 Created` with the invitation object:

```json
{
  "uuid": "770e8400-e29b-41d4-a716-446655440002",
  "email": "newuser@example.com",
  "role": "ACCOUNTANT",
  "createdAt": "2026-02-16T12:00:00Z",
  "expiresAt": "2026-02-23T12:00:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| uuid | string | Invitation UUID |
| email | string | Invited user email |
| role | string | Role assigned to invitation |
| createdAt | string | ISO 8601 creation timestamp |
| expiresAt | string | ISO 8601 expiry timestamp (7 days) |

### Validation Rules

- Email must be valid format
- Email cannot already be a member
- Role must be one of: `ADMIN`, `ACCOUNTANT`, `EMPLOYEE`
- Cannot invite to `OWNER` role

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - insufficient permissions |
| 422 | Validation error - invalid email or role, or user already member |

### Notes

- Invitations expire after 7 days
- An invitation email is automatically sent
- User must accept invitation to become a member
- Only organization admins and owners can send invitations
