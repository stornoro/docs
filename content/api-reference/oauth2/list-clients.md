---
title: List OAuth2 clients
description: Retrieve all registered OAuth2 applications for the current organization.
---

# List OAuth2 clients

Returns all OAuth2 applications registered by the current organization. Results are sorted by creation date, newest first. The `clientSecret` value is never included in list or detail responses — it is only returned once at creation time or after a secret rotation.

```http
GET /api/v1/oauth2/clients
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Organization` | string | No | Organization UUID. Defaults to the authenticated user's active organization |

### Required permission

`oauth2_app.view`

## Response

Returns a `{ data: [...] }` object containing an array of OAuth2Client objects.

### OAuth2Client object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | Human-readable display name of the application |
| `description` | string \| null | Optional longer description of the application's purpose |
| `clientId` | string | Public client identifier, prefixed with `storno_cid_` |
| `clientSecretPrefix` | string | First characters of the client secret, used for identification without exposing the full value |
| `clientType` | string | Either `confidential` or `public` |
| `redirectUris` | string[] | Registered redirect URIs allowed during the authorization flow |
| `scopes` | string[] | Permission scopes the application is allowed to request |
| `websiteUrl` | string \| null | URL of the application's website, shown on the consent screen |
| `logoUrl` | string \| null | URL of the application's logo image, shown on the consent screen |
| `isActive` | boolean | Whether the application can currently initiate new authorization flows |
| `revokedAt` | string \| null | ISO 8601 timestamp of when the application was revoked, or `null` if still active |
| `createdAt` | string | ISO 8601 creation timestamp |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/oauth2/clients' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Example Response

```json
{
  "data": [
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
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "Mobile Expense Tracker",
      "description": null,
      "clientId": "storno_cid_b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
      "clientSecretPrefix": "storno_cs_b2c3",
      "clientType": "public",
      "redirectUris": ["com.example.expensetracker://oauth/callback"],
      "scopes": ["invoice.view", "export.data"],
      "websiteUrl": null,
      "logoUrl": null,
      "isActive": true,
      "revokedAt": null,
      "createdAt": "2025-11-20T14:30:00Z"
    }
  ]
}
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | The authenticated user does not have the `oauth2_app.view` permission |

## Important Notes

- Both active and revoked applications are returned; filter on `revokedAt` or `isActive` to show only active clients
- The full `clientSecret` value is never exposed after creation — only `clientSecretPrefix` is included for identification
- Applications belong to the organization, not to an individual user; all members with the appropriate permission can view them

## Related Endpoints

- [Create OAuth2 client](/api-reference/oauth2/create-client)
- [Get OAuth2 client](/api-reference/oauth2/get-client)
- [Update OAuth2 client](/api-reference/oauth2/update-client)
- [Revoke OAuth2 client](/api-reference/oauth2/revoke-client)
- [Rotate client secret](/api-reference/oauth2/rotate-secret)
