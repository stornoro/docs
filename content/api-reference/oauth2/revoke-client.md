---
title: Revoke OAuth2 client
description: Permanently revoke an OAuth2 application and all of its issued access and refresh tokens.
---

# Revoke OAuth2 client

Permanently revokes an OAuth2 application and **all** access tokens and refresh tokens that were issued under it. All affected tokens stop working immediately. This operation cannot be undone — create a new application if access needs to be re-established.

This endpoint requires an active browser session (JWT). It cannot be called using an API token or an OAuth2 access token.

```http
DELETE /api/v1/oauth2/clients/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the OAuth2 application to revoke |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer JWT from an active browser session |

### Required permission

`oauth2_app.manage`

## Response

Returns a `204 No Content` status with no response body on success.

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/oauth2/clients/a1b2c3d4-e5f6-7890-abcd-ef1234567890' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Example Response

```http
HTTP/1.1 204 No Content
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token, or token is not a browser session JWT |
| 403 | forbidden | The authenticated user does not have the `oauth2_app.manage` permission |
| 404 | not_found | OAuth2 application not found, or belongs to a different organization |

## Important Notes

- Revocation is immediate and cascades to **all** tokens — every access token and refresh token ever issued for this application stops working at the moment this call completes
- Third-party applications that currently hold valid tokens for this client will receive `401 Unauthorized` on their next API call
- Revocation is permanent; there is no unrevoke operation. Create a new OAuth2 application and have users re-authorize if access is needed again
- Revoking an already-revoked application returns `204 No Content` without error, making this operation idempotent
- This endpoint requires a browser session JWT. API tokens and OAuth2 access tokens are not accepted, preventing automated revocation of OAuth2 applications
- To disable an application temporarily without revoking tokens, use [Update OAuth2 client](/api-reference/oauth2/update-client) and set `isActive` to `false`

## Related Endpoints

- [List OAuth2 clients](/api-reference/oauth2/list-clients)
- [Get OAuth2 client](/api-reference/oauth2/get-client)
- [Create OAuth2 client](/api-reference/oauth2/create-client)
- [Update OAuth2 client](/api-reference/oauth2/update-client)
- [Revoke token](/api-reference/oauth2/revoke-token)
