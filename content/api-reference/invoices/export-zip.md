---
title: Export invoices to ZIP
description: Export invoices with PDF and XML files to a ZIP archive
---

# Export invoices to ZIP

Queues the creation of a ZIP archive with the XML, signature and PDF files of the selected invoices. The request returns `202 Accepted` at once. When the archive is ready, the user who made the request receives an `export_ready` notification whose link points to the download.

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
| `ids` | array | Yes | Array of invoice UUIDs, 1 to 100 |

Invoices that do not belong to the company in `X-Company`, and cancelled invoices, are left out of the archive without an error. When nothing is left, no archive is created.

{% callout type="info" %}
The export is processed asynchronously. The response does not contain a download URL.
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
    "ids": [
      "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "8d9e7679-8425-40de-944b-e07fc1f90ae8",
      "9e9e8679-9425-40de-944b-e07fc1f90ae9"
    ]
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
    ids: [
      '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      '8d9e7679-8425-40de-944b-e07fc1f90ae8',
      '9e9e8679-9425-40de-944b-e07fc1f90ae9'
    ]
  })
});

const result = await response.json();
// result.message confirms the export was queued.
// The archive is announced by a notification when it is ready.
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns `202 Accepted`.

```json
{
  "message": "Export-ul este in curs de procesare."
}
```

## Getting the archive

When the archive is ready, a notification of type `export_ready` is created for the requesting user. Its link and `downloadUrl` data field point to `/v1/exports/{id}.zip`, which is served by the [download export](/api-reference/exports/download) endpoint. A download deletes the file, so each archive can be fetched once.

## ZIP structure

The archive has one folder per invoice, named after the invoice number:

```
facturi-2024-02-16.zip
├── FAC-2024-001/
│   ├── FAC-2024-001.xml
│   ├── FAC-2024-001.p7s
│   └── FAC-2024-001.pdf
└── FAC-2024-002/
    ├── FAC-2024-002.xml
    └── FAC-2024-002.pdf
```

The `.p7s` signature file is present only for invoices that have a stored ANAF signature. The XML is the stored file or is generated when missing, and the PDF is generated when it is not cached.

## Limitations

- At most 100 invoice ids per request
- Cancelled invoices are not included

## Error codes

Error bodies are `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `400` | `ids` is missing or empty, or contains more than 100 ids |
| `401` | Missing or invalid authentication token |
| `403` | No permission to view invoices |
| `404` | Company not found |

## Related endpoints

- [Export to CSV](/api-reference/invoices/export-csv) - Simple CSV export
- [Download PDF](/api-reference/invoices/pdf) - Download single PDF
- [Download XML](/api-reference/invoices/xml) - Download single XML
- [List invoices](/api-reference/invoices/list) - Get invoice IDs for export
