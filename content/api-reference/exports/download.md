---
title: Download Export
description: Download generated export files
---

# Download Export

Download generated export files (ZIP archives).

---

## Download Export File

```http
GET /api/v1/exports/{filename}
```

Download a generated export file. The file is automatically deleted after serving.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| filename | string | Export filename (e.g., `invoices-export-2026-02.zip`) |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns the file with appropriate headers:

```http
Content-Type: application/zip
Content-Disposition: attachment; filename="invoices-export-2026-02.zip"
```

The response body contains the binary ZIP file data.

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - file belongs to another user/organization |
| 404 | File not found or already downloaded |

### Notes

- Export files are single-use and auto-deleted after download
- Files are stored temporarily (typically 24 hours)
- File access is restricted to the user/organization that generated it
- Filenames are typically formatted as `{type}-export-{date}.zip`
- Common export types include:
  - `invoices-export-{YYYY-MM}.zip` - Monthly invoice exports
  - `vat-report-{YYYY-MM}.zip` - VAT report exports
  - `clients-export-{YYYY-MM-DD}.zip` - Client data exports
  - `products-export-{YYYY-MM-DD}.zip` - Product catalog exports

### Export Generation

Exports are typically generated via separate endpoints:
- Invoice exports: `POST /api/v1/invoices/export`
- VAT reports: `POST /api/v1/reports/vat/export`
- Client exports: `POST /api/v1/clients/export`

These endpoints return a `filename` that can be used with this download endpoint.
