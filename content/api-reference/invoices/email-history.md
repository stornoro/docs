---
title: Get email history
description: Retrieve the history of emails sent for an invoice
---

# Get email history

Retrieves the history of emails sent for a specific invoice, including status, timestamps, recipients and delivery events.

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
  console.log(`Sent to ${email.toEmail} on ${email.sentAt}: ${email.status}`);
});
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns an array of email records, newest first.

```json
[
  {
    "id": "9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",
    "category": "invoice",
    "toEmail": "billing@acme.ro",
    "ccEmails": ["accounting@acme.ro"],
    "bccEmails": null,
    "subject": "Factura FAC-2024-001 de la Your Company SRL",
    "sentAt": "2024-02-15T09:05:00+00:00",
    "status": "delivered",
    "templateUsed": null,
    "errorMessage": null,
    "sesMessageId": "0102018d-example",
    "fromEmail": "no-reply@example.com",
    "fromName": "Your Company SRL",
    "events": [
      {
        "id": "1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e",
        "eventType": "send",
        "bounceType": null,
        "bounceSubType": null,
        "timestamp": "2024-02-15T09:05:00+00:00",
        "recipients": ["billing@acme.ro", "accounting@acme.ro"],
        "userAgent": null,
        "eventDetail": null,
        "linkClicked": null
      },
      {
        "id": "2c3d4e5f-6a7b-4c8d-9e0f-1a2b3c4d5e6f",
        "eventType": "delivery",
        "bounceType": null,
        "bounceSubType": null,
        "timestamp": "2024-02-15T09:05:03+00:00",
        "recipients": ["billing@acme.ro"],
        "userAgent": null,
        "eventDetail": null,
        "linkClicked": null
      }
    ],
    "invoiceId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "invoiceNumber": "FAC-2024-001",
    "sentByEmail": "john@yourcompany.ro",
    "deliveryNoteId": null,
    "deliveryNoteNumber": null
  }
]
```

## Email record fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Email record UUID |
| `category` | string | `invoice` |
| `toEmail` | string | Primary recipient |
| `ccEmails` | array \| null | CC addresses |
| `bccEmails` | array \| null | BCC addresses |
| `subject` | string | Email subject line |
| `sentAt` | string | When the email was sent (ISO 8601) |
| `status` | string | Current status, see below |
| `templateUsed` | string \| null | Name of the template used |
| `errorMessage` | string \| null | Failure reason when `status` is `failed` |
| `sesMessageId` | string \| null | Provider message id (shared sender only) |
| `fromEmail`, `fromName` | string \| null | Sender |
| `events` | array | Delivery events, oldest first |
| `invoiceId`, `invoiceNumber` | string | The invoice |
| `sentByEmail` | string \| null | Email of the user who sent it |
| `deliveryNoteId`, `deliveryNoteNumber` | string \| null | Always `null` for invoice emails |

### Event fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Event UUID |
| `eventType` | string | `send`, `delivery`, `bounce`, `complaint`, `reject`, `open` or `click` |
| `bounceType`, `bounceSubType` | string \| null | Bounce classification |
| `timestamp` | string | ISO 8601 timestamp |
| `recipients` | array \| null | Addresses the event applies to |
| `userAgent` | string \| null | Client user agent for `open` and `click` |
| `eventDetail` | string \| null | Extra detail from the mail provider |
| `linkClicked` | string \| null | Link for `click` events |

## Status values

| Status | Description |
|--------|-------------|
| `sent` | Handed to the mail server |
| `delivered` | Delivered to the recipient's mail server |
| `bounced` | The email bounced |
| `failed` | The send failed |

## Use cases

- **Audit trail** - Verify when invoices were sent to clients
- **Delivery confirmation** - Check if client received the invoice
- **Engagement tracking** - See if client opened the email
- **Resend logic** - Resend if previous attempt bounced
- **Client support** - Help clients who claim they didn't receive invoice
- **Analytics** - Analyze email performance and delivery rates

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No permission to view the invoice |
| `404` | Invoice not found |

## Related endpoints

- [Send email](/api-reference/invoices/email) - Send a new email
- [Email defaults](/api-reference/invoices/email-defaults) - Get email template
- [Invoice events](/api-reference/invoices/events) - View all invoice events
