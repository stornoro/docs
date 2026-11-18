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
  "token": "fcm-device-token-0123456789abcdef"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Device push notification token to unregister |

### Response

Returns `200 OK`:

```json
{
  "status": "removed"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | `token` is missing |
| 401 | Unauthorized - invalid authentication |

### Notes

- Only tokens registered by the authenticated user are removed
- An unknown token is not an error: the call still returns `200 OK`
- Call this when the user logs out or disables notifications
- The same token can be registered again later
