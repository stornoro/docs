---
title: Update email template
description: Update an existing email template.
---

# Update email template

Updates an existing email template of the company. Needs the Professional or Business plan, otherwise the call returns `402` with `code: "PLAN_LIMIT"`.

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
| `X-Company` | string | Conditional | Company UUID. Optional when the organization has a single company. The `?company=` query parameter is also accepted |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

All parameters are optional. The category of a template cannot be changed.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Template name for internal reference |
| `subject` | string | Email subject line (supports variables) |
| `body` | string | Email body content (supports variables) |
| `isDefault` | boolean | Set as the default template of its category |

## Response

Returns the updated template object: `id`, `name`, `subject`, `body`, `isDefault` and `category`.

## Example Request

```bash
curl -X PATCH 'https://api.storno.ro/api/v1/email-templates/template-uuid-2' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Factura cu reminder urgent",
    "subject": "URGENT: Factura [[invoice_number]] restantă",
    "body": "Bună ziua [[client_name]],\n\nFactura [[invoice_number]] în valoare de [[total]] [[currency]] a depășit termenul de plată ([[due_date]]).\n\nVă rugăm să efectuați plata de urgență pentru a evita suspendarea serviciilor și aplicarea penalităților.\n\nContact urgent: finance@company.ro\n\nMulțumim,\n[[company_name]]"
  }'
```

## Example Response

```json
{
  "id": "8d0f7780-8536-41ef-a55c-f18bd2c01bf8",
  "name": "Factura cu reminder urgent",
  "subject": "URGENT: Factura [[invoice_number]] restanta",
  "body": "Buna ziua [[client_name]],\n\nFactura [[invoice_number]] in valoare de [[total]] [[currency]] a depasit termenul de plata ([[due_date]]).\n\nMultumim,\n[[company_name]]",
  "isDefault": false,
  "category": "invoice"
}
```

## Available Variables

See [List email templates](/api-reference/email-templates/list#available-variables) for the placeholders. They are written `[[name]]`.

## Default Template Behavior

- If `isDefault` is set to `true`, the existing default template of the same category is set to non-default

## Important Notes

- Changes to templates only affect future emails
- Emails that have already been sent are not modified

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 402 | The plan does not include email templates. Body has `code: "PLAN_LIMIT"` |
| 403 | Missing the `email_template.manage` permission |
| 404 | Email template not found, or it belongs to another organization |

## Related Endpoints

- [List email templates](/api-reference/email-templates/list)
- [Create email template](/api-reference/email-templates/create)
- [Delete email template](/api-reference/email-templates/delete)
