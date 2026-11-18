---
title: List E-Factura Messages
description: List e-Factura messages from ANAF with filtering
---

# List E-Factura Messages

Retrieve the e-Factura messages Storno has received from the ANAF SPV platform, with pagination and filtering. Results are ordered by creation date, newest first.

---

## Get E-Factura Messages

```http
GET /api/v1/efactura-messages
```

Get e-Factura messages (received invoices, sent invoice results, errors) from ANAF with optional filtering. Requires the `efactura.view` permission.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | Yes | Company UUID to scope the request |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10, max: 20) |
| messageType | string | No | Filter by message type, exactly as ANAF names it (see below) |
| status | string | No | Filter by status: `received`, `processed`, `error`, `expired` |
| search | string | No | Matches the ANAF message id or the message details |

### Response

```json
{
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440005",
      "anafMessageId": "3012345678",
      "messageType": "FACTURA PRIMITA",
      "cif": "12345678",
      "details": "Factura cu id_incarcare=5012345678 emisa de cif_emitent=87654321",
      "uploadId": "5012345678",
      "status": "processed",
      "errorMessage": null,
      "invoice": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "number": "FINV2026001"
      },
      "createdAt": "2026-02-16T11:30:00+00:00"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440006",
      "anafMessageId": "3012345679",
      "messageType": "ERORI FACTURA",
      "cif": "12345678",
      "details": "Factura cu id_incarcare=5012345680 ...",
      "uploadId": "5012345680",
      "status": "error",
      "errorMessage": "Eroare validare XML",
      "invoice": null,
      "createdAt": "2026-02-16T11:35:00+00:00"
    }
  ],
  "total": 145,
  "page": 1,
  "limit": 10
}
```

### Response Fields

#### Pagination

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of message objects |
| total | integer | Total number of messages matching the filters |
| page | integer | Current page number |
| limit | integer | Items per page |

#### Message Object

| Field | Type | Description |
|-------|------|-------------|
| id | string | Message UUID |
| anafMessageId | string | ANAF message identifier |
| messageType | string | ANAF message type (see below) |
| cif | string \| null | CIF the message was addressed to |
| details | string \| null | The message text as ANAF sent it |
| uploadId | string \| null | ANAF upload index, read from the details when present |
| status | string | Message status (see below) |
| errorMessage | string \| null | Error text when the message could not be processed |
| invoice | object \| null | The related invoice, `{id, number}`, when one is linked |
| createdAt | string | ISO 8601 timestamp when Storno stored the message |

### Message Types

`messageType` holds the type ANAF assigns to the message. The values Storno processes are:

| Type | Description |
|------|-------------|
| `FACTURA PRIMITA` | An invoice received from a supplier |
| `FACTURA TRIMISA` | The result for an invoice you sent |
| `ERORI FACTURA` | Validation errors for an invoice you sent |

ANAF can send other types; they are stored with the type ANAF gave them.

### Message Statuses

| Status | Description |
|--------|-------------|
| received | Stored, not processed yet |
| processed | Processed |
| error | Processing failed; see `errorMessage` |
| expired | ANAF no longer serves the file (after 60 days) |

### Filtering Examples

```http
# Get only error messages
GET /api/v1/efactura-messages?messageType=ERORI%20FACTURA

# Get received invoices that were processed
GET /api/v1/efactura-messages?messageType=FACTURA%20PRIMITA&status=processed

# Search by ANAF message id or details text
GET /api/v1/efactura-messages?search=5012345678

# Second page
GET /api/v1/efactura-messages?page=2&limit=20
```

### Error Responses

Errors have the body `{"error": "message"}`.

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | The caller lacks the `efactura.view` permission |
| 404 | Company not found |

### Notes

- Messages are synced automatically during e-Factura sync
- A message is linked to an invoice when one matches
- Use filters to troubleshoot invoice upload issues
