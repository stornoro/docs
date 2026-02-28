---
title: Export invoices to ZIP
description: Export invoices with PDF and XML files to a ZIP archive
---

# Export invoices to ZIP

Creates a ZIP archive containing invoice data, PDFs, and XML files. This endpoint processes the export asynchronously and returns a download URL when ready.

```
POST /api/v1/invoices/export/zip
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `invoiceIds` | array | Yes | Array of invoice UUIDs (max 100) |
| `includePdf` | boolean | No | Include PDF files (default: true) |
| `includeXml` | boolean | No | Include XML files (default: true) |
| `includeCsv` | boolean | No | Include CSV summary (default: true) |
| `folderStructure` | string | No | Folder organization: `flat`, `by-client`, `by-month`, `by-series` (default: flat) |

{% callout type="info" %}
The export is processed asynchronously - you'll receive a download URL when the archive is ready.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/invoices/export/zip \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceIds": [
      "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "8d9e7679-8425-40de-944b-e07fc1f90ae8",
      "9e9e8679-9425-40de-944b-e07fc1f90ae9"
    ],
    "includePdf": true,
    "includeXml": true,
    "includeCsv": true,
    "folderStructure": "by-client"
  }'
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/export/zip', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    invoiceIds: [
      '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      '8d9e7679-8425-40de-944b-e07fc1f90ae8',
      '9e9e8679-9425-40de-944b-e07fc1f90ae9'
    ],
    includePdf: true,
    includeXml: true,
    includeCsv: true,
    folderStructure: 'by-client'
  })
});

const result = await response.json();

// Poll for completion or wait for webhook
if (result.status === 'completed') {
  window.open(result.downloadUrl, '_blank');
} else {
  // Poll status endpoint
  await pollExportStatus(result.exportId);
}
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns export job details. The export is processed asynchronously.

### Immediate response (export queued)

```json
{
  "exportId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "status": "processing",
  "totalInvoices": 3,
  "progress": 0,
  "estimatedCompletionTime": "2024-02-16T15:05:00Z",
  "createdAt": "2024-02-16T15:00:00Z",
  "statusUrl": "/api/v1/exports/a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
}
```

### Completed response (for small exports)

```json
{
  "exportId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "status": "completed",
  "filename": "invoices-2024-02-16.zip",
  "downloadUrl": "https://cdn.storno.ro/exports/a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d/invoices-2024-02-16.zip",
  "expiresAt": "2024-02-23T15:00:00Z",
  "fileSize": 2457600,
  "totalInvoices": 3,
  "filesIncluded": {
    "pdf": 3,
    "xml": 3,
    "csv": 1
  },
  "createdAt": "2024-02-16T15:00:00Z",
  "completedAt": "2024-02-16T15:00:15Z"
}
```

## Polling for completion

Poll the status URL until the export is complete:

```javascript
async function pollExportStatus(exportId) {
  const maxAttempts = 60;
  const pollInterval = 5000; // 5 seconds

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`/api/v1/exports/${exportId}`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'X-Company': '550e8400-e29b-41d4-a716-446655440000'
      }
    });

    const status = await response.json();

    if (status.status === 'completed') {
      return status.downloadUrl;
    } else if (status.status === 'failed') {
      throw new Error(status.error);
    }

    // Update progress bar
    updateProgress(status.progress);

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Export timeout');
}
```

## Webhook notification (recommended)

Instead of polling, configure a webhook to be notified when the export is ready:

```json
{
  "event": "export.completed",
  "exportId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "downloadUrl": "https://cdn.storno.ro/exports/.../invoices.zip",
  "expiresAt": "2024-02-23T15:00:00Z"
}
```

## ZIP structure

The ZIP archive organization depends on the `folderStructure` parameter:

### Flat structure (default)

```
invoices-2024-02-16.zip
├── invoices.csv
├── FAC-2024-001.pdf
├── FAC-2024-001.xml
├── FAC-2024-002.pdf
├── FAC-2024-002.xml
└── FAC-2024-003.pdf
```

### By client structure

```
invoices-2024-02-16.zip
├── invoices.csv
├── Acme Corporation SRL/
│   ├── FAC-2024-001.pdf
│   └── FAC-2024-001.xml
├── Beta Industries SRL/
│   ├── FAC-2024-002.pdf
│   └── FAC-2024-002.xml
└── Gamma Trading SRL/
    ├── FAC-2024-003.pdf
    └── FAC-2024-003.xml
```

### By month structure

```
invoices-2024-02-16.zip
├── invoices.csv
├── 2024-01/
│   ├── FAC-2024-001.pdf
│   └── FAC-2024-001.xml
├── 2024-02/
│   ├── FAC-2024-002.pdf
│   ├── FAC-2024-002.xml
│   ├── FAC-2024-003.pdf
│   └── FAC-2024-003.xml
```

### By series structure

```
invoices-2024-02-16.zip
├── invoices.csv
├── FAC/
│   ├── FAC-2024-001.pdf
│   ├── FAC-2024-001.xml
│   ├── FAC-2024-002.pdf
│   └── FAC-2024-002.xml
└── PRO/
    ├── PRO-2024-001.pdf
    └── PRO-2024-001.xml
```

## Export status values

| Status | Description |
|--------|-------------|
| `queued` | Export job is queued |
| `processing` | Export is being created |
| `completed` | Export is ready for download |
| `failed` | Export failed (see error field) |
| `expired` | Download link has expired |

## Download expiration

- ZIP files expire after **7 days**
- Download URLs are valid for **7 days**
- After expiration, create a new export

## Performance

| Invoice count | Typical processing time |
|--------------|------------------------|
| < 10 | Immediate (< 1 second) |
| 10-50 | 5-15 seconds |
| 50-100 | 15-30 seconds |

## Limitations

- **Maximum invoices** - 100 invoices per export
- **Rate limiting** - 5 exports per hour per company
- **Storage duration** - 7 days
- **Concurrent exports** - 2 active exports per company

For more than 100 invoices, create multiple exports or contact support for bulk export options.

## Error codes

| Code | Description |
|------|-------------|
| `400` | Validation error - missing or invalid parameters |
| `401` | Missing or invalid authentication token |
| `403` | No access to company |
| `404` | One or more invoices not found |
| `413` | Too many invoices (max 100) |
| `422` | Some invoices have no PDF/XML generated |
| `429` | Rate limit exceeded |
| `500` | Export service temporarily unavailable |

## Error handling

```javascript
try {
  const response = await fetch('/api/v1/invoices/export/zip', {
    method: 'POST',
    body: JSON.stringify({ invoiceIds: [...] })
  });

  if (!response.ok) {
    const error = await response.json();

    if (response.status === 413) {
      // Split into multiple exports
      createMultipleExports(invoiceIds);
    } else {
      throw new Error(error.message);
    }
  }

  const result = await response.json();
  await pollExportStatus(result.exportId);
} catch (error) {
  console.error('Export failed:', error);
}
```

## Related endpoints

- [Export to CSV](/api-reference/invoices/export-csv) - Simple CSV export
- [Download PDF](/api-reference/invoices/pdf) - Download single PDF
- [Download XML](/api-reference/invoices/xml) - Download single XML
- [List invoices](/api-reference/invoices/list) - Get invoice IDs for export
