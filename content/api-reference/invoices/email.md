---
title: Email invoice
description: Send an invoice via email with PDF and XML attachments
---

# Email invoice

Sends an invoice to a client via email with optional PDF and XML attachments. The email can be customized with subject, body, and recipients.

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
| `cc` | string | No | CC email address (comma-separated for multiple) |
| `bcc` | string | No | BCC email address (comma-separated for multiple) |
| `subject` | string | No | Email subject (uses default template if not provided) |
| `body` | string | No | Email body (uses default template if not provided) |
| `attachPdf` | boolean | No | Attach PDF invoice (default: true) |
| `attachXml` | boolean | No | Attach UBL XML (default: false) |
| `language` | string | No | Email template language: `ro`, `en` (default: ro) |

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
    "cc": "accounting@acme.ro",
    "subject": "Factura FAC-2024-001",
    "body": "Buna ziua,\n\nGasiti atasat factura FAC-2024-001 in valoare de 1,190.00 RON.\n\nMultumim!",
    "attachPdf": true,
    "attachXml": false
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
    cc: 'accounting@acme.ro',
    subject: 'Factura FAC-2024-001',
    body: 'Buna ziua,\n\nGasiti atasat factura FAC-2024-001 in valoare de 1,190.00 RON.\n\nMultumim!',
    attachPdf: true,
    attachXml: false
  })
});

const result = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns a success confirmation with email details.

```json
{
  "success": true,
  "emailId": "8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
  "to": "billing@acme.ro",
  "cc": "accounting@acme.ro",
  "subject": "Factura FAC-2024-001",
  "attachments": ["FAC-2024-001.pdf"],
  "sentAt": "2024-02-15T09:05:00Z",
  "deliveryStatus": "sent"
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether email was sent successfully |
| `emailId` | string | Email tracking UUID |
| `to` | string | Recipient email address |
| `cc` | string | CC recipients (if any) |
| `subject` | string | Email subject that was sent |
| `attachments` | array | List of attached file names |
| `sentAt` | string | ISO 8601 timestamp |
| `deliveryStatus` | string | Email status: `sent`, `queued`, `failed` |

## Email template variables

When using default templates, the following variables are automatically replaced:

| Variable | Description | Example |
|----------|-------------|---------|
| `{invoice_number}` | Invoice number | FAC-2024-001 |
| `{invoice_total}` | Formatted total amount | 1,190.00 RON |
| `{client_name}` | Client name | Acme Corporation SRL |
| `{company_name}` | Your company name | Your Company SRL |
| `{due_date}` | Payment due date | 15.03.2024 |
| `{issue_date}` | Invoice issue date | 15.02.2024 |
| `{payment_link}` | Payment link (if enabled) | https://pay.storno.ro/... |

### Default subject template (Romanian)

```
Factura {invoice_number} de la {company_name}
```

### Default body template (Romanian)

```
Buna ziua,

Gasiti atasat factura {invoice_number} in valoare de {invoice_total}.

Detalii factura:
- Numar: {invoice_number}
- Data emiterii: {issue_date}
- Scadenta: {due_date}
- Total: {invoice_total}

Multumim!

{company_name}
```

## Email delivery

Emails are sent asynchronously via a queue system:

1. **Immediate** - Email queued immediately (response within 200ms)
2. **Processing** - Email sent within 1-5 seconds
3. **Delivered** - Email delivered to recipient server
4. **Tracking** - Delivery status updated via webhooks

You can track delivery status via:
- [Email history endpoint](/api-reference/invoices/email-history)
- Webhooks (email.delivered, email.bounced events)
- Email tracking dashboard

## Email configuration

Email sending requires proper configuration in company settings:

- **From address** - Verified sender email
- **From name** - Display name
- **Reply-to** - Reply email address
- **SMTP settings** - Custom SMTP (optional)
- **Email template** - Default subject and body

{% callout type="warning" %}
The sender email must be verified before you can send emails. Unverified emails will result in a `403` error.
{% /callout %}

## Error codes

| Code | Description |
|------|-------------|
| `400` | Validation error - invalid email address or missing required fields |
| `401` | Missing or invalid authentication token |
| `403` | Sender email not verified |
| `404` | Invoice not found |
| `422` | Invoice not issued or PDF/XML not generated |
| `429` | Rate limit exceeded (max 100 emails per hour) |
| `500` | Email service temporarily unavailable |

## Related endpoints

- [Email defaults](/api-reference/invoices/email-defaults) - Get pre-filled email content
- [Email history](/api-reference/invoices/email-history) - View sent emails
- [Download PDF](/api-reference/invoices/pdf) - Get the PDF file
- [Download XML](/api-reference/invoices/xml) - Get the XML file
