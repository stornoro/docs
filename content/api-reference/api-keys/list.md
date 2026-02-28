---
title: List API tokens
description: Retrieve all API tokens for the current user within the current organization.
---

# List API tokens

Retrieves all API tokens belonging to the authenticated user within the current organization. Tokens are returned sorted by creation date, newest first. The raw token value is never included in this response — it is only available once at creation time.

```http
GET /api/v1/api-tokens
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |

## Response

Returns an array of API token objects sorted by `createdAt` descending.

### API Token Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | Human-readable name given to the token |
| `tokenPrefix` | string | First 8 characters of the token, used for identification |
| `scopes` | string[] | Array of permission scopes granted to this token |
| `lastUsedAt` | string \| null | ISO 8601 timestamp of the most recent successful use, or `null` if never used |
| `expireAt` | string \| null | ISO 8601 expiry timestamp, or `null` if the token never expires |
| `revokedAt` | string \| null | ISO 8601 revocation timestamp, or `null` if the token is still active |
| `createdAt` | string | ISO 8601 creation timestamp |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/api-tokens' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Example Response

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "CI/CD Pipeline",
    "tokenPrefix": "aft_a1b2",
    "scopes": ["invoice.view", "invoice.create", "client.view"],
    "lastUsedAt": "2026-02-17T11:42:00Z",
    "expireAt": "2027-01-01T00:00:00Z",
    "revokedAt": null,
    "createdAt": "2026-01-15T09:00:00Z"
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Accounting Export Script",
    "tokenPrefix": "aft_b2c3",
    "scopes": ["invoice.view", "export.data"],
    "lastUsedAt": null,
    "expireAt": null,
    "revokedAt": "2026-02-10T08:00:00Z",
    "createdAt": "2025-11-20T14:30:00Z"
  }
]
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |

## Important Notes

- The `tokenHash` field is never returned in any list or detail response
- Both active and revoked tokens are included in the response; filter on `revokedAt` to show only active tokens
- Tokens are scoped to the authenticated user — other users' tokens are never visible
- The `tokenPrefix` is sufficient to let a user identify which token is which without exposing the secret

## Related Endpoints

- [Create API token](/api-reference/api-keys/create)
- [Update API token](/api-reference/api-keys/update)
- [Revoke API token](/api-reference/api-keys/revoke)
- [List available scopes](/api-reference/api-keys/scopes)
