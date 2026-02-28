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

Resend the invitation email. This does not extend the expiration date.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | string | Invitation UUID |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns `204 No Content` on successful email send.

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - insufficient permissions |
| 404 | Invitation not found or already accepted |
| 410 | Gone - invitation has expired |

### Notes

- Email is sent to the original invitation email address
- Expiration date is not extended
- If invitation has expired, cancel and create a new invitation instead
- Only organization admins and owners can resend invitations
- Rate limiting may apply to prevent email abuse
