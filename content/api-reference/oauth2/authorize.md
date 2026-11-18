---
title: Authorization endpoint
description: Fetch consent screen data and process user approval or denial of an OAuth2 authorization request.
---

# Authorization endpoint

The authorization endpoint handles the interactive consent step of the OAuth2 Authorization Code flow. It exposes two methods on the same path: a `GET` to retrieve the client details needed to render the consent screen, and a `POST` to submit the user's decision.

Both methods require an authenticated browser session (JWT). If the user is not authenticated, they must log in first before being redirected here.

---

## GET — Fetch consent screen data

Returns the OAuth2 client's display information and the requested scopes so that your frontend can render a consent screen for the user.

```http
GET /api/v1/oauth2/authorize
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `response_type` | string | Yes | Must be `code` |
| `client_id` | string | Yes | The client's public identifier, prefixed with `storno_cid_` |
| `redirect_uri` | string | Yes | The URI to redirect to after authorization. Must exactly match one of the client's registered redirect URIs |
| `scope` | string | No | Space-separated list of requested permission scopes. Defaults to all scopes registered for the client. Scopes the client is not registered for return 400 `invalid_scope` |

The `state` and PKCE parameters are not read by this request. Send them on the `POST`.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer JWT from an active browser session |

### Response

Returns `200 OK` with the client's display information and the list of requested scopes under `data`.

| Field | Type | Description |
|-------|------|-------------|
| `data.client.name` | string | Display name of the OAuth2 application |
| `data.client.description` | string \| null | Description of the application |
| `data.client.logoUrl` | string \| null | Logo URL of the application, or `null` if not set |
| `data.client.websiteUrl` | string \| null | Website URL of the application, or `null` if not set |
| `data.requestedScopes` | string[] | Scope values the application is requesting |

### Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/oauth2/authorize?response_type=code&client_id=storno_cid_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6&redirect_uri=https%3A%2F%2Facme-accounting.com%2Foauth%2Fcallback&scope=invoice.view%20client.view' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Example Response

```json
{
  "data": {
    "client": {
      "name": "Acme Accounting Integration",
      "description": "Syncs invoices from Storno to Acme Accounting in real time.",
      "logoUrl": "https://acme-accounting.com/logo.png",
      "websiteUrl": "https://acme-accounting.com"
    },
    "requestedScopes": ["invoice.view", "client.view"]
  }
}
```

### Errors

Errors return `{"error": "<code>", "error_description": "..."}` with these values.

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | unsupported_response_type | `response_type` is not `code` |
| 400 | invalid_request | `client_id` is missing |
| 400 | invalid_client | No active OAuth2 application for the `client_id` |
| 400 | invalid_redirect_uri | `redirect_uri` is missing or not registered for the client |
| 400 | invalid_scope | A requested scope is not registered for the client |
| 401 | | The user is not authenticated |

---

## POST — Submit user decision

Processes the user's approval or denial of the authorization request. Returns a redirect URI that your frontend should redirect the user to.

```http
POST /api/v1/oauth2/authorize
```

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer JWT from an active browser session |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client_id` | string | Yes | The client's public identifier, prefixed with `storno_cid_` |
| `redirect_uri` | string | Yes | Must exactly match one of the client's registered redirect URIs and the value used in the `GET` request |
| `scope` | string | No | Space-separated list of scopes being authorized. Defaults to all scopes registered for the client. Scopes the client is not registered for are dropped |
| `state` | string | No | Opaque value from your application, returned unchanged in the redirect when sent |
| `code_challenge` | string | Public clients | The PKCE code challenge: `BASE64URL(SHA-256(ASCII(code_verifier)))`. Required for `public` clients |
| `code_challenge_method` | string | With `code_challenge` | Must be `S256` |
| `approved` | boolean | Yes | `true` if the user approved the request. When missing or `false`, the request counts as denied |
| `verification_token` | string | When the account has MFA | Step-up MFA verification token, checked on approval only. Without it the response is 403 `mfa_required` |

### Response

Returns `200 OK` with a `redirect_uri` string that your application must use to redirect the browser.

**On approval:**

```json
{
  "redirect_uri": "https://acme-accounting.com/oauth/callback?code=<auth_code>&state=abc123"
}
```

**On denial:**

```json
{
  "redirect_uri": "https://acme-accounting.com/oauth/callback?error=access_denied&state=abc123"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `redirect_uri` | string | The URI to redirect the user to. Contains either a `code` and `state` on approval, or an `error` and `state` on denial |

### Example Request (Approved)

```bash
curl -X POST 'https://api.storno.ro/api/v1/oauth2/authorize' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "client_id": "storno_cid_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "redirect_uri": "https://acme-accounting.com/oauth/callback",
    "scope": "invoice.view client.view",
    "state": "abc123",
    "code_challenge": "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    "code_challenge_method": "S256",
    "approved": true
  }'
```

### Example Response (Approved)

```json
{
  "redirect_uri": "https://acme-accounting.com/oauth/callback?code=4%2F0AfJohXlQs8kKpM7nNrZhQ2vWxyz&state=abc123"
}
```

### Example Request (Denied)

```bash
curl -X POST 'https://api.storno.ro/api/v1/oauth2/authorize' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "client_id": "storno_cid_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "redirect_uri": "https://acme-accounting.com/oauth/callback",
    "scope": "invoice.view client.view",
    "state": "abc123",
    "code_challenge": "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    "code_challenge_method": "S256",
    "approved": false
  }'
```

### Example Response (Denied)

```json
{
  "redirect_uri": "https://acme-accounting.com/oauth/callback?error=access_denied&state=abc123"
}
```

### Errors

Errors return `{"error": "<code>", "error_description": "..."}`.

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | invalid_request | `client_id` is missing, a public client sent no `code_challenge`, or `code_challenge_method` is not `S256` |
| 400 | invalid_client | No active OAuth2 application for the `client_id` |
| 400 | invalid_redirect_uri | `redirect_uri` is missing or not registered for the client |
| 401 | | The user is not authenticated |
| 403 | mfa_required | The user has MFA enabled and `verification_token` is missing or invalid |

---

## Important Notes

- The `state` parameter must be validated by your application when handling the redirect — compare the value in the redirect query string against the value you generated before initiating the flow to prevent CSRF attacks
- Authorization codes are single-use and expire after **10 minutes**. Exchange the code for tokens using the [Token endpoint](/api-reference/oauth2/token) promptly
- The user may grant a narrower set of scopes than what was requested. The authorization code and resulting access token will reflect only the scopes the user approved
- `code_challenge_method=S256` is the only supported method. `plain` is not accepted
- Confidential clients may omit the code challenge. When a challenge was stored with the code, the token request must send the matching `code_verifier`

## Related Endpoints

- [Token endpoint](/api-reference/oauth2/token)
- [Revoke token](/api-reference/oauth2/revoke-token)
- [OAuth2 Provider overview](/api-reference/oauth2/overview)
