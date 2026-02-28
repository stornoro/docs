---
title: Get email history
description: Retrieve the history of emails sent for an invoice
---

# Get email history

Retrieves the complete history of emails sent for a specific invoice, including delivery status, timestamps, and recipients.

```
GET /api/v1/invoices/{uuid}/emails
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/emails \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/emails', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const emailHistory = await response.json();

// Display email history
emailHistory.forEach(email => {
  console.log(`Sent to ${email.to} on ${email.sentAt}: ${email.deliveryStatus}`);
});
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns an array of email records, ordered by sent date (newest first).

```json
[
  {
    "id": "9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",
    "to": "billing@acme.ro",
    "cc": "accounting@acme.ro",
    "bcc": null,
    "subject": "Factura FAC-2024-001 de la Your Company SRL",
    "attachments": ["FAC-2024-001.pdf"],
    "sentAt": "2024-02-15T09:05:00Z",
    "deliveryStatus": "delivered",
    "openedAt": "2024-02-15T10:30:00Z",
    "clickedAt": "2024-02-15T10:31:00Z",
    "bouncedAt": null,
    "bounceReason": null,
    "sentBy": {
      "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "name": "John Doe",
      "email": "john@yourcompany.ro"
    },
    "metadata": {
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1"
    }
  },
  {
    "id": "8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
    "to": "billing@acme.ro",
    "cc": null,
    "bcc": null,
    "subject": "Reminder: Factura FAC-2024-001",
    "attachments": ["FAC-2024-001.pdf"],
    "sentAt": "2024-02-20T08:00:00Z",
    "deliveryStatus": "sent",
    "openedAt": null,
    "clickedAt": null,
    "bouncedAt": null,
    "bounceReason": null,
    "sentBy": {
      "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "name": "System",
      "email": null
    },
    "metadata": {
      "automatic": true,
      "reminderType": "payment_reminder"
    }
  },
  {
    "id": "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
    "to": "old-email@acme.ro",
    "cc": null,
    "bcc": null,
    "subject": "Factura FAC-2024-001",
    "attachments": ["FAC-2024-001.pdf"],
    "sentAt": "2024-02-14T15:00:00Z",
    "deliveryStatus": "bounced",
    "openedAt": null,
    "clickedAt": null,
    "bouncedAt": "2024-02-14T15:01:00Z",
    "bounceReason": "Mailbox does not exist",
    "sentBy": {
      "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "name": "John Doe",
      "email": "john@yourcompany.ro"
    },
    "metadata": null
  }
]
```

## Email record fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Email record UUID |
| `to` | string | Primary recipient email address |
| `cc` | string\|null | CC recipients (comma-separated) |
| `bcc` | string\|null | BCC recipients (comma-separated) |
| `subject` | string | Email subject line |
| `attachments` | array | List of attached file names |
| `sentAt` | string | When email was sent (ISO 8601) |
| `deliveryStatus` | string | Current delivery status |
| `openedAt` | string\|null | When email was first opened |
| `clickedAt` | string\|null | When a link was first clicked |
| `bouncedAt` | string\|null | When email bounced |
| `bounceReason` | string\|null | Reason for bounce |
| `sentBy` | object | User who sent the email |
| `metadata` | object\|null | Additional tracking data |

## Delivery status values

| Status | Description |
|--------|-------------|
| `queued` | Email is queued for sending |
| `sent` | Email sent to recipient's mail server |
| `delivered` | Email delivered to recipient's inbox |
| `opened` | Email was opened by recipient |
| `clicked` | Recipient clicked a link in the email |
| `bounced` | Email bounced (hard or soft bounce) |
| `failed` | Email sending failed |
| `spam` | Email marked as spam by recipient |

## Bounce reasons

Common bounce reasons include:

- `Mailbox does not exist` - Invalid email address
- `Mailbox full` - Recipient's mailbox is full
- `Domain not found` - Invalid domain
- `Rejected by recipient` - Recipient server rejected
- `Spam filter` - Blocked by spam filter
- `Temporary failure` - Temporary delivery issue

## Email tracking

Email tracking provides insights into recipient engagement:

### Open tracking
- Enabled by default for all emails
- Tracked via invisible pixel
- Records first open timestamp
- Multiple opens are recorded in metadata

### Click tracking
- Tracks links clicked in email body
- Rewrites URLs through tracking proxy
- Records first click timestamp
- Individual link clicks in metadata

### Disable tracking
```javascript
// Disable tracking when sending
await fetch('/api/v1/invoices/{uuid}/email', {
  method: 'POST',
  body: JSON.stringify({
    to: 'billing@acme.ro',
    subject: 'Invoice',
    body: 'Message',
    tracking: false  // Disable open/click tracking
  })
});
```

## Use cases

- **Audit trail** - Verify when invoices were sent to clients
- **Delivery confirmation** - Check if client received the invoice
- **Engagement tracking** - See if client opened the email
- **Resend logic** - Resend if previous attempt bounced
- **Client support** - Help clients who claim they didn't receive invoice
- **Analytics** - Analyze email performance and delivery rates

## Filter by delivery status (future)

While not currently supported, future versions may support filtering:

```
GET /api/v1/invoices/{uuid}/emails?status=bounced
GET /api/v1/invoices/{uuid}/emails?from=2024-01-01&to=2024-12-31
```

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Invoice not found |

## Related endpoints

- [Send email](/api-reference/invoices/email) - Send a new email
- [Email defaults](/api-reference/invoices/email-defaults) - Get email template
- [Invoice events](/api-reference/invoices/events) - View all invoice events
