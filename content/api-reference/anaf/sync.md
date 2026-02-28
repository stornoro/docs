---
title: E-Factura Sync
description: Trigger and monitor e-Factura synchronization
---

# E-Factura Sync

Manage e-Factura synchronization with ANAF SPV platform.

---

## Trigger Manual Sync

```http
POST /api/v1/sync/trigger
```

Manually trigger e-Factura synchronization for all companies with valid ANAF tokens.

The sync process:
- Validates ANAF token availability
- Checks subscription plan rate limits
- Dispatches async sync job
- Fetches new invoices from ANAF SPV

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

```json
{
  "message": "Sync triggered"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - no valid ANAF token or rate limit exceeded |
| 429 | Too many sync requests - try again later |

---

## Get Sync Status

```http
GET /api/v1/sync/status
```

Get current synchronization status and configuration.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

```json
{
  "enabled": true,
  "lastSync": "2026-02-16T11:30:00Z",
  "tokenValid": true,
  "syncInterval": "hourly"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| enabled | boolean | Whether automatic sync is enabled |
| lastSync | string\|null | ISO 8601 timestamp of last successful sync |
| tokenValid | boolean | Whether user has a valid ANAF token |
| syncInterval | string | Sync frequency: `hourly`, `daily`, or `manual` |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |

---

## Get Sync Log

```http
GET /api/v1/sync/log
```

Retrieve recent sync activity log showing the last 50 synced invoices.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns an array of recent sync activities.

```json
[
  {
    "invoiceId": "FINV2026001",
    "cif": "12345678",
    "syncedAt": "2026-02-16T11:30:15Z",
    "status": "success"
  },
  {
    "invoiceId": "FINV2026002",
    "cif": "12345678",
    "syncedAt": "2026-02-16T11:30:18Z",
    "status": "success"
  }
]
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| invoiceId | string | Invoice identifier |
| cif | string | Company CIF |
| syncedAt | string | ISO 8601 timestamp of sync |
| status | string | Sync status: `success`, `failed`, or `skipped` |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
