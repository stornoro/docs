---
title: Rotate client secret
description: Generate a new client secret for a confidential OAuth2 application, immediately invalidating the previous one.
---

# Rotate client secret

Generates a new `clientSecret` for a `confidential` OAuth2 application. The previous secret is immediately invalidated — any token exchange requests still using it will fail. The new raw secret value is returned **only once** in this response; store it securely immediately.

This endpoint is only available for `confidential` clients. `public` clients do not have a client secret.

This endpoint requires an active browser session (JWT). It cannot be called using an API token or an OAuth2 access token.

```http
POST /api/v1/oauth2/clients/{uuid}/rotate-secret
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the OAuth2 application whose secret should be rotated |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer JWT from an active browser session |

### Required permission

`oauth2_app.manage`

## Response

Returns the updated OAuth2Client object with a `200 OK` status. The response includes a `clientSecret` field containing the new raw secret value. This field is **not** included in any subsequent response.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `name` | string | Display name of the application |
| `description` | string \| null | Application description |
| `clientId` | string | Public client identifier (unchanged) |
| `clientSecret` | string | The full raw new client secret — store this securely, it will not be shown again |
| `clientSecretPrefix` | string | Updated prefix of the new client secret |
| `clientType` | string | Always `confidential` for this operation |
| `redirectUris` | string[] | Registered redirect URIs (unchanged) |
| `scopes` | string[] | Permitted scopes (unchanged) |
| `websiteUrl` | string \| null | Application website URL (unchanged) |
| `logoUrl` | string \| null | Application logo URL (unchanged) |
| `isActive` | boolean | Active status (unchanged) |
| `revokedAt` | string \| null | Revocation timestamp (unchanged) |
| `createdAt` | string | ISO 8601 creation timestamp (unchanged) |

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/oauth2/clients/a1b2c3d4-e5f6-7890-abcd-ef1234567890/rotate-secret' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Example Response

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Acme Accounting Integration",
  "description": "Syncs invoices from Storno to Acme Accounting in real time.",
  "clientId": "storno_cid_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
  "clientSecret": "storno_cs_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8",
  "clientSecretPrefix": "storno_cs_z9y8",
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
| 403 | forbidden | The authenticated user does not have the `oauth2_app.manage` permission, or the application is a `public` client |
| 404 | not_found | OAuth2 application not found, or belongs to a different organization |

## Important Notes

- The old `clientSecret` stops working the moment this call returns — update your application's configuration before rotating if you need zero-downtime rollover
- The new `clientSecret` in the response is the only time the raw value is ever transmitted — it is stored as a one-way hash server-side
- Rotating the secret does **not** revoke existing access tokens or refresh tokens; those remain valid until they expire or are individually revoked
- Existing refresh tokens will stop working when they next attempt to use the old secret for client authentication during a token exchange
- This operation cannot be performed on `public` clients, which have no client secret
- This endpoint requires a browser session JWT. API tokens and OAuth2 access tokens are not accepted

## Related Endpoints

- [List OAuth2 clients](/api-reference/oauth2/list-clients)
- [Get OAuth2 client](/api-reference/oauth2/get-client)
- [Create OAuth2 client](/api-reference/oauth2/create-client)
- [Update OAuth2 client](/api-reference/oauth2/update-client)
- [Revoke OAuth2 client](/api-reference/oauth2/revoke-client)
