---
title: Revoke token
description: Revoke an active OAuth2 access token or refresh token per RFC 7009.
---

# Revoke token

Revokes an active OAuth2 access token or refresh token. This is a public endpoint — no `Authorization` header is required. The client authenticates using `client_id` and `client_secret` in the request body.

Per [RFC 7009](https://datatracker.ietf.org/doc/html/rfc7009), this endpoint always returns `200 OK` regardless of whether the token was found or already revoked. This prevents token enumeration attacks.

```http
POST /api/v1/oauth2/revoke
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | The access token (`storno_oat_...`) or refresh token (`storno_ort_...`) to revoke |
| `token_type_hint` | string | No | A hint about the token type to speed up lookup. Either `access_token` or `refresh_token`. If omitted, Storno will attempt to detect the type automatically |
| `client_id` | string | Yes | The client's public identifier, prefixed with `storno_cid_` |
| `client_secret` | string | Confidential only | The client secret for `confidential` clients. Omit for `public` clients |

## Response

Always returns `200 OK` with an empty body, per RFC 7009.

## Example Request — Revoking an access token

```bash
curl -X POST 'https://api.storno.ro/api/v1/oauth2/revoke' \
  -H 'Content-Type: application/json' \
  -d '{
    "token": "storno_oat_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    "token_type_hint": "access_token",
    "client_id": "storno_cid_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "client_secret": "storno_cs_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
  }'
```

## Example Request — Revoking a refresh token

```bash
curl -X POST 'https://api.storno.ro/api/v1/oauth2/revoke' \
  -H 'Content-Type: application/json' \
  -d '{
    "token": "storno_ort_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8",
    "token_type_hint": "refresh_token",
    "client_id": "storno_cid_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "client_secret": "storno_cs_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
  }'
```

## Example Response

```http
HTTP/1.1 200 OK
```

## Errors

This endpoint returns `200 OK` even for unknown or already-revoked tokens, per RFC 7009. The only error condition that returns a non-200 response is invalid client authentication.

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | invalid_client | The `client_id` does not exist, or the `client_secret` is incorrect for a `confidential` client |

## Important Notes

- **RFC 7009 compliance** — a `200 OK` response does not confirm that the token was valid or found. It only confirms that the token will not be accepted for API calls going forward, regardless of its prior state
- **Revoking a refresh token** cascades to the access token that was issued alongside it. The associated access token is also invalidated immediately. The reverse is not true — revoking an access token does not invalidate the corresponding refresh token
- **Logout flows** — when implementing user logout in your application, revoke both the access token and the refresh token to ensure clean session termination. Present the `token_type_hint` for each call to speed up server-side lookup
- The `token_type_hint` is advisory only — if the hint does not match the actual token type, Storno will still find and revoke the correct token by searching both token stores

## Related Endpoints

- [Token endpoint](/api-reference/oauth2/token)
- [Authorization endpoint](/api-reference/oauth2/authorize)
- [Revoke OAuth2 client](/api-reference/oauth2/revoke-client)
- [OAuth2 Provider overview](/api-reference/oauth2/overview)
