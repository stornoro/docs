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
| `X-Company` | string | Yes | Company UUID to scope the request |

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
  console.log(`Sent to ${entry.to} on ${entry.sentAt}: ${entry.deliveryStatus}`);
});
```

## Response

Returns an array of email log entries:

```json
[
  {
    "id": "8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
    "to": "office@acme.ro",
    "cc": ["accounting@acme.ro"],
    "bcc": null,
    "subject": "Bon fiscal BON-2026-042",
    "attachments": ["bon-BON-2026-042.pdf"],
    "sentAt": "2026-02-18T10:30:00Z",
    "deliveryStatus": "delivered",
    "openedAt": "2026-02-18T10:45:00Z",
    "bouncedAt": null,
    "bounceReason": null,
    "sentBy": {
      "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "name": "John Doe",
      "email": "john@yourcompany.ro"
    }
  },
  {
    "id": "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
    "to": "old@acme.ro",
    "cc": null,
    "bcc": null,
    "subject": "Bon fiscal BON-2026-042",
    "attachments": ["bon-BON-2026-042.pdf"],
    "sentAt": "2026-02-18T10:16:00Z",
    "deliveryStatus": "bounced",
    "openedAt": null,
    "bouncedAt": "2026-02-18T10:17:00Z",
    "bounceReason": "Mailbox does not exist",
    "sentBy": {
      "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "name": "John Doe",
      "email": "john@yourcompany.ro"
    }
  }
]
```

### Email Record Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Email log UUID |
| `to` | string | Primary recipient email address |
| `cc` | string[]\|null | CC recipients |
| `bcc` | string[]\|null | BCC recipients |
| `subject` | string | Email subject line |
| `attachments` | string[] | List of attached file names |
| `sentAt` | string | ISO 8601 timestamp when email was sent |
| `deliveryStatus` | string | Current delivery status (see values below) |
| `openedAt` | string\|null | When the email was first opened |
| `bouncedAt` | string\|null | When the email bounced |
| `bounceReason` | string\|null | Reason for bounce |
| `sentBy` | object | User who triggered the send |

### Delivery Status Values

| Status | Description |
|--------|-------------|
| `queued` | Email is queued for sending |
| `sent` | Sent to recipient's mail server |
| `delivered` | Delivered to recipient's inbox |
| `opened` | Email was opened by recipient |
| `bounced` | Email bounced (hard or soft) |
| `failed` | Email sending failed |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Receipt not found or doesn't belong to the company |

## Related Endpoints

- [Send email](/api-reference/receipts/email) - Send a new email
- [Get email defaults](/api-reference/receipts/email-defaults) - Get pre-filled email content
