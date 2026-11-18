---
title: ANAF Connection Status
description: Check ANAF integration status and token validity
---

# ANAF Connection Status

Check the current status of ANAF integration for the authenticated user.

---

## Get ANAF Status

```http
GET /api/v1/anaf/status
```

Retrieve ANAF connection status including token count and expiry information.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

```json
{
  "connected": true,
  "hasToken": true,
  "tokenCount": 2,
  "nearestExpiry": "2026-03-16T10:30:00+00:00",
  "hasExpiredTokens": false
}
```

When the user has no token, the response holds only `connected` (`false`), `hasToken` (`false`) and `tokenCount` (`0`).

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| connected | boolean | Whether at least one token is not expired |
| hasToken | boolean | Whether the user has any token |
| tokenCount | integer | Total number of ANAF tokens saved |
| nearestExpiry | string\|null | Earliest token expiry, ISO 8601 |
| hasExpiredTokens | boolean | Whether at least one token is expired |

To list the tokens themselves, use [ANAF tokens](/api-reference/anaf/tokens).

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
