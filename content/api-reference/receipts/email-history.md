---
title: Get Email History
description: Get email sending history for a receipt
method: GET
endpoint: /api/v1/receipts/{uuid}/emails
---

# Get Email History

Returns the complete history of emails sent for a specific receipt, ordered by sent date (newest first).

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Company UUID. Not used to find the receipt; access is checked against your organization |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the receipt |

## Request

```bash {% title="cURL" %}
curl https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/emails \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/emails', {
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

Returns an array of email log entries, newest first:

```json
[
  {
    "id": "8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
    "category": "receipt",
    "toEmail": "office@acme.example",
    "ccEmails": ["accounting@acme.example"],
    "bccEmails": null,
    "subject": "Bon fiscal BON0042",
    "sentAt": "2026-02-18T10:30:00+00:00",
    "status": "delivered",
    "templateUsed": null,
    "errorMessage": null,
    "sesMessageId": "0100018f-example",
    "fromEmail": "noreply@example.test",
    "fromName": "Your Company SRL",
    "sentByEmail": "john@yourcompany.example",
    "invoiceId": null,
    "invoiceNumber": null,
    "deliveryNoteId": null,
    "deliveryNoteNumber": null
  },
  {
    "id": "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
    "category": "receipt",
    "toEmail": "old@acme.example",
    "ccEmails": null,
    "bccEmails": null,
    "subject": "Bon fiscal BON0042",
    "sentAt": "2026-02-18T10:16:00+00:00",
    "status": "bounced",
    "templateUsed": null,
    "errorMessage": null,
    "sesMessageId": "0100018f-example2",
    "fromEmail": "noreply@example.test",
    "fromName": "Your Company SRL",
    "sentByEmail": "john@yourcompany.example",
    "invoiceId": null,
    "invoiceNumber": null,
    "deliveryNoteId": null,
    "deliveryNoteNumber": null
  }
]
```

### Email Record Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Email log UUID |
| `category` | string | `receipt` |
| `toEmail` | string | Primary recipient email address |
| `ccEmails` | string[]\|null | CC recipients |
| `bccEmails` | string[]\|null | BCC recipients |
| `subject` | string | Email subject line |
| `sentAt` | string | ISO 8601 timestamp when email was sent |
| `status` | string | Delivery status (see values below) |
| `templateUsed` | string\|null | Template name, when one was used |
| `errorMessage` | string\|null | Failure message, for `failed` |
| `sesMessageId` | string\|null | Provider message id |
| `fromEmail` | string\|null | Sender address |
| `fromName` | string\|null | Sender display name |
| `sentByEmail` | string\|null | Email of the user who sent it |
| `invoiceId`, `invoiceNumber`, `deliveryNoteId`, `deliveryNoteNumber` | string\|null | Always `null` for a receipt email |
| `events` | array | Tracking events recorded for the email. Entries carry no fields at the moment |

### Delivery Status Values

| Status | Description |
|--------|-------------|
| `sent` | Sent to the mail provider |
| `delivered` | Delivered to recipient's inbox |
| `bounced` | Email bounced (hard or soft) |
| `failed` | Email sending failed |

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Receipt not found or not in your organization |

Error responses have the form `{"error": "message"}`.

## Related Endpoints

- [Send email](/api-reference/receipts/email) - Send a new email
- [Get email defaults](/api-reference/receipts/email-defaults) - Get pre-filled email content
