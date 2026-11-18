---
title: Update OAuth2 client
description: Update an OAuth2 application's configuration, including its redirect URIs, scopes, and display metadata.
---

# Update OAuth2 client

Updates an existing OAuth2 application. This is a partial update — only the fields included in the request body are changed. Fields omitted from the body are left unchanged.

This endpoint requires an active browser session (JWT). It cannot be called using an API token or an OAuth2 access token.

```http
PATCH /api/v1/oauth2/clients/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the OAuth2 application to update |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer JWT from an active browser session |
| `Content-Type` | string | Yes | Must be `application/json` |

### Required permission

`oauth2_app.manage`

### Body Parameters

All parameters are optional. A parameter sent as `null` is ignored.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | New human-readable display name for the application |
| `description` | string \| null | Updated description of the application's purpose |
| `redirectUris` | string[] | Replacement set of allowed redirect URIs. Replaces the entire existing list |
| `scopes` | string[] | Replacement set of permitted scopes. Must be valid `Permission` values and a subset of the authenticated user's own permissions. Replaces the entire existing list |
| `isActive` | boolean | Set to `false` to disable the application without revoking it. Disabled applications cannot initiate new authorization flows but existing tokens remain valid |
| `websiteUrl` | string \| null | Updated application website URL |
| `logoUrl` | string \| null | Updated application logo URL |

## Response

Returns the updated OAuth2Client object under `data` with a `200 OK` status. The `clientSecret` is never included in this response.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | Updated display name |
| `description` | string \| null | Updated description |
| `clientId` | string | Public client identifier (unchanged) |
| `clientSecretPrefix` | string \| null | First characters of the client secret (unchanged) |
| `clientType` | string | `confidential` or `public` (cannot be changed after creation) |
| `redirectUris` | string[] | Updated redirect URIs |
| `scopes` | string[] | Updated permitted scopes |
| `websiteUrl` | string \| null | Updated website URL |
| `logoUrl` | string \| null | Updated logo URL |
| `isActive` | boolean | Updated active status |
| `revokedAt` | string \| null | ISO 8601 revocation timestamp, or `null` if still active |
| `createdAt` | string | ISO 8601 creation timestamp (unchanged) |

## Example Request

```bash
curl -X PATCH 'https://api.storno.ro/api/v1/oauth2/clients/a1b2c3d4-e5f6-7890-abcd-ef1234567890' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Acme Accounting Integration v2",
    "redirectUris": [
      "https://acme-accounting.com/oauth/callback",
      "https://acme-accounting.com/oauth/callback-v2"
    ],
    "scopes": ["invoice.view", "invoice.create", "client.view"]
  }'
```

## Example Response

```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Acme Accounting Integration v2",
    "description": "Syncs invoices from Storno to Acme Accounting in real time.",
    "clientId": "storno_cid_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "clientSecretPrefix": "storno_cs_a1b2",
    "clientType": "confidential",
    "redirectUris": [
      "https://acme-accounting.com/oauth/callback",
      "https://acme-accounting.com/oauth/callback-v2"
    ],
    "scopes": [
      "invoice.view",
      "invoice.create",
      "client.view"
    ],
    "websiteUrl": "https://acme-accounting.com",
    "logoUrl": "https://acme-accounting.com/logo.png",
    "isActive": true,
    "revokedAt": null,
    "createdAt": "2026-01-15T09:00:00Z"
  }
}
```

## Errors

Errors return `{"error": "..."}`.

| Status Code | Description |
|-------------|-------------|
| 400 | `name` is an empty string, `redirectUris` or `scopes` is empty, a redirect URI is invalid, or a scope is unknown |
| 401 | Invalid or missing authentication token |
| 403 | The user lacks `oauth2_app.manage`, the request used an API token or OAuth2 token, or a requested scope exceeds the user's own permissions |
| 404 | OAuth2 application not found, or belongs to a different organization |

## Important Notes

- Updating `redirectUris` or `scopes` replaces the full list — it is not an additive operation. Send the complete desired set
- The `clientType` cannot be changed after creation. Revoke and recreate the client if a different type is needed
- Setting `isActive` to `false` prevents new authorization flows but does **not** invalidate existing tokens. To immediately revoke all tokens, use [Revoke OAuth2 client](/api-reference/oauth2/revoke-client)
- Narrowing the `scopes` list does not immediately revoke tokens that were issued with broader scopes; those tokens will continue to work until they expire or are individually revoked
- This endpoint requires a browser session JWT. API tokens and OAuth2 access tokens are not accepted

## Related Endpoints

- [List OAuth2 clients](/api-reference/oauth2/list-clients)
- [Get OAuth2 client](/api-reference/oauth2/get-client)
- [Create OAuth2 client](/api-reference/oauth2/create-client)
- [Revoke OAuth2 client](/api-reference/oauth2/revoke-client)
- [Rotate client secret](/api-reference/oauth2/rotate-secret)
