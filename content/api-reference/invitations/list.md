---
title: List Invitations
description: List all pending invitations
---

# List Invitations

Retrieve all pending invitations for the organization.

---

## Get Invitations

```http
GET /api/v1/invitations
```

Get all pending (not yet accepted or expired) invitations.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns an array of pending invitation objects.

```json
[
  {
    "uuid": "770e8400-e29b-41d4-a716-446655440002",
    "email": "newuser@example.com",
    "role": "ACCOUNTANT",
    "createdAt": "2026-02-16T12:00:00Z",
    "expiresAt": "2026-02-23T12:00:00Z"
  },
  {
    "uuid": "880e8400-e29b-41d4-a716-446655440003",
    "email": "another@example.com",
    "role": "EMPLOYEE",
    "createdAt": "2026-02-15T10:00:00Z",
    "expiresAt": "2026-02-22T10:00:00Z"
  }
]
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| uuid | string | Invitation UUID |
| email | string | Invited user email |
| role | string | Role assigned to invitation |
| createdAt | string | ISO 8601 creation timestamp |
| expiresAt | string | ISO 8601 expiry timestamp |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - insufficient permissions |

### Notes

- Only returns pending invitations
- Accepted invitations are not shown
- Expired invitations may still appear until cleaned up
- Only organization admins and owners can view invitations
