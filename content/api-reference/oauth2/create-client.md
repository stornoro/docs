---
title: Create OAuth2 client
description: Register a new OAuth2 application to build a third-party integration with Storno.
---

# Create OAuth2 client

Registers a new OAuth2 application for the current organization. The `clientSecret` is returned **only once** in the creation response and cannot be retrieved again — store it securely immediately after creation. For `public` clients, no `clientSecret` is issued; PKCE is the security mechanism.

This endpoint requires an active browser session (JWT). It cannot be called using an API token or an OAuth2 access token.

```http
POST /api/v1/oauth2/clients
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer JWT from an active browser session |
| `Content-Type` | string | Yes | Must be `application/json` |

### Required permission

`oauth2_app.manage`

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Human-readable display name for the application (shown on the consent screen) |
| `clientType` | string | No | Either `confidential` or `public`. Defaults to `confidential` |
| `redirectUris` | string[] | Yes | One or more URIs to which Storno may redirect after authorization. Must be valid HTTPS URLs; `http://localhost` and custom URI schemes are also accepted for development |
| `scopes` | string[] | Yes | Permission scopes the application is allowed to request. Must be valid `Permission` values and a subset of the authenticated user's own permissions |
| `description` | string | No | Optional description of the application's purpose |
| `websiteUrl` | string | No | URL of the application's website, displayed on the consent screen |
| `logoUrl` | string | No | URL of the application's logo image, displayed on the consent screen |

## Response

Returns the created client object with a `201 Created` status. For `confidential` clients, the response includes a `clientSecret` field containing the raw secret value. This field is **not** included in any subsequent response.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | Display name of the application |
| `description` | string \| null | Application description |
| `clientId` | string | Public client identifier, prefixed with `storno_cid_` |
| `clientSecret` | string \| null | The full raw client secret — present only for `confidential` clients, store this securely, it will not be shown again |
| `clientSecretPrefix` | string \| null | First characters of the client secret for future identification. `null` for `public` clients |
| `clientType` | string | `confidential` or `public` |
| `redirectUris` | string[] | Registered redirect URIs |
| `scopes` | string[] | Permitted scopes |
| `websiteUrl` | string \| null | Application website URL |
| `logoUrl` | string \| null | Application logo URL |
| `isActive` | boolean | Always `true` on creation |
| `revokedAt` | string \| null | Always `null` on creation |
| `createdAt` | string | ISO 8601 creation timestamp |

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/oauth2/clients' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Acme Accounting Integration",
    "clientType": "confidential",
    "redirectUris": ["https://acme-accounting.com/oauth/callback"],
    "scopes": ["invoice.view", "client.view"],
    "description": "Syncs invoices from Storno to Acme Accounting in real time.",
    "websiteUrl": "https://acme-accounting.com",
    "logoUrl": "https://acme-accounting.com/logo.png"
  }'
```

## Example Response

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Acme Accounting Integration",
  "description": "Syncs invoices from Storno to Acme Accounting in real time.",
  "clientId": "storno_cid_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
  "clientSecret": "storno_cs_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
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
| 401 | unauthorized | Invalid or missing authentication token, or token is not a browser session JWT |
| 403 | forbidden | The authenticated user does not have the `oauth2_app.manage` permission |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- Missing `name` field
- Missing or empty `redirectUris` array
- One or more `redirectUris` are not valid URLs
- Missing or empty `scopes` array
- One or more scope values are not valid `Permission` values
- One or more scopes exceed the authenticated user's own permissions
- `clientType` is not `confidential` or `public`

## Important Notes

- The `clientSecret` in the response is the only time the raw secret value is ever transmitted — it is stored as a one-way hash server-side
- If you lose the `clientSecret`, use [Rotate client secret](/api-reference/oauth2/rotate-secret) to generate a new one; the old secret is immediately invalidated
- `localhost` redirect URIs and custom URI schemes (e.g. `com.example.app://callback`) are accepted to support local development and native mobile applications
- The requested `scopes` define the maximum scopes the application may ask for during an authorization flow — users may still grant a narrower subset on the consent screen
- This endpoint requires a browser session JWT. API tokens and OAuth2 access tokens are not accepted, preventing automated creation of OAuth2 applications

## Related Endpoints

- [List OAuth2 clients](/api-reference/oauth2/list-clients)
- [Get OAuth2 client](/api-reference/oauth2/get-client)
- [Update OAuth2 client](/api-reference/oauth2/update-client)
- [Revoke OAuth2 client](/api-reference/oauth2/revoke-client)
- [Rotate client secret](/api-reference/oauth2/rotate-secret)
