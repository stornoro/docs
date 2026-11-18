---
title: Create email template
description: Create a new email template for invoice communications.
---

# Create email template

Creates a new email template for the company. Templates support `[[name]]` placeholders that are replaced when the email is sent. Needs the Professional or Business plan, otherwise the call returns `402` with `code: "PLAN_LIMIT"`.

```http
POST /api/v1/email-templates
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Conditional | Company UUID. Optional when the organization has a single company. The `?company=` query parameter is also accepted |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Template name for internal reference |
| `subject` | string | Yes | Email subject line (supports variables) |
| `body` | string | Yes | Email body content (supports variables) |
| `category` | string | No | `invoice`, `delivery_note` or `receipt`. Default `invoice`. Any other value is treated as `invoice` |
| `isDefault` | boolean | No | Set as the default template of its category (default: false) |

## Response

Returns `201 Created` with the template object: `id`, `name`, `subject`, `body`, `isDefault` and `category`.

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/email-templates' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Factura cu reminder plata",
    "subject": "Reminder: Factura [[invoice_number]] scadenta pe [[due_date]]",
    "body": "Buna ziua [[client_name]],\n\nVa reamintim ca factura [[invoice_number]] in valoare de [[total]] [[currency]] este scadenta pe [[due_date]].\n\nVa multumim pentru colaborare,\n[[company_name]]",
    "isDefault": false
  }'
```

## Example Response

```json
{
  "id": "9e1a8891-9647-42f0-b66d-a29ce3d12c09",
  "name": "Factura cu reminder plata",
  "subject": "Reminder: Factura [[invoice_number]] scadenta pe [[due_date]]",
  "body": "Buna ziua [[client_name]],\n\nVa reamintim ca factura [[invoice_number]] in valoare de [[total]] [[currency]] este scadenta pe [[due_date]].\n\nVa multumim pentru colaborare,\n[[company_name]]",
  "isDefault": false,
  "category": "invoice"
}
```

## Available Variables

See [List email templates](/api-reference/email-templates/list#available-variables) for the placeholders. They are written `[[name]]`.

## Default Template Behavior

- If `isDefault` is `true`, the existing default template of the same category is set to non-default
- Only one template per category can be the default

## Errors

| Status Code | Description |
|-------------|-------------|
| 400 | `name`, `subject` or `body` is missing or empty |
| 401 | Invalid or missing authentication token |
| 402 | The plan does not include email templates. Body has `code: "PLAN_LIMIT"` |
| 403 | Missing the `email_template.manage` permission |
| 404 | Company not found |

## Related Endpoints

- [List email templates](/api-reference/email-templates/list)
- [Update email template](/api-reference/email-templates/update)
- [Delete email template](/api-reference/email-templates/delete)
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
