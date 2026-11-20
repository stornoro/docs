---
title: Email invoice
description: Send an invoice via email with PDF and XML attachments
---

# Email invoice

Sends an invoice to a client by email with the PDF and the UBL XML attached. The email can be customized with subject, body, and recipients.

```
POST /api/v1/invoices/{uuid}/email
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `to` | string | Yes | Recipient email address |
| `cc` | array of strings | No | CC email addresses |
| `bcc` | array of strings | No | BCC email addresses |
| `subject` | string | No | Email subject. Falls back to the template subject, then to `Factura {number} - {company}` |
| `body` | string | No | Email body (Markdown). Falls back to the template body, then to a short default text |
| `templateId` | string | No | UUID of one of the company's email templates, used when `subject` or `body` is missing |

The PDF and the UBL XML are always attached. Template variables in `subject` and `body` are replaced before sending (see [Template variables](#template-variables)).

Only outgoing invoices that are not `draft` or `cancelled` can be emailed.

{% callout type="info" %}
Use the [email defaults endpoint](/api-reference/invoices/email-defaults) to get pre-filled subject and body based on your company's email template.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "billing@acme.ro",
    "cc": ["accounting@acme.ro"],
    "subject": "Factura FAC-2024-001",
    "body": "Buna ziua,\n\nGasiti atasat factura FAC-2024-001 in valoare de 1190.00 RON.\n\nMultumim!"
  }'
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'billing@acme.ro',
    cc: ['accounting@acme.ro'],
    subject: 'Factura FAC-2024-001',
    body: 'Buna ziua,\n\nGasiti atasat factura FAC-2024-001 in valoare de 1190.00 RON.\n\nMultumim!'
  })
});

const result = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the email log record with status `200`. The email is sent before the response returns.

```json
{
  "id": "8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
  "category": "invoice",
  "toEmail": "billing@acme.ro",
  "ccEmails": ["accounting@acme.ro"],
  "bccEmails": null,
  "subject": "Factura FAC-2024-001",
  "sentAt": "2024-02-15T09:05:00+00:00",
  "status": "sent",
  "templateUsed": null,
  "errorMessage": null,
  "sesMessageId": "0102018d-example",
  "fromEmail": "no-reply@example.com",
  "fromName": "Your Company SRL",
  "events": [],
  "invoiceId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "invoiceNumber": "FAC-2024-001",
  "sentByEmail": "john@yourcompany.ro",
  "deliveryNoteId": null,
  "deliveryNoteNumber": null
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Email log UUID |
| `category` | string | `invoice` |
| `toEmail` | string | Recipient address |
| `ccEmails` | array \| null | CC addresses |
| `bccEmails` | array \| null | BCC addresses |
| `subject` | string | Subject after variable replacement |
| `sentAt` | string | ISO 8601 timestamp |
| `status` | string | `sent`, `delivered`, `bounced` or `failed` |
| `templateUsed` | string \| null | Name of the template used |
| `errorMessage` | string \| null | Failure reason |
| `sesMessageId` | string \| null | Provider message id (shared sender only) |
| `fromEmail`, `fromName` | string \| null | Sender |
| `invoiceId`, `invoiceNumber` | string | The invoice |
| `sentByEmail` | string \| null | Email of the user who sent it |

## Template variables

Variables are written between double square brackets and are replaced in `subject` and `body`, whether they come from a template or from the request.

| Variable | Description | Example |
|----------|-------------|---------|
| `[[invoice_number]]` | Invoice number | FAC-2024-001 |
| `[[total]]` | Invoice total, plain decimal | 1190.00 |
| `[[balance]]` | Remaining balance | 690.00 |
| `[[currency]]` | Invoice currency | RON |
| `[[client_name]]` | Client name | Acme Corporation SRL |
| `[[client_outstanding]]` | Client's outstanding balance in the invoice currency | 1500.00 |
| `[[company_name]]` | Your company name | Your Company SRL |
| `[[due_date]]` | Payment due date | 15.03.2024 |
| `[[days_overdue]]` | Whole days past the due date; 0 when the invoice is not overdue or has no due date | 7 |
| `[[issue_date]]` | Invoice issue date | 15.02.2024 |

When neither the request nor a template provides them, the subject is `Factura {number} - {company name}` and the body is a short Romanian greeting that mentions the invoice number.

## Email delivery

The email is rendered and sent inside the request. The attached PDF is the company's configured design, and the message contains a link to a public view of the invoice. The record starts as `sent`. The status moves to `delivered` or `bounced` when delivery events arrive from the mail provider, and you can read it with the [email history endpoint](/api-reference/invoices/email-history).

A send that fails returns `500` with `Failed to send email: ...`, and the record is stored with status `failed`.

## Sending limits

Document emails go out from the shared Storno sender, so every message is checked against an abuse guard before it is sent:

| Rule | Limit |
|------|-------|
| Recipients | Every address in `to`, `cc` and `bcc` must be the email of one of the company's clients, the company's own email, or the sender's email |
| Recipients per email (`to` + `cc` + `bcc`) | 5 |
| Burst per user | 10 emails / 10 minutes on Freemium, 60 / 10 minutes on paid plans |
| Rolling 24h cap per organization | 30 on Freemium, 300 on Starter, 1,000 on Professional, 3,000 on Business |
| Content | Subject and body must describe the attached document. Phishing-style wording, raw `<script>`/`<form>`/`<iframe>` tags and HTML in the subject are rejected. |

Organizations on the Business plan that relay through their own SMTP server (white-label mailer) are exempt from the burst, daily and wording checks.

## Error codes

Error bodies are `{"error": "message"}`, with a `code` field where noted.

| Code | Description |
|------|-------------|
| `400` | Invalid `to`, `cc` or `bcc` address, the `templateId` is not a template of the company, the invoice is incoming, or the invoice is `draft` or `cancelled`. More than 5 recipients in `to`, `cc` and `bcc` combined returns `EMAIL_TOO_MANY_RECIPIENTS` |
| `401` | Missing or invalid authentication token |
| `402` | Email sending not available on the organization's plan (`PLAN_LIMIT`) |
| `403` | No permission on the invoice, or email sending is disabled for the organization |
| `404` | Invoice not found |
| `422` | Recipient is not a client of the company (`EMAIL_RECIPIENT_NOT_CLIENT`), or subject or body rejected by the abuse filter (`EMAIL_CONTENT_BLOCKED`) |
| `429` | Per-user burst limit or organization daily cap reached (`EMAIL_RATE_LIMIT`, `EMAIL_DAILY_LIMIT`); see `Retry-After` |
| `500` | The email could not be sent |

## Related endpoints

- [Email defaults](/api-reference/invoices/email-defaults) - Get pre-filled email content
- [Email history](/api-reference/invoices/email-history) - View sent emails
- [Download PDF](/api-reference/invoices/pdf) - Get the PDF file
- [Download XML](/api-reference/invoices/xml) - Get the XML file
