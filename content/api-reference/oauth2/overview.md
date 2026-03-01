---
title: OAuth2 Provider
description: Use Storno as an OAuth2 authorization server to build third-party integrations that act on behalf of users.
---

# OAuth2 Provider

Storno implements the OAuth2 Authorization Code flow with mandatory PKCE (Proof Key for Code Exchange) support. Third-party applications can request delegated access to a user's Storno account with explicit user consent, without ever handling the user's password.

## When to use OAuth2 vs API tokens

| Scenario | Recommended approach |
|----------|----------------------|
| You are building an integration used by many different Storno users | OAuth2 |
| You are scripting against your own account | API token |
| You need the user to explicitly approve a set of permissions | OAuth2 |
| You need long-lived programmatic access with no user interaction | API token |

## Authorization Code + PKCE flow

```
1. Your app generates a code_verifier and code_challenge (S256)
2. Your app redirects the user to Storno's authorization page
3. The user reviews the requested scopes and approves or denies
4. Storno redirects back to your redirect_uri with an authorization code
5. Your app exchanges the code for an access token and refresh token
6. Your app calls Storno API endpoints using the access token as a Bearer token
7. When the access token expires, your app exchanges the refresh token for a new pair
```

### Step-by-step

**1. Generate PKCE parameters**

Generate a cryptographically random `code_verifier` (43–128 URL-safe characters) and compute the `code_challenge`:

```
code_challenge = BASE64URL(SHA-256(ASCII(code_verifier)))
```

**2. Redirect the user to the consent screen**

```
GET https://app.storno.ro/oauth2/authorize
  ?response_type=code
  &client_id=storno_cid_a1b2c3d4e5f6...
  &redirect_uri=https://yourapp.com/oauth/callback
  &scope=invoice.view%20client.view
  &state=random_csrf_token
  &code_challenge=<base64url_sha256_of_verifier>
  &code_challenge_method=S256
```

**3. Handle the redirect callback**

On approval, Storno redirects to:

```
https://yourapp.com/oauth/callback?code=<auth_code>&state=<your_state>
```

On denial:

```
https://yourapp.com/oauth/callback?error=access_denied&state=<your_state>
```

**4. Exchange the code for tokens**

```bash
curl -X POST 'https://api.storno.ro/api/v1/oauth2/token' \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "authorization_code",
    "code": "<auth_code>",
    "redirect_uri": "https://yourapp.com/oauth/callback",
    "client_id": "storno_cid_a1b2c3d4e5f6...",
    "client_secret": "storno_cs_...",
    "code_verifier": "<original_verifier>"
  }'
```

**5. Call API endpoints with the access token**

```bash
curl 'https://api.storno.ro/api/v1/invoices' \
  -H 'Authorization: Bearer storno_oat_...'
```

**6. Refresh when the access token expires**

```bash
curl -X POST 'https://api.storno.ro/api/v1/oauth2/token' \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "storno_ort_...",
    "client_id": "storno_cid_a1b2c3d4e5f6...",
    "client_secret": "storno_cs_..."
  }'
```

## Token prefixes

| Token | Prefix | Description |
|-------|--------|-------------|
| Access token | `storno_oat_` | Short-lived token for API calls |
| Refresh token | `storno_ort_` | Long-lived token used to obtain new access tokens |
| Client ID | `storno_cid_` | Public identifier for your OAuth2 application |
| Client secret | `storno_cs_` | Secret credential for confidential clients |

## Token lifetimes

| Token | Lifetime |
|-------|----------|
| Authorization code | 10 minutes |
| Access token | 1 hour |
| Refresh token | 30 days |

## Scopes

OAuth2 scopes reuse the same `Permission` values used by API tokens. A user can only grant scopes that they themselves hold — the consent screen will only show scopes the authorizing user has. For the full scope list see [List available scopes](/api-reference/api-keys/scopes).

Common scopes:

| Scope | Description |
|-------|-------------|
| `invoice.view` | Read invoices |
| `invoice.create` | Create new invoices |
| `invoice.edit` | Edit existing invoices |
| `client.view` | Read clients |
| `client.create` | Create new clients |
| `export.data` | Export data |

## Client types

| Type | Description |
|------|-------------|
| `confidential` | Server-side applications that can securely store a client secret |
| `public` | Client-side or mobile applications that cannot keep a secret (PKCE is the security mechanism) |

## Security model

- **PKCE is mandatory** for all clients. `S256` is the only supported `code_challenge_method`
- Tokens are stored as SHA-256 hashes server-side — the raw value is only transmitted once
- Refresh tokens are rotated on every use. If a revoked refresh token is replayed, the entire token family is immediately revoked
- Authorization codes are single-use and expire after 10 minutes
- The token exchange endpoint (`/api/v1/oauth2/token`) is rate-limited to 20 requests per minute per client

## Related endpoints

- [List OAuth2 clients](/api-reference/oauth2/list-clients)
- [Create OAuth2 client](/api-reference/oauth2/create-client)
- [Get OAuth2 client](/api-reference/oauth2/get-client)
- [Update OAuth2 client](/api-reference/oauth2/update-client)
- [Revoke OAuth2 client](/api-reference/oauth2/revoke-client)
- [Rotate client secret](/api-reference/oauth2/rotate-secret)
- [Authorization endpoint](/api-reference/oauth2/authorize)
- [Token endpoint](/api-reference/oauth2/token)
- [Revoke token](/api-reference/oauth2/revoke-token)
