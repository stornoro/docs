---
title: Token endpoint
description: Exchange an authorization code or refresh token for a new set of OAuth2 tokens.
---

# Token endpoint

Exchanges credentials for access and refresh tokens. This is a public endpoint — no `Authorization` header is required. Client authentication is performed via `client_id` and `client_secret` in the request body (for confidential clients).

Two grant types are supported: `authorization_code` for the initial token exchange after user authorization, and `refresh_token` for obtaining a new token pair after the access token expires.

```http
POST /api/v1/oauth2/token
```

This endpoint is rate-limited to **20 requests per minute** per client in production.

---

## Grant type: authorization_code

Exchanges a single-use authorization code (obtained from the [Authorization endpoint](/api-reference/oauth2/authorize)) for an access token and refresh token.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `grant_type` | string | Yes | Must be `authorization_code` |
| `code` | string | Yes | The authorization code received in the redirect from the authorization endpoint |
| `redirect_uri` | string | Yes | Must exactly match the `redirect_uri` used in the authorization request |
| `client_id` | string | Yes | The client's public identifier, prefixed with `storno_cid_` |
| `client_secret` | string | Confidential only | The client secret for `confidential` clients. Omit for `public` clients |
| `code_verifier` | string | Yes | The original PKCE code verifier. Storno will verify `SHA-256(code_verifier)` matches the `code_challenge` from the authorization request |

### Response

Returns `200 OK` with the token set.

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | string | Short-lived access token, prefixed with `storno_oat_`. Valid for 1 hour |
| `refresh_token` | string | Long-lived refresh token, prefixed with `storno_ort_`. Valid for 30 days |
| `token_type` | string | Always `Bearer` |
| `expires_in` | number | Lifetime of the access token in seconds. Always `3600` |
| `scope` | string | Space-separated list of scopes granted by the user |

### Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/oauth2/token' \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "authorization_code",
    "code": "4/0AfJohXlQs8kKpM7nNrZhQ2vWxyz",
    "redirect_uri": "https://acme-accounting.com/oauth/callback",
    "client_id": "storno_cid_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "client_secret": "storno_cs_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    "code_verifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
  }'
```

### Example Response

```json
{
  "access_token": "storno_oat_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  "refresh_token": "storno_ort_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "invoice.view client.view"
}
```

### Validation

The following checks are performed before issuing tokens:

- The authorization code has not expired (codes are valid for 10 minutes)
- The authorization code has not already been used (codes are single-use)
- The `redirect_uri` matches the URI used when the code was issued
- The `client_id` matches the client that requested the code
- The `client_secret` is valid (confidential clients only)
- The `code_verifier` produces the correct `code_challenge` via `SHA-256`

---

## Grant type: refresh_token

Exchanges a valid refresh token for a new access token and a new refresh token. Refresh tokens are rotated on every use — the old refresh token is invalidated immediately.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `grant_type` | string | Yes | Must be `refresh_token` |
| `refresh_token` | string | Yes | A valid, unused refresh token prefixed with `storno_ort_` |
| `client_id` | string | Yes | The client's public identifier, prefixed with `storno_cid_` |
| `client_secret` | string | Confidential only | The client secret for `confidential` clients. Omit for `public` clients |

### Response

Returns `200 OK` with a new token set. The structure is identical to the `authorization_code` response.

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | string | New access token, prefixed with `storno_oat_`. Valid for 1 hour |
| `refresh_token` | string | New refresh token, prefixed with `storno_ort_`. Valid for 30 days. The old refresh token is now invalid |
| `token_type` | string | Always `Bearer` |
| `expires_in` | number | Lifetime of the new access token in seconds. Always `3600` |
| `scope` | string | Space-separated list of granted scopes (unchanged from original authorization) |

### Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/oauth2/token' \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "storno_ort_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8",
    "client_id": "storno_cid_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "client_secret": "storno_cs_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
  }'
```

### Example Response

```json
{
  "access_token": "storno_oat_c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4",
  "refresh_token": "storno_ort_w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8t7s6r5",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "invoice.view client.view"
}
```

---

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | invalid_request | Missing or malformed request parameters |
| 400 | invalid_grant | The authorization code or refresh token is invalid, expired, already used, or does not belong to the provided `client_id` |
| 400 | invalid_client | The `client_id` does not exist or the `client_secret` is incorrect |
| 400 | unsupported_grant_type | The `grant_type` is not `authorization_code` or `refresh_token` |
| 400 | invalid_scope | Requested scopes are not a subset of the authorized scopes |
| 429 | rate_limited | Too many requests — the client has exceeded 20 requests per minute |

## Security Notes

- **Refresh token rotation** — every successful refresh produces a new refresh token and immediately invalidates the old one. Do not attempt to use the same refresh token twice
- **Token family revocation** — if a previously revoked refresh token is presented to this endpoint, Storno treats this as a replay attack and immediately revokes the **entire token family**, invalidating all active access and refresh tokens for that authorization. The associated client application should prompt the user to re-authorize
- **PKCE verification** — for `authorization_code` grants, `code_verifier` is mandatory and verified using S256. Requests without a valid `code_verifier` are rejected even if the code itself is valid
- Authorization codes are **single-use**. Presenting a code a second time returns `invalid_grant` and may trigger additional security measures

## Related Endpoints

- [Authorization endpoint](/api-reference/oauth2/authorize)
- [Revoke token](/api-reference/oauth2/revoke-token)
- [OAuth2 Provider overview](/api-reference/oauth2/overview)
