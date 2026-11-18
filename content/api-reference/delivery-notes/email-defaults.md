---
title: Get Email Defaults
description: Get pre-filled email content for a delivery note
method: GET
endpoint: /api/v1/delivery-notes/{uuid}/email-defaults
---

# Get Email Defaults

Returns pre-filled email content for a delivery note based on the company's configured email template. All template variables are already substituted with real values from the delivery note and client records. Use this to populate the email form before sending.

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
curl https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/email-defaults \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/email-defaults', {
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
  "to": "contact@client.ro",
  "subject": "Aviz de livrare DN0012 de la Your Company SRL",
  "body": "Buna ziua,\n\nGasiti atasat avizul de livrare DN0012 in valoare de 6050.00 RON.\n\nMultumim!\n\nYour Company SRL",
  "templateId": null
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `to` | string \| null | Client email address (from the client record), null when the delivery note has no client or the client has no email |
| `subject` | string | Pre-filled subject with all template variables replaced |
| `body` | string | Pre-filled body with all template variables replaced |
| `templateId` | string \| null | Id of the default `delivery_note` email template that was used, null when the built-in text is used |

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Delivery note not found or not in the caller's organization |

## Related Endpoints

- [Send email](/api-reference/delivery-notes/email) - Send the email using these defaults
- [Get email history](/api-reference/delivery-notes/email-history) - View previously sent emails
