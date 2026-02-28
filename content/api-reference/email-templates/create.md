---
title: Create email template
description: Create a new email template for invoice communications.
---

# Create email template

Creates a new email template for the authenticated company. Templates support dynamic variables that are replaced with actual invoice data when emails are sent.

```http
POST /api/v1/email-templates
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Template name for internal reference |
| `subject` | string | Yes | Email subject line (supports variables) |
| `body` | string | Yes | Email body content (supports variables) |
| `isDefault` | boolean | No | Set as default template (default: false) |

## Response

Returns the created email template object with a `201 Created` status.

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/email-templates' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Factura cu reminder plată",
    "subject": "Reminder: Factura {{invoice_number}} scadentă pe {{due_date}}",
    "body": "Bună ziua {{client_name}},\n\nVă reamintim că factura {{invoice_number}} în valoare de {{total}} {{currency}} este scadentă pe {{due_date}}.\n\nVă rugăm să efectuați plata cât mai curând posibil pentru a evita penalitățile de întârziere.\n\nDetalii facturã:\n- Număr: {{invoice_number}}\n- Dată emitere: {{issue_date}}\n- Dată scadență: {{due_date}}\n- Total: {{total}} {{currency}}\n\nVă mulțumim pentru colaborare,\n{{company_name}}",
    "isDefault": false
  }'
```

## Example Response

```json
{
  "uuid": "template-uuid-3",
  "name": "Factura cu reminder plată",
  "subject": "Reminder: Factura {{invoice_number}} scadentă pe {{due_date}}",
  "body": "Bună ziua {{client_name}},\n\nVă reamintim că factura {{invoice_number}} în valoare de {{total}} {{currency}} este scadentă pe {{due_date}}.\n\nVă rugăm să efectuați plata cât mai curând posibil pentru a evita penalitățile de întârziere.\n\nDetalii facturã:\n- Număr: {{invoice_number}}\n- Dată emitere: {{issue_date}}\n- Dată scadență: {{due_date}}\n- Total: {{total}} {{currency}}\n\nVă mulțumim pentru colaborare,\n{{company_name}}",
  "isDefault": false,
  "createdAt": "2026-02-16T17:00:00Z",
  "updatedAt": "2026-02-16T17:00:00Z"
}
```

## Available Variables

Use these variables in your subject and body. They will be replaced with actual data when emails are sent:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{invoice_number}}` | Full invoice number | FAC00245 |
| `{{client_name}}` | Client name | Acme Corporation SRL |
| `{{total}}` | Total amount (formatted) | 2,380.00 |
| `{{currency}}` | Currency code | RON |
| `{{due_date}}` | Due date (formatted) | 15 martie 2026 |
| `{{issue_date}}` | Issue date (formatted) | 15 februarie 2026 |
| `{{company_name}}` | Your company name | My Company SRL |

## Default Template Behavior

- If `isDefault` is `true`, any existing default template will be set to non-default
- Only one template can be marked as default
- The default template is used when sending invoices without explicitly specifying a template

## Template Use Cases

### Standard Invoice Email

Basic template for sending invoices to clients.

### Payment Reminder

Template with stronger language for overdue invoices.

### Recurring Invoice

Template specifically for automated recurring invoice emails.

### Thank You Email

Template sent after payment is received.

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- Missing `name` field
- Missing `subject` field
- Missing `body` field
- Empty subject or body
- Subject or body exceeds maximum length

## Related Endpoints

- [List email templates](/api-reference/email-templates/list)
- [Update email template](/api-reference/email-templates/update)
- [Delete email template](/api-reference/email-templates/delete)
