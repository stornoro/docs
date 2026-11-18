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
  "role": "accountant",
  "allowedCompanies": [
    "550e8400-e29b-41d4-a716-446655440000"
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email address of user to invite |
| role | string | Yes | Role: `admin`, `accountant` or `employee` |
| allowedCompanies | string[] | No | Company UUIDs the new member can access. Used for accountants and employees. Companies of other organizations are ignored |

### Response

Returns `201 Created` with the invitation object:

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "email": "newuser@example.com",
  "role": "accountant",
  "status": "pending",
  "createdAt": "2026-02-16T12:00:00+00:00",
  "expiresAt": "2026-02-23T12:00:00+00:00",
  "invitedBy": {
    "id": "123e4567-e89b-12d3-a456-426614174009",
    "firstName": "John",
    "lastName": "Doe"
  },
  "allowedCompanies": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Example Company SRL",
      "cif": "12345678"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Invitation UUID |
| email | string | Invited user email |
| role | string | Role assigned to invitation |
| status | string | `pending`, `accepted`, `cancelled` or `expired` |
| createdAt | string | ISO 8601 creation timestamp |
| expiresAt | string | ISO 8601 expiry timestamp |
| invitedBy | object | `id`, `firstName` and `lastName` of the inviting user |
| allowedCompanies | array | Companies the member will access, each with `id`, `name` and `cif` |

### Validation Rules

- Email must be valid format
- Email cannot already be a member
- No pending invitation can exist for the email
- Role must be one of: `admin`, `accountant`, `employee`
- Cannot invite to the `owner` role
- An organization can hold at most 10 pending invitations

### Error Responses

Errors return `{"error": "..."}`.

| Status | Code | Description |
|--------|------|-------------|
| 400 | | Invalid email, missing or invalid role |
| 400 | `INVITATION_LIMIT` | The organization already has 10 pending invitations |
| 401 | | Unauthorized - invalid authentication |
| 402 | `PLAN_LIMIT` | The plan seat limit is reached |
| 403 | | Insufficient permissions |
| 409 | `ALREADY_MEMBER` | The user is already a member |
| 409 | `ALREADY_INVITED` | A pending invitation exists for this email |
| 422 | | Role is `owner` |
| 429 | `INVITATION_RATE_LIMIT` | The organization sent more than 10 invitation emails in an hour |

### Notes

- Invitations expire after 7 days
- An invitation email is automatically sent
- User must accept invitation to become a member
- Requires the `org.manage_members` permission
