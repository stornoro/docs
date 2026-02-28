---
title: Update email template
description: Update an existing email template.
---

# Update email template

Updates an existing email template for the authenticated company.

```http
PATCH /api/v1/email-templates/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the email template |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

All parameters are optional, but at least one must be provided.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Template name for internal reference |
| `subject` | string | Email subject line (supports variables) |
| `body` | string | Email body content (supports variables) |
| `isDefault` | boolean | Set as default template |

## Response

Returns the updated email template object.

## Example Request

```bash
curl -X PATCH 'https://api.storno.ro/api/v1/email-templates/template-uuid-2' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Factura cu reminder urgent",
    "subject": "URGENT: Factura {{invoice_number}} restantă",
    "body": "Bună ziua {{client_name}},\n\nFactura {{invoice_number}} în valoare de {{total}} {{currency}} a depășit termenul de plată ({{due_date}}).\n\nVă rugăm să efectuați plata de urgență pentru a evita suspendarea serviciilor și aplicarea penalităților.\n\nContact urgent: finance@company.ro\n\nMulțumim,\n{{company_name}}"
  }'
```

## Example Response

```json
{
  "uuid": "template-uuid-2",
  "name": "Factura cu reminder urgent",
  "subject": "URGENT: Factura {{invoice_number}} restantă",
  "body": "Bună ziua {{client_name}},\n\nFactura {{invoice_number}} în valoare de {{total}} {{currency}} a depășit termenul de plată ({{due_date}}).\n\nVă rugăm să efectuați plata de urgență pentru a evita suspendarea serviciilor și aplicarea penalităților.\n\nContact urgent: finance@company.ro\n\nMulțumim,\n{{company_name}}",
  "isDefault": false,
  "createdAt": "2025-07-15T14:30:00Z",
  "updatedAt": "2026-02-16T17:15:00Z"
}
```

## Available Variables

See the [create endpoint](/api-reference/email-templates/create#available-variables) for a complete list of available template variables.

## Default Template Behavior

- If `isDefault` is set to `true`, any existing default template will be set to non-default
- Only one template can be marked as default
- Setting `isDefault` to `false` on the default template requires another template to be set as default first

## Important Notes

- Changes to templates only affect future emails
- Emails that have already been sent are not modified
- Consider versioning template names if you make significant changes (e.g., "Factura standard v2")

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Email template not found or doesn't belong to company |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- No fields provided for update
- Empty subject or body
- Subject or body exceeds maximum length

## Related Endpoints

- [List email templates](/api-reference/email-templates/list)
- [Create email template](/api-reference/email-templates/create)
- [Delete email template](/api-reference/email-templates/delete)
