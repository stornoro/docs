---
title: Mark All Notifications as Read
description: Mark all notifications as read at once
---

# Mark All Notifications as Read

Mark all notifications for the authenticated user as read in a single operation.

---

## Mark All as Read

```http
POST /api/v1/notifications/read-all
```

Mark all user notifications as read. This is useful for "clear all" functionality in notification panels.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns `204 No Content` on success.

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |

### Notes

- This operation is idempotent
- All notifications will have `isRead` set to `true`
- The unread count will be reset to 0
