---
title: Delete cash movement
description: Remove a manual cash movement from the ledger.
---

# Delete cash movement

Permanently deletes a manual cash movement. Receipts and invoice payments cannot be deleted via this endpoint — use their respective resources.

```http
DELETE /api/v1/cash-register/movements/{uuid}
```

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Movement UUID |

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `X-Company` | string | Yes | Company UUID |

## Response

`200 OK`.

```json
{ "message": "Movement deleted." }
```

## Permissions

Requires `settings.manage`.

## Errors

| Status | Description |
|--------|-------------|
| 401 | Unauthenticated |
| 403 | Permission denied |
| 404 | Movement not found in this company |
