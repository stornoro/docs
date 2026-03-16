---
title: Upload Declaration XML
description: Upload an XML file to create a declaration by parsing type and period from its contents
method: POST
endpoint: /api/v1/declarations/upload
---

# Upload Declaration XML

Creates a new tax declaration by uploading an existing XML file. The server parses the XML to automatically extract the declaration type, fiscal year, and period. This is useful for importing declarations that were generated externally or by other accounting software.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `multipart/form-data` |

## Request Body

Multipart form data.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | The XML declaration file to upload. Must be a valid ANAF-formatted XML document |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/declarations/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -F "file=@/path/to/D394_2026_01.xml"
```

```javascript {% title="JavaScript" %}
const formData = new FormData();
formData.append('file', xmlFileBlob, 'D394_2026_01.xml');

const response = await fetch('https://api.storno.ro/api/v1/declarations/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  },
  body: formData
});

const data = await response.json();
```

## Response

Returns `201 Created` with the new declaration object. The declaration is created in `draft` status with `data` parsed from the uploaded XML.

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d394",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "draft",
  "data": {
    "totalSalesBase": "84033.61",
    "totalSalesVat": "15966.39",
    "totalPurchasesBase": "42016.81",
    "totalPurchasesVat": "7983.19",
    "invoiceCount": 47
  },
  "metadata": {
    "source": "upload",
    "originalFilename": "D394_2026_01.xml",
    "uploadedAt": "2026-02-10T08:00:00Z"
  },
  "errorMessage": null,
  "anafUploadId": null,
  "xmlPath": "declarations/2026/01/d394-2026-01-uploaded.xml",
  "recipisaPath": null,
  "createdAt": "2026-02-10T08:00:00Z",
  "updatedAt": "2026-02-10T08:00:00Z",
  "createdBy": "user-uuid-here"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier of the created declaration |
| `type` | string | Declaration type parsed from the XML |
| `year` | integer | Fiscal year parsed from the XML |
| `month` | integer | Fiscal month parsed from the XML |
| `periodType` | string \| null | Period type parsed from the XML |
| `status` | string | Always `draft` after upload |
| `data` | object | Fiscal data parsed from the uploaded XML |
| `metadata` | object | Upload metadata including original filename and upload timestamp |
| `xmlPath` | string | Internal storage path where the uploaded XML file is stored |
| `recipisaPath` | string \| null | Always `null` after upload |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 last-updated timestamp |
| `createdBy` | string | UUID of the authenticated user |

## Validation Rules

- The uploaded file must be a valid XML document
- The XML must contain recognizable ANAF declaration structure with a parseable type and period
- A declaration of the same type, year, and month must not already exist for the company

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | No file provided or file is not valid XML |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 409 | `conflict` | A declaration for the parsed type and period already exists |
| 422 | `validation_error` | XML does not contain a recognizable declaration type or period |
| 500 | `internal_error` | Server error occurred |
