---
title: Get email defaults
description: Retrieve pre-filled email content from company template
---

# Get email defaults

Retrieves pre-filled email content for an invoice based on your company's email template settings. Use this endpoint to populate the email form before sending.

```
GET /api/v1/invoices/{uuid}/email-defaults
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/email-defaults \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/email-defaults', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const emailDefaults = await response.json();
// Use to populate email form
document.getElementById('email-to').value = emailDefaults.to;
document.getElementById('email-subject').value = emailDefaults.subject;
document.getElementById('email-body').value = emailDefaults.body;
```
{% /code-snippet %}

{% /code-snippet-group %}

The endpoint takes no query parameters.

## Response

Returns the pre-filled email data with template variables replaced.

```json
{
  "to": "billing@acme.ro",
  "subject": "Factura FAC-2024-001 de la Your Company SRL",
  "body": "Buna ziua,\n\nVa trimitem atasat factura FAC-2024-001.\n\nCu stima,\nYour Company SRL",
  "templateId": "3f1c2a9e-7b4d-4e0a-9c55-2d6a1b8e4f10"
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `to` | string \| null | The client's email, or the supplier's email when the invoice has no client email. `null` when neither exists |
| `subject` | string | Subject with variables replaced |
| `body` | string | Body with variables replaced |
| `templateId` | string \| null | UUID of the company's default `invoice` template when one is set, otherwise `null` |

When the company has no default invoice template, `subject` is `Factura {number} - {company name}` and `body` is a short Romanian greeting that mentions the invoice number.

## Template variables

Variables are written between double square brackets and replaced in the subject and body.

| Variable | Example value | Description |
|----------|---------------|-------------|
| `[[invoice_number]]` | FAC-2024-001 | Invoice number |
| `[[total]]` | 1190.00 | Invoice total, plain decimal |
| `[[balance]]` | 690.00 | Remaining balance |
| `[[currency]]` | RON | Invoice currency |
| `[[client_name]]` | Acme Corporation SRL | Client name |
| `[[client_outstanding]]` | 1500.00 | Client's outstanding balance in the invoice currency |
| `[[company_name]]` | Your Company SRL | Your company name |
| `[[due_date]]` | 15.03.2024 | Payment due date |
| `[[issue_date]]` | 15.02.2024 | Invoice issue date |

Templates are managed with the email templates endpoints. There is no conditional syntax.

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No permission to view the invoice |
| `404` | Invoice not found |

## Use cases

- **Pre-fill email form** - Load defaults when user clicks "Send Email"
- **Bulk email preview** - Show what will be sent before batch sending
- **Template testing** - Preview how templates look with real data
- **API integration** - Get consistent email content in external systems

## Related endpoints

- [Send email](/api-reference/invoices/email) - Send the email with these defaults
- [Email history](/api-reference/invoices/email-history) - View previously sent emails
- [Get invoice details](/api-reference/invoices/get) - Get invoice data for custom templates
