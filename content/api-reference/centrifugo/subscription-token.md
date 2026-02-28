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

Generate a JWT token for subscribing to a specific Centrifugo channel.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| Content-Type | string | Yes | Must be `application/json` |

### Request Body

```json
{
  "channel": "user:123e4567-e89b-12d3-a456-426614174000"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| channel | string | Yes | Channel name to subscribe to |

### Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| token | string | JWT token for channel subscription |

### Channel Types

| Channel Pattern | Description | Access |
|----------------|-------------|--------|
| `user:{uuid}` | User personal channel | Own user only |
| `company:{uuid}` | Company channel | Members with company access |
| `organization:{uuid}` | Organization channel | Organization members |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - no access to requested channel |
| 422 | Validation error - invalid channel name |

### Usage

Use this token to subscribe to channels:

```javascript
// After connecting to Centrifugo
const { token } = await $fetch('/api/v1/centrifugo/subscription-token', {
  method: 'POST',
  headers: { Authorization: `Bearer ${authToken}` },
  body: { channel: 'user:123e4567-e89b-12d3-a456-426614174000' }
});

const subscription = centrifuge.newSubscription('user:123e4567-e89b-12d3-a456-426614174000', {
  token: token
});

subscription.on('publication', (ctx) => {
  console.log('Received:', ctx.data);
});

subscription.subscribe();
```

### Real-time Events

Events published to channels:

#### User Channel Events
- `notification.created` - New notification
- `sync.completed` - Sync finished
- `invoice.updated` - Invoice status changed

#### Company Channel Events
- `invoice.created` - New invoice
- `invoice.updated` - Invoice updated
- `member.joined` - New member added

#### Organization Channel Events
- `member.invited` - New invitation sent
- `company.added` - New company added
- `settings.changed` - Settings updated

### Notes

- Subscription tokens expire after 1 hour
- Request new tokens before expiration
- Users can only subscribe to channels they have access to
- Access control is enforced by the backend
- Each channel requires a separate subscription token
