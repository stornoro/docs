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
  "token": "fcm-device-token-0123456789abcdef",
  "platform": "ios"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Device push token. 20 to 512 characters from `A-Z`, `a-z`, `0-9`, `:`, `_` and `-` |
| platform | string | Yes | Device platform: `ios`, `android`, or `web` |

### Response

Returns `201 Created` when the device is new:

```json
{
  "status": "registered"
}
```

Returns `200 OK` when the same user registers a token that already exists. The `lastUsedAt` time is refreshed:

```json
{
  "status": "updated"
}
```

### Platform values

| Platform | Description |
|----------|-------------|
| ios | iOS devices |
| android | Android devices |
| web | Web browsers |

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | `token` or `platform` is missing, the token does not match the format above, or `platform` is not one of the listed values |
| 401 | Unauthorized - invalid authentication |
| 402 | The organization's plan does not include the mobile app. Body has `code: "PLAN_LIMIT"` |
| 409 | The token is already registered to another account |

### Notes

- A user can have at most 10 devices. Registering an 11th removes the oldest one
- Registering the same token again from the same account updates the existing registration
- Use `DELETE /api/v1/devices` to unregister
