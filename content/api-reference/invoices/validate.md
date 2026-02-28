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
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Query parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | string | quick | Validation mode: `quick` or `full` |

### Validation modes

- **quick** - Fast validation against basic business rules and data integrity
- **full** - Comprehensive validation including Schematron rules and UBL 2.1 schema compliance

{% callout type="info" %}
The `full` validation mode can take several seconds for complex invoices. Use `quick` mode for real-time validation feedback in the UI.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
# Quick validation
curl -X POST "https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/validate?mode=quick" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"

# Full validation
curl -X POST "https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/validate?mode=full" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
// Quick validation
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/validate?mode=quick', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const validation = await response.json();

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns validation results with any errors or warnings found.

### Valid invoice response

```json
{
  "valid": true,
  "errors": [],
  "warnings": []
}
```

### Invalid invoice response

```json
{
  "valid": false,
  "errors": [
    "Client VAT number (CIF) is required for invoices over 1000 RON",
    "Invoice line 1: Unit price must be greater than zero",
    "Due date cannot be before issue date"
  ],
  "warnings": [
    "No payment terms specified",
    "Internal note is very long (over 500 characters)"
  ]
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether the invoice passes all validation checks |
| `errors` | array | Critical validation errors that must be fixed |
| `warnings` | array | Non-critical issues or suggestions |

## Validation rules

### Quick mode checks

- Required fields are present (client, issue date, lines)
- Numeric values are valid (positive amounts, valid percentages)
- Date logic (due date after issue date)
- Line item calculations are correct
- VAT rates are valid
- Currency code is valid
- Client and supplier information is complete
- Total amounts match line item sums

### Full mode additional checks

- UBL 2.1 schema compliance
- Schematron business rules (EN 16931)
- Cross-field validation rules
- Romanian e-Factura specific rules
- Tax identification number formats
- Address format validation
- Payment terms codelist compliance
- Unit of measure codelist compliance

## Common validation errors

| Error | Description | Solution |
|-------|-------------|----------|
| Missing client CIF | VAT identification number required | Add client CIF/VAT number |
| Invalid VAT rate | VAT rate not in allowed list | Use a valid VAT rate (0, 5, 9, 19) |
| Negative amounts | Line price or quantity is negative | Use positive values |
| Date mismatch | Due date before issue date | Adjust dates |
| Missing lines | Invoice has no line items | Add at least one line |
| Invalid currency | Currency code not ISO 4217 | Use valid 3-letter code (RON, EUR, USD) |
| Total mismatch | Calculated total doesn't match line sums | Recalculate line items |

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Invoice not found |
| `422` | Invalid validation mode parameter |

## Related endpoints

- [Issue invoice](/api-reference/invoices/issue) - Issue invoice after validation passes
- [Submit invoice](/api-reference/invoices/submit) - Submit validated invoice to e-invoice provider
- [Update invoice](/api-reference/invoices/update) - Fix validation errors
