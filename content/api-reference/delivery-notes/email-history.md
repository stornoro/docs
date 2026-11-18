---
title: Get Email History
description: Get email sending history for a delivery note
method: GET
endpoint: /api/v1/delivery-notes/{uuid}/emails
---

# Get Email History

Returns the complete history of emails sent for a specific delivery note, ordered by sent date (newest first).

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note |

## Request

```bash {% title="cURL" %}
curl https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/emails \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/emails', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const emailHistory = await response.json();

emailHistory.forEach(entry => {
  console.log(`Sent to ${entry.toEmail} on ${entry.sentAt}: ${entry.status}`);
});
```

## Response

Returns an array of email log entries (no wrapper key):

```json
[
  {
    "id": "8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
    "category": "delivery_note",
    "toEmail": "contact@client.ro",
    "ccEmails": ["accounting@client.ro"],
    "bccEmails": null,
    "subject": "Aviz de livrare DN0012",
    "sentAt": "2026-02-18T14:35:00+00:00",
    "status": "delivered",
    "templateUsed": null,
    "errorMessage": null,
    "sesMessageId": "0102018d-example",
    "fromEmail": "noreply@example.com",
    "fromName": "Your Company SRL",
    "events": [],
    "invoiceId": null,
    "invoiceNumber": null,
    "sentByEmail": "john@yourcompany.ro",
    "deliveryNoteId": "950e8400-e29b-41d4-a716-446655440000",
    "deliveryNoteNumber": "DN0012"
  }
]
```

### Email record fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Email log UUID |
| `category` | string | `delivery_note` |
| `toEmail` | string | Primary recipient email address |
| `ccEmails` | string[]\|null | CC recipients |
| `bccEmails` | string[]\|null | BCC recipients |
| `subject` | string | Email subject line |
| `sentAt` | string | ISO 8601 timestamp when email was sent |
| `status` | string | Current delivery status (see values below) |
| `templateUsed` | string\|null | Template used, if any |
| `errorMessage` | string\|null | Error text when `status` is `failed` |
| `sesMessageId` | string\|null | Id of the message at the mail provider |
| `fromEmail`, `fromName` | string\|null | Sender address and display name |
| `events` | array | Delivery events recorded for the message (bounces, opens) |
| `sentByEmail` | string\|null | Email of the user who sent it |
| `deliveryNoteId`, `deliveryNoteNumber` | string\|null | The delivery note the email belongs to |
| `invoiceId`, `invoiceNumber` | string\|null | Always null for delivery note emails |

### Status values

| Status | Description |
|--------|-------------|
| `sent` | Sent to the mail provider |
| `delivered` | Delivered to recipient's inbox |
| `bounced` | Email bounced (hard or soft) |
| `failed` | Email sending failed |

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Delivery note not found or not in the caller's organization |

## Related Endpoints

- [Send email](/api-reference/delivery-notes/email) - Send a new email
- [Get email defaults](/api-reference/delivery-notes/email-defaults) - Get pre-filled email content
