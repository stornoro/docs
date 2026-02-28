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
| `X-Company` | string | Yes | Company UUID to scope the request |

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

Returns an object with pre-filled `to`, `subject`, and `body` fields:

```json
{
  "to": "contact@client.ro",
  "subject": "Aviz de livrare DN-2026-012 de la Your Company SRL",
  "body": "Buna ziua,\n\nGasiti atasat avizul de livrare DN-2026-012 in valoare de 5,950.00 RON.\n\nMultumim!\n\nYour Company SRL"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `to` | string | Client email address (from client record) |
| `subject` | string | Pre-filled subject with all template variables replaced |
| `body` | string | Pre-filled body with all template variables replaced |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Delivery note not found or doesn't belong to the company |

## Related Endpoints

- [Send email](/api-reference/delivery-notes/email) - Send the email using these defaults
- [Get email history](/api-reference/delivery-notes/email-history) - View previously sent emails
