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

Update the user's notification preferences. All notification types must be provided in the request.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| Content-Type | string | Yes | Must be `application/json` |

### Request Body

```json
{
  "preferences": {
    "invoiceReceived": {
      "email": true,
      "inApp": true,
      "push": false
    },
    "invoicePaid": {
      "email": false,
      "inApp": true,
      "push": false
    },
    "syncCompleted": {
      "email": false,
      "inApp": true,
      "push": false
    },
    "syncFailed": {
      "email": true,
      "inApp": true,
      "push": true
    },
    "tokenExpiring": {
      "email": true,
      "inApp": true,
      "push": true
    },
    "tokenExpired": {
      "email": true,
      "inApp": true,
      "push": true
    },
    "paymentOverdue": {
      "email": true,
      "inApp": true,
      "push": true
    },
    "invitationReceived": {
      "email": true,
      "inApp": true,
      "push": false
    }
  }
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| preferences | object | Yes | Notification preferences object |

Each notification type must include:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | boolean | Yes | Enable email notifications |
| inApp | boolean | Yes | Enable in-app notifications |
| push | boolean | Yes | Enable push notifications |

### Response

Returns the updated preferences (same format as GET endpoint):

```json
{
  "preferences": {
    "invoiceReceived": {
      "email": true,
      "inApp": true,
      "push": false
    }
    // ... other preferences
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 422 | Validation error - missing or invalid preferences |

### Notes

- All notification types must be provided
- Partial updates are not supported - use PUT with full object
- Changes take effect immediately
