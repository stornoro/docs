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
| limit | integer | No | Items per page (default: 20, max: 100) |

### Response

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "invoice_received",
      "title": "Factură nouă primită",
      "message": "Ați primit factura FINV2026001 de la SC Example SRL",
      "data": {
        "invoiceId": "123e4567-e89b-12d3-a456-426614174000",
        "invoiceNumber": "FINV2026001",
        "clientName": "SC Example SRL",
        "amount": 11900.00
      },
      "isRead": false,
      "createdAt": "2026-02-16T10:30:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "type": "sync_completed",
      "title": "Sincronizare finalizată",
      "message": "Sincronizare e-Factura finalizată: 5 facturi noi",
      "data": {
        "syncedCount": 5,
        "cif": "12345678"
      },
      "isRead": true,
      "createdAt": "2026-02-16T09:00:00Z"
    }
  ],
  "total": 47,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

### Response Fields

#### Pagination
| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of notification objects |
| total | integer | Total number of notifications |
| page | integer | Current page number |
| limit | integer | Items per page |
| pages | integer | Total number of pages |

#### Notification Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID of notification |
| type | string | Notification type identifier |
| title | string | Notification title |
| message | string | Notification message |
| data | object | Additional notification data (type-specific) |
| isRead | boolean | Whether notification has been read |
| createdAt | string | ISO 8601 timestamp |

### Notification Types

| Type | Description |
|------|-------------|
| invoice_received | New invoice received from ANAF |
| invoice_paid | Invoice marked as paid |
| sync_completed | E-Factura sync finished |
| sync_failed | E-Factura sync failed |
| token_expiring | ANAF token expiring soon |
| token_expired | ANAF token has expired |
| payment_overdue | Payment is overdue |
| invitation_received | Invited to join organization |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 422 | Invalid pagination parameters |
