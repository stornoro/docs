---
title: Resend Invitation
description: Resend invitation email
---

# Resend Invitation

Resend the invitation email for a pending invitation.

---

## Resend Invitation

```http
POST /api/v1/invitations/{uuid}/resend
```

Resend the invitation email. The expiry date is reset to 7 days from now.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | string | Invitation UUID |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns `200 OK` with the invitation object, in the same form as an entry of the [invitations list](/api-reference/invitations/list).

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

### Error Responses

Errors return `{"error": "..."}`.

| Status | Code | Description |
|--------|------|-------------|
| 401 | | Unauthorized - invalid authentication |
| 403 | | Forbidden - insufficient permissions |
| 404 | | Invitation not found |
| 422 | | The invitation is no longer pending (accepted, cancelled or expired) |
| 429 | `INVITATION_RATE_LIMIT` | The organization sent more than 10 invitation emails in an hour |

### Notes

- Email is sent to the original invitation email address
- Resending resets the expiry to 7 days from now
- An expired invitation cannot be resent: create a new invitation instead
- Requires the `org.manage_members` permission
- Invitation emails are limited to 10 per hour per organization, shared with the create endpoint
