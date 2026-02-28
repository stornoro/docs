---
title: Send Receipt Email
description: Send a receipt to a customer via email with PDF attachment
method: POST
endpoint: /api/v1/receipts/{uuid}/email
---

# Send Receipt Email

Sends a receipt to a customer via email with the PDF attached. The subject and body can be customized or left blank to use the company's default email template.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the receipt to email |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `to` | string | Yes | Recipient email address |
| `subject` | string | No | Email subject (uses default template if omitted) |
| `body` | string | No | Email body (uses default template if omitted) |
| `cc` | string[] | No | Array of CC email addresses |
| `bcc` | string[] | No | Array of BCC email addresses |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "office@acme.ro",
    "subject": "Bon fiscal BON-2026-042",
    "body": "Buna ziua,\n\nGasiti atasat bonul fiscal BON-2026-042 in valoare de 251.00 RON.\n\nMultumim pentru achizitie!\n\nYour Company SRL",
    "cc": ["accounting@acme.ro"]
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
    to: 'office@acme.ro',
    subject: 'Bon fiscal BON-2026-042',
    body: 'Buna ziua,\n\nGasiti atasat bonul fiscal BON-2026-042 in valoare de 251.00 RON.\n\nMultumim pentru achizitie!\n\nYour Company SRL',
    cc: ['accounting@acme.ro']
  })
});

const data = await response.json();
```

## Response

Returns an email log object confirming the email was sent:

```json
{
  "id": "8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
  "to": "office@acme.ro",
  "cc": ["accounting@acme.ro"],
  "bcc": null,
  "subject": "Bon fiscal BON-2026-042",
  "attachments": ["bon-BON-2026-042.pdf"],
  "sentAt": "2026-02-18T10:30:00Z",
  "deliveryStatus": "sent"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Email log UUID |
| `to` | string | Primary recipient email address |
| `cc` | string[]\|null | CC recipients |
| `bcc` | string[]\|null | BCC recipients |
| `subject` | string | Subject line that was sent |
| `attachments` | string[] | List of attached file names |
| `sentAt` | string | ISO 8601 timestamp of when the email was sent |
| `deliveryStatus` | string | `sent`, `queued`, or `failed` |

## Template Variables

When using the default email template (subject or body omitted), the following variables are substituted automatically:

| Variable | Description | Example |
|----------|-------------|---------|
| `[[customer_name]]` | Customer name from receipt | Acme SRL |
| `[[receipt_number]]` | Receipt number | BON-2026-042 |
| `[[total]]` | Formatted total with currency | 251.00 RON |
| `[[issue_date]]` | Issue date | 18.02.2026 |
| `[[company_name]]` | Your company name | Your Company SRL |
| `[[currency]]` | Currency code | RON |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid or missing `to` email address |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Receipt not found or doesn't belong to the company |
| 500 | `internal_error` | Email sending failed |

## Related Endpoints

- [Get email defaults](/api-reference/receipts/email-defaults) - Get pre-filled subject and body
- [Get email history](/api-reference/receipts/email-history) - View previously sent emails
- [Download PDF](/api-reference/receipts/pdf) - Download the PDF directly
