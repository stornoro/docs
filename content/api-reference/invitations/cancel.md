---
title: Cancel Invitation
description: Cancel a pending invitation
---

# Cancel Invitation

Cancel a pending invitation before it is accepted or expires.

---

## Cancel Invitation

```http
DELETE /api/v1/invitations/{uuid}
```

Cancel a pending invitation. The invitation token will be invalidated and cannot be used.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | string | Invitation UUID |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns `204 No Content` on successful cancellation.

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - insufficient permissions |
| 404 | Invitation not found or already accepted |

### Notes

- Cannot cancel invitations that have already been accepted
- Cancelled invitations cannot be restored
- Only organization admins and owners can cancel invitations
- User will not be notified of cancellation
