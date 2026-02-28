---
title: Unregister Device
description: Unregister device token from push notifications
---

# Unregister Device

Unregister a device token to stop receiving push notifications.

---

## Unregister Device Token

```http
DELETE /api/v1/devices
```

Unregister a device token. The device will no longer receive push notifications.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| Content-Type | string | Yes | Must be `application/json` |

### Request Body

```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Device push notification token to unregister |

### Response

Returns `204 No Content` on successful unregistration.

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 404 | Device token not found |

### Notes

- Unregistering an already-unregistered token returns success
- This operation is idempotent
- Call this when user logs out or disables notifications
- The same token can be registered again later
- Inactive tokens are automatically cleaned up after 90 days
