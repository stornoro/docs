---
title: Get OAuth2 client
description: Retrieve a single OAuth2 application by UUID.
---

# Get OAuth2 client

Returns a single OAuth2 application belonging to the current organization, identified by its UUID. The `clientSecret` value is never included in this response.

```http
GET /api/v1/oauth2/clients/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the OAuth2 application to retrieve |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Organization` | string | No | Organization UUID. Defaults to the authenticated user's active organization |

### Required permission

`oauth2_app.view`

## Response

Returns the OAuth2Client object with a `200 OK` status.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | Human-readable display name of the application |
| `description` | string \| null | Optional description of the application's purpose |
| `clientId` | string | Public client identifier, prefixed with `storno_cid_` |
| `clientSecretPrefix` | string \| null | First characters of the client secret for identification. `null` for `public` clients |
| `clientType` | string | `confidential` or `public` |
| `redirectUris` | string[] | Registered redirect URIs |
| `scopes` | string[] | Permission scopes the application is allowed to request |
| `websiteUrl` | string \| null | Application website URL |
| `logoUrl` | string \| null | Application logo URL |
| `isActive` | boolean | Whether the application can currently initiate new authorization flows |
| `revokedAt` | string \| null | ISO 8601 timestamp of revocation, or `null` if still active |
| `createdAt` | string | ISO 8601 creation timestamp |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/oauth2/clients/a1b2c3d4-e5f6-7890-abcd-ef1234567890' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Example Response

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Acme Accounting Integration",
  "description": "Syncs invoices from Storno to Acme Accounting in real time.",
  "clientId": "storno_cid_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
  "clientSecretPrefix": "storno_cs_a1b2",
  "clientType": "confidential",
  "redirectUris": ["https://acme-accounting.com/oauth/callback"],
  "scopes": ["invoice.view", "client.view"],
  "websiteUrl": "https://acme-accounting.com",
  "logoUrl": "https://acme-accounting.com/logo.png",
  "isActive": true,
  "revokedAt": null,
  "createdAt": "2026-01-15T09:00:00Z"
}
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | The authenticated user does not have the `oauth2_app.view` permission |
| 404 | not_found | OAuth2 application not found, or belongs to a different organization |

## Important Notes

- The full `clientSecret` is never returned by this endpoint — only `clientSecretPrefix` is exposed for identification
- Revoked applications are still retrievable via this endpoint; check `revokedAt` to determine the application's status

## Related Endpoints

- [List OAuth2 clients](/api-reference/oauth2/list-clients)
- [Create OAuth2 client](/api-reference/oauth2/create-client)
- [Update OAuth2 client](/api-reference/oauth2/update-client)
- [Revoke OAuth2 client](/api-reference/oauth2/revoke-client)
- [Rotate client secret](/api-reference/oauth2/rotate-secret)
