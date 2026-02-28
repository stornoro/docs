---
title: Get E-Factura Message
description: Get detailed information about a specific e-Factura message
---

# Get E-Factura Message

Retrieve detailed information about a specific e-Factura message.

---

## Get Message Details

```http
GET /api/v1/efactura-messages/{uuid}
```

Get full details of an e-Factura message including all metadata and related invoice information.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | string | Message UUID |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

```json
{
  "uuid": "990e8400-e29b-41d4-a716-446655440005",
  "invoiceId": "123e4567-e89b-12d3-a456-426614174000",
  "invoice": {
    "number": "FINV2026001",
    "date": "2026-02-15",
    "client": "SC Example SRL",
    "total": 11900.00
  },
  "messageType": "response",
  "status": "ok",
  "messageId": "12345678",
  "details": {
    "code": "200",
    "message": "Factura a fost acceptată de ANAF SPV",
    "uploadIndex": "987654321",
    "stateDate": "2026-02-16T11:30:15Z"
  },
  "rawData": {
    "Titlu": "Factura cu id_incarcare=987654321 emisa de cif_emitent=12345678",
    "Detalii": "Factura este in curs de procesare",
    "tip": "FACTURA PRIMITA",
    "id": "12345678"
  },
  "receivedAt": "2026-02-16T11:30:00Z",
  "processedAt": "2026-02-16T11:30:15Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| uuid | string | Message UUID |
| invoiceId | string\|null | Related invoice UUID |
| invoice | object\|null | Basic invoice information |
| invoice.number | string | Invoice number |
| invoice.date | string | Invoice date |
| invoice.client | string | Client name |
| invoice.total | number | Invoice total amount |
| messageType | string | Message type |
| status | string | Message status |
| messageId | string | ANAF message identifier |
| details | object | Parsed message details |
| rawData | object | Raw message data from ANAF |
| receivedAt | string | ISO 8601 timestamp when received |
| processedAt | string\|null | ISO 8601 timestamp when processed |

### Details Field Structure

The `details` object structure varies by message type:

#### Response Message
```json
{
  "code": "200",
  "message": "Factura a fost acceptată",
  "uploadIndex": "987654321",
  "stateDate": "2026-02-16T11:30:15Z"
}
```

#### Error Message
```json
{
  "code": "ERR_XML_001",
  "message": "Eroare validare XML: CIF invalid",
  "field": "cif",
  "expected": "Format: ROXXXXXXXX",
  "received": "12345678"
}
```

#### Notification Message
```json
{
  "code": "ACCEPTED",
  "message": "Factura a fost acceptată de destinatar",
  "downloadId": "123456789",
  "acceptedDate": "2026-02-16T14:00:00Z"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - message belongs to another organization |
| 404 | Message not found |

### Notes

- Full message details include both parsed and raw data
- Raw data preserves the original ANAF response format
- Invoice information is included when available
- Use this endpoint to troubleshoot invoice upload issues
- Message history is retained for audit purposes
