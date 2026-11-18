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
2. Storno.ro generates a signing secret (shown in full only on creation and on regeneration, so store it securely)
3. When a subscribed event occurs, Storno.ro sends a signed POST request to your URL
4. Your server verifies the signature and processes the payload
5. If delivery fails, Storno.ro tries again, up to 3 attempts in total (see [Retry policy](#retry-policy))

### Requirements

- Webhooks are available on the Professional and Business plans. Other plans receive `402` with `code: "PLAN_LIMIT"` when they create a webhook.
- An organization can register at most 10 endpoints across all its companies. The next one returns `409` with `code: "WEBHOOK_LIMIT"`.
- The URL must be a public HTTPS URL on port 443, without credentials. HTTP, other ports and hosts that resolve to private addresses are rejected with `400`. The address is checked again before every delivery.
- `events` must list exact event names. The wildcard `["*"]` is not accepted.
- Redirects are not followed. A `3xx` answer counts as a failed attempt.

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
| `id` | string | Unique ID of the event (UUID v7). It differs from the delivery ID in `X-Webhook-Id` |
| `event` | string | Event type that triggered the webhook |
| `created_at` | string | ISO 8601 timestamp of when the event was created |
| `data` | object | Event-specific payload (see [Event types](#event-types)) |

### HTTP headers

Each delivery includes these headers:

| Header | Description |
|--------|-------------|
| `Content-Type` | `application/json` |
| `X-Webhook-Signature` | Lowercase hexadecimal HMAC-SHA256 of the raw request body, computed with your endpoint secret. No prefix |
| `X-Webhook-Event` | Event type name (for example `invoice.validated`) |
| `X-Webhook-Id` | Delivery ID. The same ID is returned by the delivery endpoints and stays the same across retries |
| `User-Agent` | `Storno-Webhook/1.0` |

### Verifying signatures

Always verify the `X-Webhook-Signature` header to ensure the request came from Storno.ro. Compute the HMAC-SHA256 of the raw request body, before any JSON parsing, using your signing secret, and compare the hexadecimal digest:

{% code-snippet-group %}

{% code-snippet title="Node.js" %}
```javascript
const crypto = require('crypto');

function verifyWebhook(rawBody, signatureHeader, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
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

If your endpoint returns a non-2xx status code, does not answer within 10 seconds or the connection fails, Storno.ro retries the same delivery:

| Attempt | Delay | Total elapsed |
|---------|-------|---------------|
| 1 | Immediate | 0 |
| 2 | 1 minute | 1 min |
| 3 | 5 minutes | 6 min |

A delivery makes at most 3 attempts. After the third failed attempt it is marked `failed` and no further retries happen. A URL that no longer passes the URL rules fails at once, without retries. You can monitor delivery status and errors through the [delivery log endpoints](/api-reference/webhooks/list-deliveries).

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

## Event types

The registry accepts 16 event types in 5 categories. Retrieve the list from the API with [`GET /api/v1/webhooks/events`](/api-reference/webhooks/list-events). The `webhook.test` event is sent only by the test endpoint and cannot be subscribed to.

`invoice.updated` is accepted on subscription but Storno.ro never sends it as a webhook.

### Invoice events

| Event | Description | `data` fields |
|-------|-------------|---------------|
| `invoice.created` | An invoice was created | `id`, `number`, `status`, `direction`, `total`, `currency` |
| `invoice.issued` | An invoice was issued | `id`, `number`, `status`, `direction`, `total`, `currency` |
| `invoice.validated` | The provider validated an outgoing invoice | `id`, `number`, `status`, `direction`, `total`, `currency` |
| `invoice.rejected` | The provider rejected an outgoing invoice | `id`, `number`, `status`, `direction`, `total`, `currency` |
| `invoice.sent_to_provider` | An invoice was submitted to the e-invoice provider | `id`, `number`, `status`, `direction`, `total`, `currency` |
| `invoice.updated` | Accepted on subscription, never sent | none |

### Company events

| Event | Description | `data` fields |
|-------|-------------|---------------|
| `company.created` | A company was added to the organization | `companyId`, `companyName` |
| `company.updated` | Company data changed | `companyId`, `companyName` |
| `company.removed` | A company was deleted | `companyId`, `companyName` |
| `company.restored` | A company was restored | `companyId`, `companyName` |
| `company.reset` | Company data was reset | `companyId`, `companyName` |

### Sync events

| Event | Description | `data` fields |
|-------|-------------|---------------|
| `sync.started` | An ANAF sync run started | `total` |
| `sync.completed` | An ANAF sync run finished | `stats` (`newInvoices`, `skippedDuplicates`, `newClients`, `newProducts`, `newSeries`, `expired`, `errors`) |
| `sync.error` | An ANAF sync run reported errors | `errors`, `companyId` |

### Payment events

| Event | Description | `data` fields |
|-------|-------------|---------------|
| `payment.received` | A payment was recorded on an invoice | `paymentId`, `invoiceId`, `amount`, `paymentMethod`, `currency` |

Some payments recorded automatically from Stripe also carry `invoice_number` and `companyId`.

### ANAF events

| Event | Description | `data` fields |
|-------|-------------|---------------|
| `anaf.token_created` | An ANAF token was saved | `tokenId`, `companyId` |

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
The signing `secret` is returned in full only on creation and on [regenerate-secret](/api-reference/webhooks/regenerate-secret). Store it securely. Later reads return a masked value.
{% /callout %}

### Testing a webhook

Send a test delivery to verify your endpoint is reachable:

```bash
curl -X POST https://api.storno.ro/api/v1/webhooks/{uuid}/test \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

The test sends a `webhook.test` event synchronously and returns the HTTP result immediately. It is limited to 10 test and retry calls per 10 minutes per user.

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

Each delivery record includes the event type, status, HTTP status code, response time, attempt number, error message and timestamps. Use the [delivery detail endpoint](/api-reference/webhooks/get-delivery) to inspect the full request payload and response body.

### Permissions

| Permission | Roles | Actions |
|------------|-------|---------|
| `webhook.view` | Admin, Accountant | List endpoints, view details, view delivery log |
| `webhook.manage` | Admin | Create, update, delete, test, retry a delivery, regenerate secret |

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
| `POST` | [`/api/v1/webhooks/{uuid}/deliveries/{id}/retry`](/api-reference/webhooks/get-delivery#retry-a-delivery) | Send a past delivery again |

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
    "channel": "notifications:user_{user_id}"
  }'
```

### Channels and events

A client can subscribe to `notifications:user_{user_id}` for its own user, and to `{namespace}:company_{company_uuid}` for a company it can access. The namespaces are `invoices`, `notifications`, `dashboard`, `user`, `import` and `backup`. Any other channel is refused with `403`. See [Centrifugo subscription token](/api-reference/centrifugo/subscription-token).

| Channel | Messages |
|---------|----------|
| `invoices:company_{uuid}` | `invoice.created`, `invoice.updated`, `invoice.issued`, `invoice.submitted`, `invoice.cancelled`, `invoice.restored`, and the sync events `sync.started`, `sync.progress`, `sync.completed`, `sync.skipped`, `sync.error` |
| `notifications:user_{id}` | New in-app notifications, and `company.created`, `company.updated`, `company.removed`, `company.restored`, `company.reset` |
| `import:company_{uuid}`, `backup:company_{uuid}` | Import and backup progress |

Realtime access needs a plan with realtime notifications. Other plans receive `402` with `code: "PLAN_LIMIT"` from the token endpoints.

---

## Notifications

Storno.ro sends user-facing notifications through multiple channels.

### Channels

| Channel | Description |
|---------|-------------|
| `in_app` | In-app notifications (visible in notification panel) |
| `email` | Email notifications |
| `push` | Push notifications (iOS, Android, Web) |
| `telegram`, `whatsapp`, `sms` | Optional external channels. SMS and WhatsApp need a phone number and a paid plan |

### Notification types

The `type` of a notification is a dotted event name, such as `invoice.validated`, `invoice.rejected`, `invoice.overdue`, `payment.received`, `token.expiring_soon` or `sync.error`. The preference list in [Get notification preferences](/api-reference/notification-preferences/get) shows the event types users can configure.

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
    "preferences": [
      { "eventType": "invoice.validated", "emailEnabled": true, "inAppEnabled": true, "pushEnabled": false },
      { "eventType": "invoice.rejected", "emailEnabled": true, "pushEnabled": true }
    ]
  }'
```

### Push notifications

To receive push notifications, register a device token:

```bash
curl -X POST https://api.storno.ro/api/v1/devices \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "fcm-device-token-0123456789abcdef",
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
