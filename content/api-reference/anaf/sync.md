---
title: E-Factura Sync
description: Trigger and monitor e-Factura synchronization
---

# E-Factura Sync

Manage e-Factura synchronization with the ANAF SPV platform. All three endpoints work on one company, chosen with the `X-Company` header.

---

## Trigger Manual Sync

```http
POST /api/v1/sync/trigger
```

Queues an e-Factura synchronization for the company. Requires the `efactura.submit` permission.

Before queuing, the request:
- Checks the cooldown of the organization's plan (time since the last sync of the company)
- Resolves an ANAF token for the company and checks with ANAF that it has access to the company CIF

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | Yes | Company UUID |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| days | integer | No | Number of days to fetch back, overriding the company setting |

### Response

Returns `202 Accepted`.

```json
{
  "status": "queued"
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 401 | | Unauthorized - invalid authentication |
| 403 | | Permission denied |
| 404 | | Company not found |
| 422 | `NO_TOKEN` | The company has no valid ANAF token |
| 422 | `TOKEN_INVALID_FOR_CIF` | The token has no access to the company CIF |
| 429 | `SYNC_RATE_LIMITED` | The plan cooldown has not passed. `retryAfter` carries the seconds to wait, also sent as the `Retry-After` header |
| 429 | | ANAF rate limit reached. `retryAfter` carries the seconds to wait |

---

## Get Sync Status

```http
GET /api/v1/sync/status
```

Returns the synchronization state of the company. Requires the `efactura.view` permission.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | Yes | Company UUID |

### Response

```json
{
  "syncEnabled": true,
  "lastSyncedAt": "2026-02-16T11:30:00+00:00",
  "hasValidToken": true,
  "tokenError": null,
  "syncDaysBack": 60,
  "syncInterval": 86400
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| syncEnabled | boolean | Whether automatic sync is enabled for the company |
| lastSyncedAt | string\|null | ISO 8601 timestamp of the last sync |
| hasValidToken | boolean | Whether a token exists and has access to the company CIF |
| tokenError | string\|null | Why the token was refused, when `hasValidToken` is `false` |
| syncDaysBack | integer | Days fetched back on each sync |
| syncInterval | integer | Minimum seconds between syncs allowed by the plan |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Permission denied |
| 404 | Company not found |

---

## Get Sync Log

```http
GET /api/v1/sync/log
```

Returns the invoices most recently synchronized from ANAF, newest first. Requires the `efactura.view` permission.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | Yes | Company UUID |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Entries to return. Default 10, maximum 50 |
| offset | integer | No | Entries to skip. Default 0 |
| direction | string | No | `incoming` or `outgoing` |
| status | string | No | Invoice status to filter by |
| search | string | No | Matches the invoice number, the sender or receiver name, or the sender or receiver CIF |

### Response

```json
{
  "entries": [
    {
      "id": "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b",
      "number": "FCT-2026001",
      "direction": "incoming",
      "status": "validated",
      "syncedAt": "2026-02-16T11:30:15+00:00",
      "senderName": "Example Supplier SRL",
      "receiverName": "Example Company SRL",
      "total": "121.00",
      "currency": "RON"
    }
  ],
  "total": 1
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| entries[].id | string | Invoice UUID |
| entries[].number | string | Invoice number |
| entries[].direction | string | `incoming` or `outgoing` |
| entries[].status | string | Invoice status |
| entries[].syncedAt | string | ISO 8601 timestamp of the sync |
| entries[].senderName | string\|null | Sender name |
| entries[].receiverName | string\|null | Receiver name |
| entries[].total | string | Invoice total |
| entries[].currency | string | Currency code |
| total | integer | Number of matching invoices, never more than 50 |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Permission denied |
| 404 | Company not found |
