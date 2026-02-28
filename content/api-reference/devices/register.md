---
title: Register Device
description: Register device token for push notifications
---

# Register Device

Register a device token for push notifications.

---

## Register Device Token

```http
POST /api/v1/devices
```

Register a device token to enable push notifications for the authenticated user.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| Content-Type | string | Yes | Must be `application/json` |

### Request Body

```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Device push notification token |
| platform | string | Yes | Device platform: `ios`, `android`, or `web` |

### Response

Returns `201 Created` with the device registration:

```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440007",
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios",
  "registeredAt": "2026-02-16T12:00:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Device registration UUID |
| token | string | Device push token |
| platform | string | Device platform |
| registeredAt | string | ISO 8601 registration timestamp |

### Platform Values

| Platform | Description | Token Format |
|----------|-------------|--------------|
| ios | iOS devices | Apple APNs token or Expo token |
| android | Android devices | Firebase FCM token or Expo token |
| web | Web browsers | Web Push subscription or Expo token |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 422 | Validation error - invalid token or platform |

### Notes

- Multiple devices can be registered per user
- Registering the same token again updates the existing registration
- Tokens are validated for format based on platform
- Use the `/devices` DELETE endpoint to unregister
- Expo push tokens work across all platforms
- Only active devices receive push notifications
