---
title: Centrifugo Subscription Token
description: Generate JWT token for subscribing to Centrifugo channels
---

# Centrifugo Subscription Token

Generate a JWT token for subscribing to specific Centrifugo channels.

---

## Generate Subscription Token

```http
POST /api/v1/centrifugo/subscription-token
```

Generate a JWT token for subscribing to one Centrifugo channel, or to several channels in one request.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| Content-Type | string | Yes | Must be `application/json` |

### Request Body

Single channel:

```json
{
  "channel": "notifications:user_123e4567-e89b-12d3-a456-426614174000"
}
```

Several channels (batch mode):

```json
{
  "channels": [
    "notifications:user_123e4567-e89b-12d3-a456-426614174000",
    "invoices:company_550e8400-e29b-41d4-a716-446655440000"
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| channel | string | Yes, unless `channels` is sent | Channel name, at most 128 characters |
| channels | array | Yes, unless `channel` is sent | Up to 50 channel names. When present and not empty, it is used instead of `channel` |

### Response

Single channel:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

Batch mode returns one token per channel, keyed by channel name:

```json
{
  "tokens": {
    "notifications:user_123e4567-e89b-12d3-a456-426614174000": "eyJhbGciOiJIUzI1NiIs...",
    "invoices:company_550e8400-e29b-41d4-a716-446655440000": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

If any channel in a batch is refused, the whole request fails with `403`.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| token | string | JWT token for the channel (single mode) |
| tokens | object | Channel name to JWT token (batch mode) |

### Channel Types

| Channel Pattern | Description | Access |
|----------------|-------------|--------|
| `notifications:user_{userId}` | Personal notifications and company changes | Own user id only |
| `{namespace}:company_{companyUuid}` | Company channel | Members with access to the company |

`{namespace}` is one of `invoices`, `notifications`, `dashboard`, `user`, `import` or `backup`. The company UUID must be a company of the caller's organization that the caller can access. Any other channel name is refused with `403`.

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | `channel` is missing, or a batch has more than 50 channels |
| 401 | Unauthorized - invalid authentication |
| 402 | The organization's plan does not include realtime notifications. Body has `code: "PLAN_LIMIT"` |
| 403 | No access to a requested channel |

### Usage

Use this token to subscribe to channels:

```javascript
// After connecting to Centrifugo
const { token } = await $fetch('/api/v1/centrifugo/subscription-token', {
  method: 'POST',
  headers: { Authorization: `Bearer ${authToken}` },
  body: { channel: 'notifications:user_123e4567-e89b-12d3-a456-426614174000' }
});

const subscription = centrifuge.newSubscription('notifications:user_123e4567-e89b-12d3-a456-426614174000', {
  token: token
});

subscription.on('publication', (ctx) => {
  console.log('Received:', ctx.data);
});

subscription.subscribe();
```

### Real-time Events

Each message is a JSON object with a `type`.

#### Channel `invoices:company_{uuid}`

- `invoice.created`, `invoice.updated`, `invoice.issued`, `invoice.submitted`, `invoice.cancelled`, `invoice.restored`: the message carries `invoice` with `id`, `number`, `status`, `direction`, `total` and `currency`
- `sync.started`, `sync.progress`, `sync.completed`, `sync.skipped`, `sync.error`: ANAF sync progress

#### Channel `notifications:user_{userId}`

- New in-app notifications: `id`, `type`, `channel`, `title`, `message`, `data`, `isRead`, `sentAt`
- `company.created`, `company.updated`, `company.removed`, `company.restored`, `company.reset`: the message carries `companyId` and `companyName`

#### Channels `import:company_{uuid}` and `backup:company_{uuid}`

Progress messages of imports and of backup and restore jobs.

### Notes

- Subscription tokens expire after 1 hour
- Request new tokens before expiration
- Users can only subscribe to channels they have access to
- Access control is enforced by the backend
- Each channel needs its own token. Batch mode returns them in one call
