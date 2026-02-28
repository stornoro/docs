---
title: Send Delivery Note Email
description: Send a delivery note to a client via email with PDF attachment
method: POST
endpoint: /api/v1/delivery-notes/{uuid}/email
---

# Send Delivery Note Email

Sends a delivery note to a client via email with the PDF attached. The subject and body can be customized or left blank to use the company's default email template.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note to email |

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
curl -X POST https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "contact@client.ro",
    "subject": "Aviz de livrare DN-2026-012",
    "body": "Buna ziua,\n\nGasiti atasat avizul de livrare DN-2026-012.\n\nMultumim!",
    "cc": ["accounting@client.ro"]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'contact@client.ro',
    subject: 'Aviz de livrare DN-2026-012',
    body: 'Buna ziua,\n\nGasiti atasat avizul de livrare DN-2026-012.\n\nMultumim!',
    cc: ['accounting@client.ro']
  })
});

const data = await response.json();
```

## Response

Returns an email log object confirming the email was sent:

```json
{
  "id": "8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c",
  "to": "contact@client.ro",
  "cc": ["accounting@client.ro"],
  "bcc": null,
  "subject": "Aviz de livrare DN-2026-012",
  "attachments": ["aviz-DN-2026-012.pdf"],
  "sentAt": "2026-02-18T14:35:00Z",
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
| `[[client_name]]` | Client company name | Client SRL |
| `[[delivery_note_number]]` | Delivery note number | DN-2026-012 |
| `[[total]]` | Formatted total with currency | 5,950.00 RON |
| `[[issue_date]]` | Issue date | 18.02.2026 |
| `[[company_name]]` | Your company name | Your Company SRL |
| `[[currency]]` | Currency code | RON |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid or missing `to` email address |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Delivery note not found or doesn't belong to the company |
| 500 | `internal_error` | Email sending failed |

## Related Endpoints

- [Get email defaults](/api-reference/delivery-notes/email-defaults) - Get pre-filled subject and body
- [Get email history](/api-reference/delivery-notes/email-history) - View previously sent emails
- [Download PDF](/api-reference/delivery-notes/pdf) - Download the PDF directly
