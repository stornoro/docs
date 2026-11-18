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
  "role": "accountant",
  "expiresAt": "2026-02-23T12:00:00+00:00",
  "hasAccount": true
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| email | string | Email address invited |
| organizationName | string | Name of organization |
| role | string | Role being offered |
| expiresAt | string | ISO 8601 expiry timestamp |
| hasAccount | boolean | Whether an account already exists for the invited email |

### Error Responses

Errors return `{"error": "..."}`.

| Status | Description |
|--------|-------------|
| 404 | Invitation not found, already used, cancelled or expired |

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

Returns `200 OK`.

```json
{
  "message": "Invitatie acceptata cu succes.",
  "organizationId": "440e8400-e29b-41d4-a716-446655440004",
  "organizationName": "Acme Corporation SRL"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| message | string | Confirmation text |
| organizationId | string | Organization UUID |
| organizationName | string | Organization name |

### Error Responses

Errors return `{"error": "..."}`.

| Status | Code | Description |
|--------|------|-------------|
| 401 | | Unauthorized - must be logged in |
| 402 | `PLAN_LIMIT` | The organization reached its seat limit |
| 403 | | The authenticated user's email does not match the invitation |
| 404 | | Invitation not found, already used, cancelled or expired |
| 409 | `ALREADY_MEMBER` | The user is already a member. The invitation is marked as accepted |

### Notes

- Authenticated user's email must match invitation email
- Invitation is consumed after successful acceptance
- User gains immediate access to the organization
- For accountants and employees, company access is copied from the `allowedCompanies` of the invitation
- Invitation token can only be used once
