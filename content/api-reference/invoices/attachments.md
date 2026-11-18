---
title: Download invoice attachment
description: Download a file attached to an invoice
---

# Download invoice attachment

Downloads a file attached to an invoice. Attachments are the additional files that came with a received e-Factura invoice synced from ANAF. The API has no endpoint to upload attachments.

```
GET /api/v1/invoices/{uuid}/attachments/{attachmentId}
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
| `attachmentId` | string | Yes | Attachment UUID |

## Finding attachment IDs

Get attachment IDs from the `attachments` array of the [invoice details](/api-reference/invoices/get) response:

```javascript
const invoice = await fetch('/api/v1/invoices/{uuid}').then(r => r.json());
invoice.attachments.forEach(attachment => {
  console.log(`${attachment.filename} - ${attachment.id}`);
});
```

Each attachment object has `id`, `filename`, `mimeType`, `description` and `size` (bytes).

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/attachments/4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -o contract.pdf
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/attachments/4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', {
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
a.download = 'contract.pdf';
a.click();

// Or open in new tab
window.open(url, '_blank');
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the file as binary data with status `200`.

### Response headers

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | {mimeType} | MIME type of the file |
| `Content-Disposition` | attachment; filename="{filename}" | Original filename |
| `Content-Length` | {size} | File size in bytes, when known |
| `Cache-Control` | private, max-age=3600 | The response can be cached by the client for one hour |

## Error codes

Error bodies are `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No permission to view the invoice |
| `404` | Invoice or attachment not found, or the attachment has no stored content |

## Use cases

- **Audit trail** - Download supporting documents for review
- **Client portal** - Allow clients to download attachments
- **Accounting** - Retrieve documents for bookkeeping
- **Archive** - Download all attachments for backup
- **Compliance** - Access documents for tax audits

## Related endpoints

- [Get invoice details](/api-reference/invoices/get) - View all attachments and their metadata
