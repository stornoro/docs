---
title: Unread Notification Count
description: Get count of unread notifications
---

# Unread Notification Count

Get the number of unread notifications for the authenticated user.

---

## Get Unread Count

```http
GET /api/v1/notifications/unread-count
```

Retrieve the count of unread notifications. This endpoint is optimized for frequent polling (e.g., for notification badge).

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

```json
{
  "count": 5
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| count | integer | Number of unread notifications |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |

### Notes

- This endpoint is lightweight and suitable for polling
- Consider using WebSocket/Centrifugo for real-time updates instead of frequent polling
- Notifications are marked as read via the `/notifications/{id}/read` endpoint
