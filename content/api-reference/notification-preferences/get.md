---
title: Get Notification Preferences
description: Retrieve user notification preferences
---

# Get Notification Preferences

Retrieve notification preferences for the authenticated user.

---

## Get Preferences

```http
GET /api/v1/notification-preferences
```

Get the user's notification preferences including channel preferences for each notification type.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

```json
{
  "preferences": {
    "invoiceReceived": {
      "email": true,
      "inApp": true,
      "push": true
    },
    "invoicePaid": {
      "email": true,
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

### Response Fields

Each notification type has three channel preferences:

| Field | Type | Description |
|-------|------|-------------|
| email | boolean | Send email notifications |
| inApp | boolean | Show in-app notifications |
| push | boolean | Send push notifications |

### Notification Types

| Type | Description |
|------|-------------|
| invoiceReceived | New invoice received from ANAF |
| invoicePaid | Invoice marked as paid |
| syncCompleted | E-Factura sync finished successfully |
| syncFailed | E-Factura sync failed |
| tokenExpiring | ANAF token expiring within 7 days |
| tokenExpired | ANAF token has expired |
| paymentOverdue | Invoice payment is overdue |
| invitationReceived | Invited to join organization |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |

### Notes

- Default preferences are applied for new users
- Preferences are stored per user, not per organization
