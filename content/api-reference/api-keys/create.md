---
title: Create API token
description: Create a new API token for programmatic access to the API.
---

# Create API token

Creates a new API token for the authenticated user. The raw token value is returned **only once** in the creation response and cannot be retrieved again. Store it securely immediately after creation.

Requested scopes must be a subset of the permissions the authenticated user already holds. Attempting to grant scopes the user does not have will result in a validation error.

```http
POST /api/v1/api-tokens
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | A human-readable label for the token (e.g. "CI/CD Pipeline") |
| `scopes` | string[] | Yes | One or more permission scope values. Must be valid `Permission` values and a subset of the user's own permissions. See [List available scopes](/api-reference/api-keys/scopes) |
| `expiresAt` | string | No | ISO 8601 datetime at which the token expires. Omit for a non-expiring token |

## Response

Returns the created token object with a `201 Created` status. The response includes a `token` field containing the raw token value. This field is **not** included in any subsequent response.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | Human-readable name |
| `token` | string | The full raw token value — store this securely, it will not be shown again |
| `tokenPrefix` | string | First 8 characters of the token, used for future identification |
| `scopes` | string[] | Permission scopes granted to this token |
| `lastUsedAt` | string \| null | Always `null` on creation |
| `expireAt` | string \| null | ISO 8601 expiry timestamp, or `null` if the token never expires |
| `revokedAt` | string \| null | Always `null` on creation |
| `createdAt` | string | ISO 8601 creation timestamp |

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/api-tokens' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "CI/CD Pipeline",
    "scopes": ["invoice.view", "invoice.create", "client.view"],
    "expiresAt": "2027-01-01T00:00:00Z"
  }'
```

## Example Response

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "CI/CD Pipeline",
  "token": "aft_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  "tokenPrefix": "aft_a1b2",
  "scopes": ["invoice.view", "invoice.create", "client.view"],
  "lastUsedAt": null,
  "expireAt": "2027-01-01T00:00:00Z",
  "revokedAt": null,
  "createdAt": "2026-02-18T10:00:00Z"
}
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- Missing `name` field
- Missing or empty `scopes` array
- One or more scope values are not valid `Permission` values
- One or more scopes exceed the authenticated user's own permissions
- `expiresAt` is in the past or has an invalid date format

## Important Notes

- The `token` field in the response is the only time the raw token value is ever transmitted — it is stored as a one-way hash server-side
- Tokens use the `aft_` prefix to make them easily identifiable in source code and logs
- There is no upper limit on the number of tokens a user can create, but each token is subject to the same rate limits as interactive sessions
- Tokens inherit the organization context from the user who created them

## Related Endpoints

- [List API tokens](/api-reference/api-keys/list)
- [Update API token](/api-reference/api-keys/update)
- [Revoke API token](/api-reference/api-keys/revoke)
- [List available scopes](/api-reference/api-keys/scopes)
