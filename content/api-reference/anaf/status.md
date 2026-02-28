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

Retrieve ANAF connection status including token count and validity information.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

```json
{
  "tokenCount": 2,
  "hasValidToken": true,
  "tokens": [
    {
      "cif": "12345678",
      "expiresAt": "2026-03-16T10:30:00Z",
      "isValid": true
    },
    {
      "cif": "87654321",
      "expiresAt": "2026-01-10T08:00:00Z",
      "isValid": false
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| tokenCount | integer | Total number of ANAF tokens saved |
| hasValidToken | boolean | Whether user has at least one valid token |
| tokens | array | Array of token status objects |
| tokens[].cif | string | Company fiscal code |
| tokens[].expiresAt | string | ISO 8601 expiry timestamp |
| tokens[].isValid | boolean | Whether token is currently valid |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
