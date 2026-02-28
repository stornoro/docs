---
title: Issue invoice
description: Issue a draft invoice and generate XML/PDF
---

# Issue invoice

Issues a draft invoice by validating the data, generating the UBL 2.1 XML file, generating the PDF representation, and optionally scheduling e-invoice provider submission. Changes the invoice status from `draft` to `issued`.

```
POST /api/v1/invoices/{uuid}/issue
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

## What happens when you issue an invoice

1. **Validation** - The invoice data is validated against business rules and UBL schema
2. **Number assignment** - If the invoice number is not yet assigned, it gets the next number from the series
3. **XML generation** - A UBL 2.1 compliant XML file is generated
4. **PDF generation** - A formatted PDF invoice is generated
5. **Status change** - The invoice status changes from `draft` to `issued`
6. **Event logging** - An issue event is recorded in the invoice timeline

Once issued, the invoice cannot be edited or deleted - only cancelled.

{% callout type="info" %}
This endpoint does not automatically submit to the e-invoice provider. Use the [submit endpoint](/api-reference/invoices/submit) to send the invoice to the provider.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/issue \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/issue', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const invoice = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the updated invoice object with status `issued`.

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "number": "FAC-2024-001",
  "status": "issued",
  "direction": "outgoing",
  "currency": "RON",
  "issueDate": "2024-02-15",
  "dueDate": "2024-03-15",
  "subtotal": 1000.00,
  "vatTotal": 190.00,
  "total": 1190.00,
  "amountPaid": 0.00,
  "balance": 1190.00,
  "client": {
    "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "name": "Acme Corporation SRL",
    "cif": "RO98765432"
  },
  "xmlGenerated": true,
  "xmlPath": "/storage/invoices/2024/02/7c9e6679-xml.xml",
  "pdfGenerated": true,
  "pdfPath": "/storage/invoices/2024/02/7c9e6679-pdf.pdf",
  "events": [
    {
      "id": "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
      "type": "status_change",
      "status": "issued",
      "timestamp": "2024-02-15T09:00:00Z",
      "details": "Invoice issued successfully"
    }
  ],
  "updatedAt": "2024-02-15T09:00:00Z"
}
```

## Error codes

| Code | Description |
|------|-------------|
| `400` | Validation error - invoice data is invalid or incomplete |
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Invoice not found |
| `409` | Invoice is already issued or cannot be issued in current status |
| `422` | Business validation error (e.g., missing required fields, invalid amounts) |

## Common validation errors

- Missing or invalid client information
- Missing invoice lines
- Negative or zero line quantities
- Invalid VAT rates
- Invalid currency code
- Missing required tax identification numbers
- Issue date in the future
- Due date before issue date

## Related endpoints

- [Validate invoice](/api-reference/invoices/validate) - Validate invoice before issuing
- [Submit invoice](/api-reference/invoices/submit) - Submit issued invoice to e-invoice provider
- [Download XML](/api-reference/invoices/xml) - Download the generated XML
- [Download PDF](/api-reference/invoices/pdf) - Download the generated PDF
