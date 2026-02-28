---
title: Webhooks & Events
description: Outbound HTTP webhooks, real-time WebSocket events, and in-app notification system.
---

# Webhooks & Events

Storno.ro delivers real-time updates through three complementary channels: **outbound HTTP webhooks** for server-to-server integrations, **WebSocket connections** (Centrifugo) for live UI updates, and **in-app notifications** for user-facing alerts.

---

## Outbound Webhooks

Outbound webhooks send HTTP POST requests to your server whenever business events occur. Use them to integrate Storno.ro with ERPs, accounting tools, Slack, or any system that accepts HTTP callbacks.

### How it works

1. You [create a webhook endpoint](/api-reference/webhooks/create-webhook) with a destination URL and the events you want to receive
2. Storno.ro generates an HMAC-SHA256 signing secret (shown only once — store it securely)
3. When a subscribed event occurs, Storno.ro sends a signed POST request to your URL
4. Your server verifies the signature and processes the payload
5. If delivery fails, Storno.ro retries up to 3 times with exponential backoff

### Webhook payload format

Every webhook delivery sends a JSON payload with this structure:

```json
{
  "id": "0192b3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
  "event": "invoice.validated",
  "created_at": "2026-02-19T10:30:00+00:00",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "number": "UEP2026000002",
    "status": "validated",
    "direction": "outgoing",
    "total": "30940.00",
    "currency": "RON"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique delivery ID (UUID v7) |
| `event` | string | Event type that triggered the webhook |
| `created_at` | string | ISO 8601 timestamp of when the event occurred |
| `data` | object | Event-specific payload (varies by event type) |

### HTTP headers

Each delivery includes these headers:

| Header | Description |
|--------|-------------|
| `Content-Type` | `application/json` |
| `X-Webhook-Signature` | HMAC-SHA256 hex digest of the raw body, signed with your secret |
| `X-Webhook-Event` | Event type name (e.g., `invoice.validated`) |
| `X-Webhook-Id` | Unique delivery ID (same as payload `id`) |
| `User-Agent` | `Storno-Webhook/1.0` |

### Verifying signatures

Always verify the `X-Webhook-Signature` header to ensure the request came from Storno.ro. Compute the HMAC-SHA256 of the raw request body using your signing secret and compare:

{% code-snippet-group %}

{% code-snippet title="Node.js" %}
```javascript
const crypto = require('crypto');

function verifyWebhook(rawBody, signatureHeader, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signatureHeader)
  );
}

// Express middleware example
app.post('/webhooks/storno', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = verifyWebhook(req.rawBody, signature, process.env.WEBHOOK_SECRET);

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.rawBody);
  console.log(`Received ${event.event}:`, event.data);

  res.status(200).send('OK');
});
```
{% /code-snippet %}

{% code-snippet title="PHP" %}
```php
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
$secret = getenv('WEBHOOK_SECRET');

$expected = hash_hmac('sha256', $payload, $secret);

if (!hash_equals($expected, $signature)) {
    http_response_code(401);
    exit('Invalid signature');
}

$event = json_decode($payload, true);
// Process $event['event'] and $event['data']

http_response_code(200);
```
{% /code-snippet %}

{% code-snippet title="Python" %}
```python
import hmac
import hashlib

def verify_webhook(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```
{% /code-snippet %}

{% /code-snippet-group %}

{% callout type="warning" %}
Always use constant-time comparison (`timingSafeEqual`, `hash_equals`, `hmac.compare_digest`) to prevent timing attacks.
{% /callout %}

### Retry policy

If your endpoint returns a non-2xx status code or the connection fails, Storno.ro retries with exponential backoff:

| Attempt | Delay | Total elapsed |
|---------|-------|---------------|
| 1 | Immediate | 0 |
| 2 | 1 minute | 1 min |
| 3 | 5 minutes | 6 min |

After 3 failed attempts the delivery is marked as `failed` and no further retries are attempted. You can monitor delivery status and errors through the [delivery log endpoints](/api-reference/webhooks/list-deliveries).

**Best practices for your endpoint:**

- Return `200 OK` as quickly as possible — process the payload asynchronously
- Respond within 10 seconds (the request times out after that)
- Handle duplicate deliveries idempotently using the `id` field
- If you return a 2xx status, the delivery is considered successful

### Delivery statuses

| Status | Description |
|--------|-------------|
| `pending` | Delivery queued, not yet attempted |
| `success` | Your endpoint returned a 2xx response |
| `retrying` | Delivery failed, retry scheduled |
| `failed` | All retry attempts exhausted |

---

## Event Types

Storno.ro supports 15 event types organized into 5 categories. Retrieve the full list from the API via [`GET /api/v1/webhooks/events`](/api-reference/webhooks/list-events).

### Invoice events

| Event | Description | Payload fields |
|-------|-------------|----------------|
| `invoice.created` | New invoice created or synced from e-invoice provider | `id`, `number`, `status`, `direction`, `total`, `currency` |
| `invoice.issued` | Invoice issued (draft finalized) | `id`, `number`, `status`, `direction`, `total`, `currency` |
| `invoice.validated` | E-invoice provider validated an outgoing invoice | `id`, `number`, `status`, `direction`, `total`, `currency` |
| `invoice.rejected` | E-invoice provider rejected an outgoing invoice | `id`, `number`, `status`, `direction`, `total`, `currency` |
| `invoice.sent_to_provider` | Invoice submitted to e-invoice provider | `id`, `number`, `status`, `direction`, `total`, `currency` |

### Company events

| Event | Description | Payload fields |
|-------|-------------|----------------|
| `company.created` | New company added to the organization | `id`, `name`, `cif` |
| `company.updated` | Company data modified | `id`, `name`, `cif` |
| `company.removed` | Company soft-deleted | `id`, `name`, `cif` |
| `company.restored` | Company restored from soft-delete | `id`, `name`, `cif` |
| `company.reset` | Company data reset (invoices, clients cleared) | `id`, `name`, `cif` |

### Sync events

| Event | Description | Payload fields |
|-------|-------------|----------------|
| `sync.started` | E-invoice sync process started | `company_id`, `cif` |
| `sync.completed` | E-invoice sync finished successfully | `company_id`, `cif`, `invoices_synced` |
| `sync.error` | E-invoice sync encountered an error | `company_id`, `cif`, `error` |

### Payment events

| Event | Description | Payload fields |
|-------|-------------|----------------|
| `payment.received` | Payment recorded on an invoice | `id`, `invoice_id`, `amount`, `currency`, `payment_method` |

### Provider Authentication Events

| Event | Description | Payload fields |
|-------|-------------|----------------|
| `anaf.token_created` | New ANAF OAuth token obtained | `company_id`, `cif`, `expires_at` |

---

## Webhook Management

### Creating a webhook

```bash
curl -X POST https://api.storno.ro/api/v1/webhooks \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.example.com/webhooks",
    "events": ["invoice.created", "invoice.validated", "payment.received"],
    "description": "ERP integration"
  }'
```

{% callout type="warning" %}
The signing `secret` is returned in full only on creation and on [regenerate-secret](/api-reference/webhooks/regenerate-secret). Store it securely — all subsequent reads return a masked value.
{% /callout %}

### Testing a webhook

Send a test delivery to verify your endpoint is reachable:

```bash
curl -X POST https://api.storno.ro/api/v1/webhooks/{uuid}/test \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

The test sends a `webhook.test` event synchronously and returns the HTTP result immediately:

```json
{
  "success": true,
  "statusCode": 200,
  "durationMs": 145,
  "error": null
}
```

### Viewing delivery history

```bash
curl https://api.storno.ro/api/v1/webhooks/{uuid}/deliveries?page=1&limit=20 \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

Each delivery record includes the event type, HTTP status code, response time, attempt number, and any error message. Use the [delivery detail endpoint](/api-reference/webhooks/get-delivery) to inspect the full request payload and response body.

### Permissions

| Permission | Roles | Actions |
|------------|-------|---------|
| `webhook.view` | Admin, Accountant | List endpoints, view details, view delivery log |
| `webhook.manage` | Admin | Create, update, delete, test, regenerate secret |

### API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | [`/api/v1/webhooks/events`](/api-reference/webhooks/list-events) | List available event types |
| `GET` | [`/api/v1/webhooks`](/api-reference/webhooks/list-webhooks) | List webhook endpoints |
| `POST` | [`/api/v1/webhooks`](/api-reference/webhooks/create-webhook) | Create a webhook endpoint |
| `GET` | [`/api/v1/webhooks/{uuid}`](/api-reference/webhooks/get-webhook) | Get endpoint details |
| `PATCH` | [`/api/v1/webhooks/{uuid}`](/api-reference/webhooks/update-webhook) | Update endpoint |
| `DELETE` | [`/api/v1/webhooks/{uuid}`](/api-reference/webhooks/delete-webhook) | Delete endpoint |
| `POST` | [`/api/v1/webhooks/{uuid}/test`](/api-reference/webhooks/test-webhook) | Send test delivery |
| `POST` | [`/api/v1/webhooks/{uuid}/regenerate-secret`](/api-reference/webhooks/regenerate-secret) | Regenerate signing secret |
| `GET` | [`/api/v1/webhooks/{uuid}/deliveries`](/api-reference/webhooks/list-deliveries) | List delivery history |
| `GET` | [`/api/v1/webhooks/{uuid}/deliveries/{id}`](/api-reference/webhooks/get-delivery) | Get delivery detail |

---

## Real-Time Updates (Centrifugo)

For live UI updates (browser and mobile), Storno.ro uses [Centrifugo](https://centrifugal.dev/) WebSocket connections. This is separate from outbound webhooks and intended for front-end applications.

### Connecting

1. Obtain a connection token:

```bash
curl -X POST https://api.storno.ro/api/v1/centrifugo/connection-token \
  -H "Authorization: Bearer {token}"
```

2. Connect to the Centrifugo WebSocket server with the returned token

3. Subscribe to channels:

```bash
curl -X POST https://api.storno.ro/api/v1/centrifugo/subscription-token \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "user:{user_id}"
  }'
```

### WebSocket event types

Events are published to user-specific and company-specific channels:

| Event | Description |
|-------|-------------|
| `invoice.created` | New invoice created (including synced from e-invoice provider) |
| `invoice.updated` | Invoice status or data changed |
| `invoice.paid` | Payment recorded on invoice |
| `sync.completed` | E-invoice sync finished |
| `sync.error` | E-invoice sync encountered an error |
| `notification.new` | New notification for the user |

---

## Notifications

Storno.ro sends user-facing notifications through multiple channels.

### Channels

| Channel | Description |
|---------|-------------|
| `in_app` | In-app notifications (visible in notification panel) |
| `email` | Email notifications |
| `push` | Push notifications (iOS, Android, Web) |

### Notification types

| Type | Description |
|------|-------------|
| `invoice.validated` | E-invoice provider validated an outgoing invoice |
| `invoice.rejected` | E-invoice provider rejected an outgoing invoice |
| `invoice.overdue` | Invoice past its due date |
| `payment.received` | Payment recorded on an invoice |
| `invoice.issued` | Invoice issued |
| `invoice.paid` | Invoice fully paid |

### Managing preferences

Users can control which notifications they receive on which channels:

```bash
# Get current preferences
curl https://api.storno.ro/api/v1/notification-preferences \
  -H "Authorization: Bearer {token}"

# Update preferences
curl -X PUT https://api.storno.ro/api/v1/notification-preferences \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "invoiceValidated": { "email": true, "inApp": true, "push": false },
      "invoiceRejected": { "email": true, "inApp": true, "push": true },
      "paymentReceived": { "email": true, "inApp": true, "push": false }
    }
  }'
```

### Push notifications

To receive push notifications, register a device token:

```bash
curl -X POST https://api.storno.ro/api/v1/devices \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "firebase_device_token_here",
    "platform": "android"
  }'
```

Supported platforms: `ios`, `android`, `web`.

---

## Invoice Events (Audit Log)

Each invoice maintains a history of status changes and significant events:

```bash
curl https://api.storno.ro/api/v1/invoices/{uuid}/events \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

```json
[
  {
    "type": "status_change",
    "status": "issued",
    "timestamp": "2026-02-15T10:30:00Z",
    "details": "Invoice issued by user@example.com"
  },
  {
    "type": "status_change",
    "status": "sent_to_provider",
    "timestamp": "2026-02-15T10:31:00Z",
    "details": "Submitted to ANAF (upload ID: 12345)"
  },
  {
    "type": "status_change",
    "status": "validated",
    "timestamp": "2026-02-15T11:00:00Z",
    "details": "Validated by ANAF"
  }
]
```
