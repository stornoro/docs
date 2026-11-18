---
title: List email templates
description: Retrieve all email templates for the authenticated company.
---

# List email templates

Retrieves the email templates of one category for the company. If the company has none in that category, a default template is created and returned.

```http
GET /api/v1/email-templates
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Conditional | Company UUID. Optional when the organization has a single company. The `?company=` query parameter is also accepted |

## Query parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `category` | string | No | `invoice`, `delivery_note` or `receipt`. Default `invoice`. Any other value is treated as `invoice` |

## Response

Returns `data`, an array of templates, and `availableVariables`, the placeholders valid for the requested category.

### Email Template Object

Each template has these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Template UUID |
| `name` | string | Template name |
| `subject` | string | Email subject line (supports variables) |
| `body` | string | Email body (supports variables) |
| `isDefault` | boolean | Whether this is the default template of its category |
| `category` | string | `invoice`, `delivery_note` or `receipt` |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/email-templates' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "name": "Factura standard",
      "subject": "Factura [[invoice_number]] - [[company_name]]",
      "body": "Stimate/Stimata **[[client_name]]**,\n\nVa transmitem alaturat factura **nr. [[invoice_number]]**, in valoare de **[[total]] [[currency]]**.\n\nData scadenta: [[due_date]]\n\nCu stima,\n**[[company_name]]**",
      "isDefault": true,
      "category": "invoice"
    },
    {
      "id": "8d0f7780-8536-41ef-a55c-f18bd2c01bf8",
      "name": "Factura cu reminder",
      "subject": "Reminder: Factura [[invoice_number]] scadenta",
      "body": "Buna ziua [[client_name]],\n\nVa reamintim ca factura [[invoice_number]] in valoare de [[total]] [[currency]] este scadenta pe [[due_date]].\n\nMultumim,\n[[company_name]]",
      "isDefault": false,
      "category": "invoice"
    }
  ],
  "availableVariables": [
    "[[client_name]]",
    "[[invoice_number]]",
    "[[total]]",
    "[[due_date]]",
    "[[issue_date]]",
    "[[company_name]]",
    "[[balance]]",
    "[[client_outstanding]]",
    "[[currency]]"
  ]
}
```

## Available Variables

Templates support these placeholders in `subject` and `body`. The syntax is double square brackets:

| Variable | Description | Example |
|----------|-------------|---------|
| `[[client_name]]` | Client name | Acme Corporation SRL |
| `[[invoice_number]]` | Invoice number | FAC00245 |
| `[[total]]` | Total amount | 2380.00 |
| `[[currency]]` | Currency code | RON |
| `[[issue_date]]` | Issue date, `dd.mm.yyyy` | 15.02.2026 |
| `[[due_date]]` | Due date, `dd.mm.yyyy` | 15.03.2026 |
| `[[balance]]` | Amount still to pay | 2380.00 |
| `[[client_outstanding]]` | Total outstanding for the client | 4760.00 |
| `[[company_name]]` | Your company name | My Company SRL |

Templates of category `delivery_note` use `[[client_name]]`, `[[delivery_note_number]]`, `[[total]]`, `[[issue_date]]`, `[[company_name]]` and `[[currency]]`. Templates of category `receipt` use `[[client_name]]`, `[[receipt_number]]`, `[[total]]`, `[[issue_date]]`, `[[company_name]]` and `[[currency]]`.

## Auto-Seeding

If the company has no template in the requested category, a default template with Romanian content is created on the first request.

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Missing the `email_template.view` permission |
| 404 | Company not found. The company could not be resolved from `X-Company` or `?company=` |

## Important Notes

- Only one template per category can be the default
- Variables are replaced when the email is sent

## Related Endpoints

- [Create email template](/api-reference/email-templates/create)
- [Update email template](/api-reference/email-templates/update)
- [Delete email template](/api-reference/email-templates/delete)
