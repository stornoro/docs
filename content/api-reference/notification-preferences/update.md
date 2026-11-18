---
title: Update Notification Preferences
description: Update user notification preferences
---

# Update Notification Preferences

Update notification preferences for the authenticated user.

---

## Update Preferences

```http
PUT /api/v1/notification-preferences
```

Update the user's notification preferences. Send only the event types you want to change.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| Content-Type | string | Yes | Must be `application/json` |

### Request Body

```json
{
  "preferences": [
    {
      "eventType": "invoice.validated",
      "emailEnabled": true,
      "inAppEnabled": true,
      "pushEnabled": false
    },
    {
      "eventType": "sync.error",
      "emailEnabled": true,
      "telegramEnabled": true
    }
  ]
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| preferences | array | Yes | List of preference changes |
| preferences[].eventType | string | Yes | One of the event types in [Get notification preferences](/api-reference/notification-preferences/get). Entries with an unknown event type are skipped |
| preferences[].emailEnabled | boolean | No | Enable email notifications |
| preferences[].inAppEnabled | boolean | No | Enable in-app notifications |
| preferences[].pushEnabled | boolean | No | Enable push notifications |
| preferences[].telegramEnabled | boolean | No | Enable Telegram notifications |
| preferences[].whatsappEnabled | boolean | No | Enable WhatsApp notifications |
| preferences[].smsEnabled | boolean | No | Enable SMS notifications |

Channels you leave out keep their current value. Enabling `smsEnabled` or `whatsappEnabled` needs a phone number on the user profile and a paid plan.

### Response

Returns `200 OK` with the full list, in the same format as [Get notification preferences](/api-reference/notification-preferences/get):

```json
{
  "data": [
    {
      "eventType": "invoice.validated",
      "emailEnabled": true,
      "inAppEnabled": true,
      "pushEnabled": false,
      "telegramEnabled": false,
      "whatsappEnabled": false,
      "smsEnabled": false
    }
  ]
}
```

The example is shortened. The response has an entry for every event type.

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 422 | `preferences` is not an array, or SMS or WhatsApp was enabled without a phone number or on a free plan. The second case has `code: "PHONE_CHANNEL_UNAVAILABLE"` |

### Notes

- Partial updates are supported
- Changes take effect immediately
- Preferences are stored per user
