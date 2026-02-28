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

## Query parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `language` | string | ro | Email language: `ro` or `en` |

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

## Response

Returns pre-filled email data with template variables replaced.

```json
{
  "to": "billing@acme.ro",
  "cc": "accounting@acme.ro",
  "bcc": null,
  "subject": "Factura FAC-2024-001 de la Your Company SRL",
  "body": "Buna ziua,\n\nGasiti atasat factura FAC-2024-001 in valoare de 1,190.00 RON.\n\nDetalii factura:\n- Numar: FAC-2024-001\n- Data emiterii: 15.02.2024\n- Scadenta: 15.03.2024\n- Total: 1,190.00 RON\n\nPuteti efectua plata aici: https://pay.storno.ro/inv_abc123\n\nMultumim!\n\nYour Company SRL\ncontact@yourcompany.ro\n+40 123 456 789",
  "attachPdf": true,
  "attachXml": false,
  "from": {
    "email": "contact@yourcompany.ro",
    "name": "Your Company SRL"
  },
  "replyTo": "accounting@yourcompany.ro"
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `to` | string | Client billing email (from client record) |
| `cc` | string\|null | CC address (from company settings) |
| `bcc` | string\|null | BCC address (from company settings) |
| `subject` | string | Pre-filled subject with variables replaced |
| `body` | string | Pre-filled body with variables replaced |
| `attachPdf` | boolean | Default PDF attachment setting |
| `attachXml` | boolean | Default XML attachment setting |
| `from` | object | Sender email and name |
| `replyTo` | string | Reply-to email address |

## Template variables

The following variables are automatically replaced in subject and body:

| Variable | Example value | Description |
|----------|---------------|-------------|
| `{invoice_number}` | FAC-2024-001 | Invoice number |
| `{invoice_total}` | 1,190.00 RON | Formatted total with currency |
| `{invoice_subtotal}` | 1,000.00 RON | Subtotal before VAT |
| `{invoice_vat}` | 190.00 RON | Total VAT amount |
| `{client_name}` | Acme Corporation SRL | Client company name |
| `{client_contact}` | John Smith | Client contact person |
| `{company_name}` | Your Company SRL | Your company name |
| `{company_cif}` | RO12345678 | Your company CIF |
| `{company_email}` | contact@yourcompany.ro | Company email |
| `{company_phone}` | +40 123 456 789 | Company phone |
| `{due_date}` | 15.03.2024 | Payment due date |
| `{issue_date}` | 15.02.2024 | Invoice issue date |
| `{payment_link}` | https://pay.storno.ro/inv_abc123 | Payment link (if enabled) |
| `{days_until_due}` | 28 | Days until payment is due |
| `{series_name}` | Facturi 2024 | Invoice series name |

## Customizing email templates

Email templates can be customized in company settings:

### Subject template
```
Factura {invoice_number} de la {company_name} - Scadenta: {due_date}
```

### Body template
```
Stimate {client_name},

Va transmitem factura {invoice_number} in valoare totala de {invoice_total}.

Detalii:
- Data emiterii: {issue_date}
- Termen de plata: {due_date} ({days_until_due} zile)
- Subtotal: {invoice_subtotal}
- TVA: {invoice_vat}
- TOTAL: {invoice_total}

Puteti efectua plata online: {payment_link}

Cu stima,
{company_name}
```

### Conditional sections

Templates support basic conditional logic:

```
{if payment_link}
Plata online: {payment_link}
{endif}

{if overdue}
ATENTIE: Aceasta factura este restanta!
{endif}
```

## Client email resolution

The `to` field is automatically populated from:

1. Client billing email (if set)
2. Client primary email
3. Client contact person email
4. Empty (user must fill manually)

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Invoice not found |
| `422` | Invalid language parameter |

## Use cases

- **Pre-fill email form** - Load defaults when user clicks "Send Email"
- **Bulk email preview** - Show what will be sent before batch sending
- **Template testing** - Preview how templates look with real data
- **API integration** - Get consistent email content in external systems

## Related endpoints

- [Send email](/api-reference/invoices/email) - Send the email with these defaults
- [Email history](/api-reference/invoices/email-history) - View previously sent emails
- [Get invoice details](/api-reference/invoices/get) - Get invoice data for custom templates
