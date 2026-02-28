---
title: Mark Notification as Read
description: Mark a specific notification as read
---

# Mark Notification as Read

Mark a specific notification as read for the authenticated user.

---

## Mark as Read

```http
PATCH /api/v1/notifications/{id}/read
```

Mark a single notification as read. This is typically called when the user views the notification.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Notification UUID |

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
| 403 | Forbidden - notification belongs to another user |
| 404 | Notification not found |

### Notes

- This operation is idempotent
- Marking as read decrements the unread count
- Already-read notifications can be marked as read again without error
