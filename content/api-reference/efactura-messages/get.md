---
title: Get E-Factura Message
description: Get detailed information about a specific e-Factura message
---

# Get E-Factura Message

Retrieve a specific e-Factura message.

---

## Get Message Details

```http
GET /api/v1/efactura-messages/{uuid}
```

Get the stored details of one e-Factura message. Requires the `efactura.view` permission.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | string | Message UUID |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | Yes | Company UUID to scope the request |

### Response

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440005",
  "anafMessageId": "3012345678",
  "messageType": "FACTURA PRIMITA",
  "cif": "12345678",
  "details": "Factura cu id_incarcare=5012345678 emisa de cif_emitent=87654321",
  "uploadId": "5012345678",
  "status": "processed",
  "errorMessage": null,
  "createdAt": "2026-02-16T11:30:00+00:00"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Message UUID |
| anafMessageId | string | ANAF message identifier |
| messageType | string | ANAF message type: `FACTURA PRIMITA`, `FACTURA TRIMISA`, `ERORI FACTURA` or another type ANAF sent |
| cif | string \| null | CIF the message was addressed to |
| details | string \| null | The message text as ANAF sent it |
| uploadId | string \| null | ANAF upload index, read from the details when present |
| status | string | `received`, `processed`, `error` or `expired` |
| errorMessage | string \| null | Error text when the message could not be processed |
| createdAt | string | ISO 8601 timestamp when Storno stored the message |

The detail response does not include the related invoice; the [list](/api-reference/efactura-messages/list) carries `invoice: {id, number}`.

### Error Responses

Errors have the body `{"error": "message"}`.

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | The caller lacks the `efactura.view` permission |
| 404 | Company or message not found, or the message belongs to another company |

### Notes

- `details` is the text ANAF sent; it is not parsed into separate fields
- Use this endpoint to troubleshoot invoice upload issues
