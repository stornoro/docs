---
title: Validate invoice
description: Validate invoice data before issuing or submitting
---

# Validate invoice

Validates invoice data against business rules and optionally against the full UBL Schematron validation rules. Use this endpoint to check for errors before issuing or submitting an invoice.

```
POST /api/v1/invoices/{uuid}/validate
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not used on this route: the invoice is found by its UUID |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Request body

The mode is read from the JSON body. A query parameter is ignored. Without a body, `quick` is used.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | string | `quick` | `quick` or `full`. Any value other than `full` runs the quick validation |

### Validation modes

- **quick**: business rules and XSD schema validation of the generated UBL XML.
- **full**: the quick checks plus Schematron validation (EN 16931 and CIUS-RO rules). Schematron is skipped when the XSD check already fails, and it needs the Schematron service (`schematronAvailable` in the response).

{% callout type="info" %}
The `full` mode can take several seconds for complex invoices. Use `quick` for real-time feedback in a UI.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
# Quick validation
curl -X POST "https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/validate" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Full validation
curl -X POST "https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/validate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "full"}'
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/validate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ mode: 'full' })
});

const validation = await response.json();
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Always `200 OK` for an existing invoice, whether or not it is valid.

### Valid invoice response

```json
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "schematronAvailable": true
}
```

### Invalid invoice response

```json
{
  "valid": false,
  "errors": [
    {
      "message": "Client tax identifier is missing",
      "source": "business",
      "ruleId": null,
      "location": null
    }
  ],
  "warnings": [],
  "schematronAvailable": true
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether the invoice passes all checks of the chosen mode |
| `errors` | array | Errors that must be fixed. Each has `message` and, when known, `source`, `ruleId` and `location` (keys with no value are left out) |
| `warnings` | array | Non-critical findings |
| `schematronAvailable` | boolean | Whether the Schematron service is available on the server |

## Error codes

Error bodies have the form `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | The invoice belongs to another organization, or the user cannot view invoices |
| `404` | Invoice not found |

## Related endpoints

- [Issue invoice](/api-reference/invoices/issue) - Issue the invoice once it is valid
- [Submit invoice](/api-reference/invoices/submit) - Send an issued invoice to ANAF
- [Update invoice](/api-reference/invoices/update) - Fix validation errors
