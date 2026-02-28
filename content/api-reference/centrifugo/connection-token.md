---
title: Centrifugo Connection Token
description: Generate JWT token for Centrifugo WebSocket connection
---

# Centrifugo Connection Token

Generate a JWT token for establishing a Centrifugo WebSocket connection.

---

## Generate Connection Token

```http
POST /api/v1/centrifugo/connection-token
```

Generate a JWT token for authenticating the WebSocket connection to Centrifugo real-time server.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| token | string | JWT token for Centrifugo connection |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |

### Usage

Use this token to connect to the Centrifugo WebSocket server:

```javascript
import { Centrifuge } from 'centrifuge';

// Get connection token
const { token } = await $fetch('/api/v1/centrifugo/connection-token', {
  method: 'POST',
  headers: { Authorization: `Bearer ${authToken}` }
});

// Connect to Centrifugo
const centrifuge = new Centrifuge('wss://realtime.storno.ro/connection/websocket', {
  token: token
});

centrifuge.connect();
```

### Token Claims

The connection token includes:
- User ID
- Expiration time (typically 1 hour)
- Connection metadata

### Notes

- Connection tokens expire after 1 hour
- Request a new token when the connection expires
- Each user has their own connection token
- Token is used only for initial connection authentication
- Channel subscriptions require separate subscription tokens
