---
title: Send Receipt Email
description: Send a receipt to a customer via email with PDF attachment
method: POST
endpoint: /api/v1/receipts/{uuid}/email
---

# Send Receipt Email

Sends a receipt to a customer via email with the PDF attached. The subject and body can be customized or left blank to use a default text, or the template named by `templateId`.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Company UUID. Not used to find the receipt; access is checked against your organization |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the receipt to email |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `to` | string | Yes | Recipient email address |
| `subject` | string | No | Email subject (uses a default text if omitted) |
| `body` | string | No | Email body (uses a default text if omitted). Interpreted as Markdown; raw HTML is stripped |
| `cc` | string[] | No | Array of CC email addresses |
| `bcc` | string[] | No | Array of BCC email addresses |
| `templateId` | string | No | UUID of one of the company's email templates. Its subject and body are used when `subject` or `body` is omitted. An unknown id returns 400 |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "office@acme.example",
    "subject": "Bon fiscal BON0042",
    "body": "Buna ziua,\n\nGasiti atasat bonul fiscal BON0042 in valoare de 251.00 RON.\n\nMultumim pentru achizitie!\n\nYour Company SRL",
    "cc": ["accounting@acme.example"]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'office@acme.example',
    subject: 'Bon fiscal BON0042',
    body: 'Buna ziua,\n\nGasiti atasat bonul fiscal BON0042 in valoare de 251.00 RON.\n\nMultumim pentru achizitie!\n\nYour Company SRL',
    cc: ['accounting@acme.example']
  })
});

const data = await response.json();
```

## Response

Returns the email log entry, with status `200`:

```json
{
  "id": "8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
  "category": "receipt",
  "toEmail": "office@acme.example",
  "ccEmails": ["accounting@acme.example"],
  "bccEmails": null,
  "subject": "Bon fiscal BON0042",
  "sentAt": "2026-02-18T10:30:00+00:00",
  "status": "sent",
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
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Email log UUID |
| `category` | string | `receipt` |
| `toEmail` | string | Primary recipient email address |
| `ccEmails` | string[] \| null | CC recipients |
| `bccEmails` | string[] \| null | BCC recipients |
| `subject` | string | Subject line that was sent |
| `sentAt` | string | ISO 8601 timestamp of when the email was sent |
| `status` | string | `sent`, `delivered`, `bounced` or `failed` |
| `templateUsed` | string \| null | Template name, when one was used |
| `errorMessage` | string \| null | Failure message |
| `sesMessageId` | string \| null | Provider message id |
| `fromEmail` | string \| null | Sender address |
| `fromName` | string \| null | Sender display name |
| `sentByEmail` | string \| null | Email of the user who sent it |
| `invoiceId`, `invoiceNumber`, `deliveryNoteId`, `deliveryNoteNumber` | string \| null | Always `null` for a receipt email |
| `events` | array | Tracking events recorded for the email. Entries carry no fields at the moment |

The PDF is attached as `bon-{number}.pdf`. The attachment list is not part of the response.

## Template Variables

The following variables are substituted in the subject and body, whether you send them or take them from a template:

| Variable | Description | Example |
|----------|-------------|---------|
| `[[client_name]]` | Client name, or the customer name on the receipt | Acme SRL |
| `[[receipt_number]]` | Receipt number | BON0042 |
| `[[total]]` | Receipt total, without currency | 251.00 |
| `[[issue_date]]` | Issue date | 18.02.2026 |
| `[[company_name]]` | Your company name | Your Company SRL |
| `[[currency]]` | Currency code | RON |

## Sending limits

Document emails go out from the shared Storno sender, so every message is checked against an abuse guard before it is queued:

| Rule | Limit |
|------|-------|
| Recipients | Every address in `to`, `cc` and `bcc` must be the email of one of the company's clients, the company's own email, or the sender's email |
| Recipients per email (`to` + `cc` + `bcc`) | 5 |
| Burst per user | 10 emails / 10 minutes on Freemium, 60 / 10 minutes on paid plans |
| Rolling 24h cap per organization | 30 on Freemium, 300 on Starter, 1,000 on Professional, 3,000 on Business |
| Content | Subject and body must describe the attached document. Phishing-style wording, raw `<script>`/`<form>`/`<iframe>` tags and HTML in the subject are rejected. |

Organizations on the Business plan that relay through their own SMTP server (white-label mailer) are exempt from the burst, daily and wording checks.

## Error Codes

| Status Code | Code | Description |
|-------------|------|-------------|
| 400 | | Invalid or missing `to` address, or unknown `templateId` |
| 400 | `EMAIL_TOO_MANY_RECIPIENTS` | More than 5 recipients across `to`, `cc` and `bcc` |
| 401 | | Missing or invalid authentication token |
| 402 | `PLAN_LIMIT` | Email sending is not available on the organization's plan |
| 403 | | Permission denied. Also `PLAN_LIMIT` when email sending is disabled for the organization |
| 404 | | Receipt not found or not in your organization |
| 422 | `EMAIL_RECIPIENT_NOT_CLIENT` | A recipient is not a client of the company |
| 422 | `EMAIL_CONTENT_BLOCKED` | Subject or body rejected by the abuse filter |
| 429 | `EMAIL_RATE_LIMIT` | Per-user burst limit exceeded; retry after the `Retry-After` header |
| 429 | `EMAIL_DAILY_LIMIT` | Organization's rolling 24h cap reached |
| 500 | | Sending failed, or the recipient unsubscribed from the company's emails (`{"error": "..."}`) |

Errors from the sending guard have the form `{"error": "message", "code": "..."}`. Other errors have the form `{"error": "message"}`.

## Related Endpoints

- [Get email defaults](/api-reference/receipts/email-defaults) - Get pre-filled subject and body
- [Get email history](/api-reference/receipts/email-history) - View previously sent emails
- [Download PDF](/api-reference/receipts/pdf) - Download the PDF directly
