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

Returns `200 OK` with the updated notification object. The fields are the same as in [List notifications](/api-reference/notifications/list).

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "invoice.validated",
  "channel": "in_app",
  "title": "Factură validată",
  "message": "Factura FINV2026001 a fost validată de ANAF",
  "from": null,
  "link": null,
  "data": {},
  "isRead": true,
  "readAt": "2026-02-16T11:00:00+00:00",
  "sentAt": "2026-02-16T10:30:00+00:00",
  "createdAt": "2026-02-16T10:30:00+00:00",
  "push": {
    "attempted": true,
    "sentAt": "2026-02-16T10:30:01+00:00",
    "error": null,
    "skippedReason": null
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 404 | Notification not found, or it belongs to another user |

### Notes

- This operation is idempotent
- Marking as read lowers the unread count
- Already-read notifications can be marked as read again without error
