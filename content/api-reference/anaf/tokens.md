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

Returns an array of ANAF token objects.

```json
[
  {
    "id": 123,
    "cif": "12345678",
    "expiresAt": "2026-03-16T10:30:00Z",
    "isValid": true,
    "createdAt": "2026-01-15T09:00:00Z"
  }
]
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique token identifier |
| cif | string | Romanian company fiscal code (CIF) |
| expiresAt | string | ISO 8601 timestamp when token expires |
| isValid | boolean | Whether token is currently valid |
| createdAt | string | ISO 8601 timestamp when token was created |

---

## Save New ANAF Token

```http
POST /api/v1/anaf/tokens
```

Save a new ANAF OAuth access token. The token is validated with ANAF and JWT expiry is extracted.

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
| token | string | Yes | The ANAF OAuth access token (JWT format) |

### Response

Returns `201 Created` with the newly created token object.

```json
{
  "id": 124,
  "cif": "12345678",
  "expiresAt": "2026-03-16T10:30:00Z",
  "isValid": true,
  "createdAt": "2026-02-16T12:00:00Z"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Invalid token format or expired token |
| 401 | Unauthorized - invalid authentication |
| 422 | Validation error - token already exists |

---

## Delete ANAF Token

```http
DELETE /api/v1/anaf/tokens/{id}
```

Delete an ANAF token. This will disable e-Factura synchronization for the associated company.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | The token ID to delete |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns `204 No Content` on successful deletion.

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - token belongs to another user |
| 404 | Token not found |
