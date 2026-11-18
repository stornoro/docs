---
title: Revoke API token
description: Revoke an API token, immediately preventing it from being used for authentication.
---

# Revoke API token

Revokes an existing API token by recording a `revokedAt` timestamp on the record. Revocation is a soft operation — the token row is not hard-deleted from the database — but the token immediately stops working for authentication. Only the token's owner can perform this operation. Requires the `api_key.manage` permission and a browser session JWT: requests authenticated with an API token or an OAuth2 token return 403.

```http
DELETE /api/v1/api-tokens/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the API token to revoke |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |

## Response

Returns a `204 No Content` status with no response body on success.

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/api-tokens/a1b2c3d4-e5f6-7890-abcd-ef1234567890' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Example Response

```http
HTTP/1.1 204 No Content
```

## Errors

Errors return `{"error": "..."}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | The user is not the owner of the token, lacks `api_key.manage`, or used an API token or OAuth2 token |
| 404 | API token not found |

## Important Notes

- Revocation takes effect immediately — any in-flight request using the revoked token after this call returns will receive a `401 Unauthorized` response
- Revocation is permanent and cannot be undone; create a new token if access needs to be re-established
- The revoked token remains visible in the [List API tokens](/api-reference/api-keys/list) response with a non-null `revokedAt` value, providing an audit trail
- Revoking a token that is already revoked returns `204 No Content` without error, making this operation idempotent
- A user cannot revoke their own current session token via this endpoint; that token is a JWT, not an API token

## Related Endpoints

- [List API tokens](/api-reference/api-keys/list)
- [Create API token](/api-reference/api-keys/create)
- [Update API token](/api-reference/api-keys/update)
- [List available scopes](/api-reference/api-keys/scopes)
