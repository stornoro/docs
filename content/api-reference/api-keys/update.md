---
title: Update API token
description: Update the name or scopes of an existing API token.
---

# Update API token

Updates the `name` or `scopes` of an existing API token. Only the token's owner can perform this operation. The token value itself and the expiry date cannot be changed — revoke and recreate the token if a new expiry is needed.

```http
PATCH /api/v1/api-tokens/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the API token to update |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

All parameters are optional, but at least one must be provided.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | New human-readable label for the token |
| `scopes` | string[] | Replacement set of permission scope values. Must be valid `Permission` values and a subset of the authenticated user's own permissions. Replaces the entire existing scope list |

## Response

Returns the updated API token object with a `200 OK` status. The raw token value is never included in this response.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | Updated human-readable name |
| `tokenPrefix` | string | First 8 characters of the token |
| `scopes` | string[] | Updated permission scopes |
| `lastUsedAt` | string \| null | ISO 8601 timestamp of the most recent successful use |
| `expireAt` | string \| null | ISO 8601 expiry timestamp, unchanged by this operation |
| `revokedAt` | string \| null | ISO 8601 revocation timestamp, or `null` if still active |
| `createdAt` | string | ISO 8601 creation timestamp |

## Example Request

```bash
curl -X PATCH 'https://api.storno.ro/api/v1/api-tokens/a1b2c3d4-e5f6-7890-abcd-ef1234567890' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "CI/CD Pipeline (read-only)",
    "scopes": ["invoice.view", "client.view"]
  }'
```

## Example Response

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "CI/CD Pipeline (read-only)",
  "tokenPrefix": "aft_a1b2",
  "scopes": ["invoice.view", "client.view"],
  "lastUsedAt": "2026-02-17T11:42:00Z",
  "expireAt": "2027-01-01T00:00:00Z",
  "revokedAt": null,
  "createdAt": "2026-01-15T09:00:00Z"
}
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | The authenticated user is not the owner of this token |
| 404 | not_found | API token not found |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- No fields provided for update
- One or more scope values are not valid `Permission` values
- One or more scopes exceed the authenticated user's own permissions
- `name` is an empty string

## Important Notes

- Updating `scopes` replaces the full scope list — it is not an additive operation. Send the complete desired set of scopes
- The `expireAt` value cannot be modified via this endpoint; revoke the token and create a new one with the desired expiry
- The raw token value is never returned — only `tokenPrefix` is exposed for identification
- Updating a revoked token's name or scopes is permitted but has no effect on authentication since revoked tokens are always rejected

## Related Endpoints

- [List API tokens](/api-reference/api-keys/list)
- [Create API token](/api-reference/api-keys/create)
- [Revoke API token](/api-reference/api-keys/revoke)
- [List available scopes](/api-reference/api-keys/scopes)
