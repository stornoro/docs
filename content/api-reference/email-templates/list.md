---
title: List email templates
description: Retrieve all email templates for the authenticated company.
---

# List email templates

Retrieves all email templates configured for the authenticated company. If no templates exist, a default template is automatically created.

```http
GET /api/v1/email-templates
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns an array of email template objects.

### Email Template Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `name` | string | Template name |
| `subject` | string | Email subject line (supports variables) |
| `body` | string | Email body content (supports variables) |
| `isDefault` | boolean | Whether this is the default template |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/email-templates' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
[
  {
    "uuid": "template-uuid-1",
    "name": "Factura standard",
    "subject": "Factura {{invoice_number}} de la {{company_name}}",
    "body": "Bună ziua,\n\nVă transmitem factura {{invoice_number}} în valoare de {{total}} RON.\n\nData scadență: {{due_date}}\n\nVă mulțumim,\n{{company_name}}",
    "isDefault": true,
    "createdAt": "2025-06-01T10:00:00Z",
    "updatedAt": "2025-06-01T10:00:00Z"
  },
  {
    "uuid": "template-uuid-2",
    "name": "Factura cu reminder",
    "subject": "Reminder: Factura {{invoice_number}} scadentă",
    "body": "Bună ziua {{client_name}},\n\nVă reamintim că factura {{invoice_number}} în valoare de {{total}} RON este scadentă pe {{due_date}}.\n\nVă rugăm să procesați plata cât mai curând posibil.\n\nMulțumim,\n{{company_name}}",
    "isDefault": false,
    "createdAt": "2025-07-15T14:30:00Z",
    "updatedAt": "2025-12-10T09:20:00Z"
  }
]
```

## Available Variables

Email templates support the following dynamic variables:

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{invoice_number}}` | Full invoice number | FAC00245 |
| `{{client_name}}` | Client name | Acme Corporation SRL |
| `{{total}}` | Total amount | 2380.00 |
| `{{currency}}` | Currency code | RON |
| `{{due_date}}` | Due date | 2026-03-15 |
| `{{issue_date}}` | Issue date | 2026-02-15 |
| `{{company_name}}` | Your company name | My Company SRL |

## Auto-Seeding

If a company has no email templates, the system automatically creates a default template on first request with Romanian content suitable for standard invoice emails.

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |

## Important Notes

- Each company should have at least one email template
- Only one template can be marked as default
- The default template is used when sending invoices without specifying a template
- Templates can include HTML formatting for richer email appearance
- Variables are replaced at send time with actual invoice data

## Related Endpoints

- [Create email template](/api-reference/email-templates/create)
- [Update email template](/api-reference/email-templates/update)
- [Delete email template](/api-reference/email-templates/delete)
