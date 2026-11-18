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

Errors return `{"error": "..."}`.

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - insufficient permissions |
| 404 | Invitation not found |
| 422 | The invitation is no longer pending (accepted, cancelled or expired) |

### Notes

- Only pending invitations can be cancelled
- Cancelled invitations cannot be restored
- Requires the `org.manage_members` permission
- User will not be notified of cancellation
