---
title: List Notifications
description: Retrieve paginated list of user notifications
---

# List Notifications

Retrieve a paginated list of notifications for the authenticated user.

---

## Get Notifications

```http
GET /api/v1/notifications
```

Retrieve user notifications with pagination support.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10, max: 20). Larger values are reduced to 20 |

### Response

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "invoice.validated",
      "channel": "in_app",
      "title": "Factură validată",
      "message": "Factura FINV2026001 a fost validată de ANAF",
      "from": null,
      "link": null,
      "data": {
        "invoiceNumber": "FINV2026001"
      },
      "isRead": false,
      "readAt": null,
      "sentAt": "2026-02-16T10:30:00+00:00",
      "createdAt": "2026-02-16T10:30:00+00:00",
      "push": {
        "attempted": true,
        "sentAt": "2026-02-16T10:30:01+00:00",
        "error": null,
        "skippedReason": null
      }
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "type": "sync.error",
      "channel": "in_app",
      "title": "Eroare la sincronizare",
      "message": "Sincronizarea e-Factura a întâmpinat erori",
      "from": null,
      "link": null,
      "data": {},
      "isRead": true,
      "readAt": "2026-02-16T09:10:00+00:00",
      "sentAt": "2026-02-16T09:00:00+00:00",
      "createdAt": "2026-02-16T09:00:00+00:00",
      "push": {
        "attempted": false,
        "sentAt": null,
        "error": null,
        "skippedReason": "quiet_hours"
      }
    }
  ],
  "total": 47,
  "page": 1,
  "limit": 10
}
```

### Response fields

#### Pagination
| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of notification objects |
| total | integer | Total number of notifications |
| page | integer | Current page number |
| limit | integer | Items per page |

#### Notification object
| Field | Type | Description |
|-------|------|-------------|
| id | string | Notification UUID |
| type | string | Event name, for example `invoice.validated` |
| channel | string | Channel the notification was created for, `in_app` |
| title | string | Notification title |
| message | string | Notification message |
| from | string\|null | Sender label |
| link | string\|null | Link to the related page |
| data | object | Additional data, depends on the type |
| isRead | boolean | Whether the notification has been read |
| readAt | string\|null | ISO 8601 time of the last update of a read notification |
| sentAt | string\|null | ISO 8601 timestamp |
| createdAt | string | ISO 8601 timestamp |
| push | object | Push delivery diagnostics (see below) |

#### Push delivery object
| Field | Type | Description |
|-------|------|-------------|
| attempted | boolean | Whether the backend tried to push to FCM/APNs |
| sentAt | string\|null | ISO 8601 timestamp of the first successful device delivery |
| error | string\|null | Last error from FCM/relay if all attempts failed |
| skippedReason | string\|null | `quiet_hours` (muted overnight) or `no_devices` (no registered devices) |

### Notification types

`type` is a dotted event name. The event types a user can configure are listed in [Get notification preferences](/api-reference/notification-preferences/get). Examples are `invoice.validated`, `invoice.rejected`, `invoice.overdue`, `payment.received`, `token.expiring_soon`, `sync.error` and `fiscal.deadline`. Other types can appear, so treat `type` as an open set.

### Error responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
