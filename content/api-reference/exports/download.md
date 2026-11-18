---
title: Download Export
description: Request an invoice ZIP export and download the generated file
---

# Download Export

A ZIP export of invoices is generated in the background. You request it, wait for the `export_ready` notification, then download the file once.

---

## Request an export

```http
POST /api/v1/invoices/export/zip
```

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token or API key |
| X-Company | string | Yes | Company UUID |
| Content-Type | string | Yes | `application/json` |

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ids | array of string | Yes | Invoice UUIDs, between 1 and 100 |

The caller needs the `invoice.view` permission.

### Response

`202 Accepted`:

```json
{
  "message": "Export-ul este in curs de procesare."
}
```

The response does not contain a filename. When the file is ready, the user who made the request gets a notification of type `export_ready`. Its data holds `downloadUrl`, `filename`, `storagePath` and `companyId`. See [Notifications](/api-reference/notifications/list) for reading notifications.

### Error responses

| Status | Description |
|--------|-------------|
| 400 | No invoice IDs provided, or more than 100 |
| 403 | Permission denied |
| 404 | Company not found |

---

## Download Export File

```http
GET /api/v1/exports/{filename}
```

Download a generated export file. The file is deleted from storage after it is served, so the download works once.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| filename | string | Export filename, ending in `.zip`. Generated names are a UUID, for example `0192f3a4-5b6c-7d8e-9f01-23456789abcd.zip` |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token or API key |

### Response

Returns the file with these headers:

```http
Content-Type: application/zip
Content-Disposition: attachment; filename="0192f3a4-5b6c-7d8e-9f01-23456789abcd.zip"
```

The response body is the binary ZIP file.

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized, invalid authentication |
| 402 | Export is not available on the plan (`PLAN_LIMIT`). Import and export need the Starter plan or higher |
| 403 | The caller lacks the `export.data` permission |
| 404 | File not found, or already downloaded |
