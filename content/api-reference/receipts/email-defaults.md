---
title: Get Email Defaults
description: Get pre-filled email content for a receipt
method: GET
endpoint: /api/v1/receipts/{uuid}/email-defaults
---

# Get Email Defaults

Returns pre-filled email content for a receipt based on the company's configured email template. All template variables are already substituted with real values from the receipt and customer records. Use this to populate the email form before sending.

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
curl https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/email-defaults \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/email-defaults', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const defaults = await response.json();

// Use to pre-populate email form
document.getElementById('email-to').value = defaults.to;
document.getElementById('email-subject').value = defaults.subject;
document.getElementById('email-body').value = defaults.body;
```

## Response

Returns an object with pre-filled `to`, `subject`, `body` and `templateId` fields:

```json
{
  "to": "office@acme.example",
  "subject": "Bon fiscal BON0042 de la Your Company SRL",
  "body": "Buna ziua,\n\nGasiti atasat bonul fiscal BON0042 in valoare de 251.00 RON.\n\nMultumim pentru achizitie!\n\nYour Company SRL",
  "templateId": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `to` | string \| null | Email address of the linked client. `null` when the receipt has no client or the client has no email |
| `subject` | string | Pre-filled subject. From the company's default `receipt` email template when one exists, with variables replaced; otherwise `Bon fiscal {number} - {company name}` |
| `body` | string | Pre-filled body, from the same template or a default text |
| `templateId` | string \| null | UUID of the default template used, or `null` when no template exists |

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Receipt not found or not in your organization |

Error responses have the form `{"error": "message"}`.

## Related Endpoints

- [Send email](/api-reference/receipts/email) - Send the email using these defaults
- [Get email history](/api-reference/receipts/email-history) - View previously sent emails
