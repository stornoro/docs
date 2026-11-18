---
title: ANAF Tokens
description: Manage ANAF OAuth tokens for e-Factura integration
---

# ANAF Tokens

Manage ANAF OAuth tokens that enable e-Factura synchronization for your companies.

---

## List ANAF Tokens

```http
GET /api/v1/anaf/tokens
```

Retrieve all ANAF tokens associated with the authenticated user.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

```json
{
  "data": [
    {
      "id": "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b",
      "label": null,
      "expiresAt": "2027-02-16T10:30:00+00:00",
      "isExpired": false,
      "lastUsedAt": "2026-11-18T09:00:00+00:00",
      "createdAt": "2026-11-18T08:00:00+00:00",
      "validatedCifs": [12345678],
      "exclusive": false
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Token UUID |
| label | string\|null | Name given to the token |
| expiresAt | string | When the access token expires. Storno refreshes it on its own while ANAF accepts the refresh |
| isExpired | boolean | Whether the token is past its expiry |
| lastUsedAt | string\|null | Last time the token was used for an ANAF call |
| validatedCifs | integer[] | CIFs the token was used or validated for. For a shared token this is a cache, not a statement of rights at ANAF |
| exclusive | boolean | `true` when the token is bound to one company by an [exclusive link](/api-reference/anaf/token-links#shared-and-exclusive-tokens) |

---

## Save New ANAF Token

```http
POST /api/v1/anaf/tokens
```

Save a new ANAF OAuth access token. The JWT expiry is extracted, and the token is validated with ANAF when a company is known.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| Content-Type | string | Yes | Must be `application/json` |

### Request Body

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | The ANAF OAuth access token (JWT format), at least 10 characters |
| label | string | No | Name for the token |
| companyId | string | No | Company UUID. The token is checked against its CIF. Without it, the `X-Company` header or the only company of the organization is used when there is one. With no company, the token is saved without a check |
| expiresInDays | integer | No | Expiry in days (1 to 365, default 90), used only when the token is not a JWT with an `exp` claim |

### Response

Returns `201 Created`.

```json
{
  "status": "ok",
  "message": "Token validat si salvat cu succes.",
  "data": {
    "id": "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b",
    "label": null,
    "expiresAt": "2027-02-16T10:30:00+00:00",
    "isExpired": false,
    "lastUsedAt": null,
    "createdAt": "2026-11-18T08:00:00+00:00",
    "validatedCifs": [12345678],
    "exclusive": false
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | `token` is missing or shorter than 10 characters |
| 401 | Unauthorized - invalid authentication |
| 403 | The company does not belong to your organization |
| 422 | ANAF refused the token for the company CIF, or the check could not be completed |
| 429 | ANAF rate limit reached. `retryAfter` carries the seconds to wait, also sent as the `Retry-After` header |

---

## Delete ANAF Token

```http
DELETE /api/v1/anaf/tokens/{id}
```

Delete an ANAF token of the authenticated user.

- A shared token stops serving every company that relied on it. If the organization has another valid shared token, that one takes over.
- An exclusive token revokes ANAF access for the one company it is bound to. Nothing else is affected, and the company has no ANAF access until a new exclusive link is authorized for it.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The token UUID |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

```json
{ "status": "ok", "message": "Token sters cu succes." }
```

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 404 | Token not found, or it belongs to another user |
