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
| `X-Company` | string | Yes | Company UUID to scope the request |

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

Returns an object with pre-filled `to`, `subject`, and `body` fields:

```json
{
  "to": "office@acme.ro",
  "subject": "Bon fiscal BON-2026-042 de la Your Company SRL",
  "body": "Buna ziua,\n\nGasiti atasat bonul fiscal BON-2026-042 in valoare de 251.00 RON.\n\nMultumim pentru achizitie!\n\nYour Company SRL"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `to` | string | Customer email address (from linked client or `customerName` context) |
| `subject` | string | Pre-filled subject with all template variables replaced |
| `body` | string | Pre-filled body with all template variables replaced |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Receipt not found or doesn't belong to the company |

## Related Endpoints

- [Send email](/api-reference/receipts/email) - Send the email using these defaults
- [Get email history](/api-reference/receipts/email-history) - View previously sent emails
