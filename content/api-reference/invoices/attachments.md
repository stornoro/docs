---
title: Download invoice attachment
description: Download a file attached to an invoice
---

# Download invoice attachment

Downloads a file that was attached to an invoice. Attachments are binary files (PDFs, images, documents) that have been uploaded and associated with the invoice.

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

Get attachment IDs from the [invoice details](/api-reference/invoices/get) endpoint:

```javascript
const invoice = await fetch('/api/v1/invoices/{uuid}').then(r => r.json());

invoice.attachments.forEach(attachment => {
  console.log(`${attachment.filename} - ${attachment.id}`);
});
```

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

Returns the file as binary data with appropriate content type.

### Response headers

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | {mimeType} | MIME type of the file |
| `Content-Disposition` | attachment; filename="{filename}" | Original filename |
| `Content-Length` | {size} | File size in bytes |
| `X-Upload-Date` | 2024-02-15T08:45:00Z | When file was uploaded |

### Common MIME types

| File type | MIME type |
|-----------|-----------|
| PDF | application/pdf |
| JPEG | image/jpeg |
| PNG | image/png |
| Word | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| Excel | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| ZIP | application/zip |
| Text | text/plain |

## Attachment types

Attachments can include:

### Supporting documents
- Purchase orders
- Contracts
- Delivery notes
- Receipts
- Correspondence

### Visual documentation
- Product photos
- Delivery photos
- Signed documents
- Scanned invoices

### Technical files
- Specifications
- Drawings
- CAD files
- Technical data sheets

## Upload attachments

While this endpoint only handles downloads, you can upload attachments via:

```javascript
// Upload attachment
const formData = new FormData();
formData.append('file', fileBlob, 'contract.pdf');
formData.append('description', 'Service contract');

await fetch('/api/v1/invoices/{uuid}/attachments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  },
  body: formData
});
```

## Viewing attachments in invoice details

List all attachments for an invoice:

```javascript
const invoice = await fetch('/api/v1/invoices/{uuid}').then(r => r.json());

invoice.attachments.forEach(attachment => {
  console.log({
    id: attachment.id,
    filename: attachment.filename,
    size: attachment.size,
    mimeType: attachment.mimeType,
    uploadedAt: attachment.uploadedAt
  });
});
```

Example response:

```json
{
  "attachments": [
    {
      "id": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
      "filename": "contract.pdf",
      "mimeType": "application/pdf",
      "size": 245678,
      "uploadedAt": "2024-02-15T08:45:00Z",
      "uploadedBy": {
        "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
        "name": "John Doe"
      },
      "description": "Service contract"
    },
    {
      "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "filename": "delivery-photo.jpg",
      "mimeType": "image/jpeg",
      "size": 128456,
      "uploadedAt": "2024-02-15T14:20:00Z",
      "uploadedBy": {
        "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
        "name": "Jane Smith"
      },
      "description": "Proof of delivery"
    }
  ]
}
```

## Security

### Access control
- Attachments are scoped to company
- Requires valid authentication token
- Only accessible to company members

### File scanning
- All uploads are scanned for malware
- Suspicious files are quarantined
- Safe files are stored encrypted

### Storage
- Files stored on secure cloud storage
- Encrypted at rest and in transit
- Automatic backups

## File size limits

| Plan | Max file size | Max attachments per invoice | Total storage |
|------|--------------|----------------------------|---------------|
| Freemium | 5 MB | 3 | 100 MB |
| Starter | 10 MB | 5 | 500 MB |
| Professional | 25 MB | 10 | 5 GB |
| Business | 50 MB | 25 | 50 GB |

## Performance

Download speeds depend on file size and location:

| File size | Typical download time |
|-----------|---------------------|
| < 1 MB | < 1 second |
| 1-5 MB | 1-3 seconds |
| 5-25 MB | 3-10 seconds |
| 25-50 MB | 10-20 seconds |

Files are served from a CDN for optimal performance.

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Invoice or attachment not found |
| `410` | Attachment was deleted |

## Use cases

- **Audit trail** - Download supporting documents for review
- **Client portal** - Allow clients to download attachments
- **Accounting** - Retrieve documents for bookkeeping
- **Archive** - Download all attachments for backup
- **Compliance** - Access documents for tax audits

## Related endpoints

- [Upload attachment](/api-reference/invoices/upload-attachment) - Upload a file
- [List attachments](/api-reference/invoices/get) - Get attachment metadata
- [Delete attachment](/api-reference/invoices/delete-attachment) - Remove a file
- [Get invoice details](/api-reference/invoices/get) - View all attachments
