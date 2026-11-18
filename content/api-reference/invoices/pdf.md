---
title: Download invoice PDF
description: Download or generate the PDF representation of an invoice
---

# Download invoice PDF

Downloads the PDF of an invoice. A PDF of an outgoing invoice is rendered on every request from the current invoice data and the company's template settings. A received invoice is served from its stored PDF when there is one, otherwise it is rendered from its XML. Plans without PDF generation get `402`.

```
GET /api/v1/invoices/{uuid}/pdf
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


## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -o invoice.pdf
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/pdf', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);

// Download the file
const a = document.createElement('a');
a.href = url;
a.download = 'invoice.pdf';
a.click();

// Or open in new tab
window.open(url, '_blank');
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the PDF file with `Content-Type: application/pdf`.

### Response headers

| Header | Value |
|--------|-------|
| `Content-Type` | `application/pdf` |
| `Content-Disposition` | `inline; filename="invoice-FAC0001.pdf"` |

## PDF features

The generated PDF includes:

### Header section
- Company logo (if configured)
- Supplier details (name, CIF, registration, address)
- Invoice number and issue date
- QR code for quick scanning (optional)

### Client section
- Client/customer details
- Billing address
- Tax identification numbers

### Line items table
- Description, quantity, unit price
- Unit of measure
- VAT rate and amount
- Line totals
- Discount information (if applicable)

### Totals section
- Subtotal (before VAT)
- VAT breakdown by rate
- Total amount due
- Amount paid (if any)
- Balance remaining

### Footer section
- Payment terms and due date
- Bank account details
- Notes and mentions
- Legal footer text
- Page numbers

### Customization options

PDF appearance can be customized in company settings:
- Logo and branding colors
- Template layout (classic, modern, minimal)
- Font and font size
- Show/hide optional fields
- Custom footer text
- Signature image

## Generation

Rendering takes a second or more, longer for invoices with many lines. When the invoice is issued, a PDF is also stored on the invoice; the download of an outgoing invoice does not use it.

## Error codes

Error bodies have the form `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `402` | PDF generation is not available on the plan: `{"error": "...", "code": "PLAN_LIMIT"}` |
| `403` | The invoice belongs to another organization, or the user cannot view invoices |
| `404` | Invoice not found |
| `500` | PDF generation failed |

## Use cases

- Email invoices to clients
- Print physical copies
- Archive for compliance
- Client self-service portal
- Attach to payment reminders
- Accounting system integration

## Related endpoints

- [Download XML](/api-reference/invoices/xml) - Download UBL XML version
- [Email invoice](/api-reference/invoices/email) - Email the PDF to client
- [Issue invoice](/api-reference/invoices/issue) - Generate invoice files
