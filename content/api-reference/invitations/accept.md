---
title: Accept Invitation
description: View and accept organization invitation
---

# Accept Invitation

View invitation details and accept an invitation to join an organization.

---

## Get Invitation Details

```http
GET /api/v1/invitations/accept/{token}
```

Get invitation details for display on the invitation acceptance page. This endpoint is public (no authentication required).

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| token | string | Invitation token from email link |

### Response

```json
{
  "email": "newuser@example.com",
  "organizationName": "Acme Corporation SRL",
  "role": "ACCOUNTANT",
  "invitedBy": "John Doe"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| email | string | Email address invited |
| organizationName | string | Name of organization |
| role | string | Role being offered |
| invitedBy | string | Name of user who sent invitation |

### Error Responses

| Status | Description |
|--------|-------------|
| 404 | Invitation not found or already used |
| 410 | Gone - invitation has expired |

---

## Accept Invitation

```http
POST /api/v1/invitations/accept/{token}
```

Accept the invitation and join the organization. User must be authenticated.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| token | string | Invitation token from email link |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns `200 OK` with the membership details:

```json
{
  "organization": {
    "uuid": "440e8400-e29b-41d4-a716-446655440004",
    "name": "Acme Corporation SRL"
  },
  "role": "ACCOUNTANT",
  "allowedCompanies": [
    "550e8400-e29b-41d4-a716-446655440000"
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| organization | object | Organization details |
| organization.uuid | string | Organization UUID |
| organization.name | string | Organization name |
| role | string | Assigned role |
| allowedCompanies | array | Initial company access (may be empty) |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - must be logged in |
| 404 | Invitation not found or already used |
| 409 | Conflict - user is already a member |
| 410 | Gone - invitation has expired |
| 422 | Validation error - email mismatch |

### Notes

- Authenticated user's email must match invitation email
- Invitation is consumed after successful acceptance
- User gains immediate access to the organization
- Initial company access is configured by organization admin after joining
- Invitation token can only be used once
