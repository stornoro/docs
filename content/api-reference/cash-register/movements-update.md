---
title: Update cash movement
description: Edit a previously recorded manual cash movement.
---

# Update cash movement

Updates a manual cash movement. All fields from the create endpoint are accepted as partial — omitted fields keep their current value. The currency cannot be changed.

```http
PATCH /api/v1/cash-register/movements/{uuid}
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
| `Content-Type` | string | Yes | `application/json` |

## Body parameters

Same shape as [Create cash movement](/api-reference/cash-register/movements-create), all optional.

Special rules:
- Changing `kind` between `deposit`/`withdrawal` re-applies the auto-direction.
- `direction` is only honoured while `kind=other`.
- `movementDate` is still bound to the cash account's `openingBalanceDate`.

## Response

`200 OK`. Same shape as create.

## Permissions

Requires `settings.manage`.

## Errors

| Status | Description |
|--------|-------------|
| 400 | Invalid field value or backdated `movementDate` |
| 401 | Unauthenticated |
| 403 | Permission denied |
| 404 | Movement not found in this company |
