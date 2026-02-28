---
title: Download invoice PDF
description: Download or generate the PDF representation of an invoice
---

# Download invoice PDF

Downloads the PDF representation of an invoice. If the PDF has not been generated yet, it will be created on-demand.

```
GET /api/v1/invoices/{uuid}/pdf
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

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | application/pdf | PDF content type |
| `Content-Disposition` | inline; filename="FAC-2024-001.pdf" | Display inline or download |
| `Content-Length` | {size} | File size in bytes |
| `X-Generated-At` | 2024-02-15T09:00:00Z | When the PDF was generated |

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

## When is PDF generated

The PDF is generated automatically or on-demand:

1. **Automatic** - When invoice is issued
2. **On-demand** - First time this endpoint is called
3. **Regeneration** - When invoice is updated and reissued

## Performance

- **First generation**: 1-3 seconds
- **Cached PDF**: < 100ms
- **Complex invoices** (50+ lines): 3-5 seconds

For large invoices, consider using asynchronous generation:

```javascript
// Check if PDF exists
const invoice = await fetch('/api/v1/invoices/{uuid}').then(r => r.json());

if (invoice.pdfGenerated) {
  // Download immediately
  window.open('/api/v1/invoices/{uuid}/pdf', '_blank');
} else {
  // Show loading state and poll
  await generatePdf();
}
```

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to company |
| `404` | Invoice not found |
| `422` | Invoice cannot be rendered as PDF (invalid data) |
| `500` | PDF generation failed (temporary error) |

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
