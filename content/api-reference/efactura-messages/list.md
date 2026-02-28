---
title: List E-Factura Messages
description: List e-Factura messages from ANAF with filtering
---

# List E-Factura Messages

Retrieve e-Factura messages from ANAF SPV platform with pagination and filtering.

---

## Get E-Factura Messages

```http
GET /api/v1/efactura-messages
```

Get e-Factura messages (responses, notifications, errors) from ANAF with optional filtering.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20, max: 100) |
| messageType | string | No | Filter by message type |
| status | string | No | Filter by status |

### Response

```json
{
  "data": [
    {
      "uuid": "990e8400-e29b-41d4-a716-446655440005",
      "invoiceId": "123e4567-e89b-12d3-a456-426614174000",
      "messageType": "response",
      "status": "ok",
      "messageId": "12345678",
      "details": {
        "code": "200",
        "message": "Factura a fost acceptată"
      },
      "receivedAt": "2026-02-16T11:30:00Z"
    },
    {
      "uuid": "aa0e8400-e29b-41d4-a716-446655440006",
      "invoiceId": "223e4567-e89b-12d3-a456-426614174001",
      "messageType": "error",
      "status": "error",
      "messageId": "12345679",
      "details": {
        "code": "ERR_XML_001",
        "message": "Eroare validare XML: CIF invalid"
      },
      "receivedAt": "2026-02-16T11:35:00Z"
    }
  ],
  "total": 145,
  "page": 1,
  "limit": 20,
  "pages": 8
}
```

### Response Fields

#### Pagination
| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of message objects |
| total | integer | Total number of messages |
| page | integer | Current page number |
| limit | integer | Items per page |
| pages | integer | Total number of pages |

#### Message Object
| Field | Type | Description |
|-------|------|-------------|
| uuid | string | Message UUID |
| invoiceId | string\|null | Related invoice UUID |
| messageType | string | Message type (see types below) |
| status | string | Message status (see statuses below) |
| messageId | string | ANAF message identifier |
| details | object | Message-specific details |
| receivedAt | string | ISO 8601 timestamp when received |

### Message Types

| Type | Description |
|------|-------------|
| response | ANAF response to uploaded invoice |
| notification | Status notification (accepted, rejected) |
| error | Error message from ANAF |
| warning | Warning about invoice issues |
| info | Informational message |

### Message Statuses

| Status | Description |
|--------|-------------|
| ok | Message processed successfully |
| error | Error occurred |
| warning | Warning issued |
| pending | Processing pending |

### Filtering Examples

```http
# Get only error messages
GET /api/v1/efactura-messages?messageType=error

# Get responses with OK status
GET /api/v1/efactura-messages?messageType=response&status=ok

# Get recent messages (page 1)
GET /api/v1/efactura-messages?page=1&limit=50
```

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 422 | Invalid query parameters |

### Notes

- Messages are synced automatically during e-Factura sync
- Each message relates to a specific invoice (when applicable)
- Details field structure varies by message type
- Messages are retained for audit purposes
- Use filters to troubleshoot invoice upload issues
