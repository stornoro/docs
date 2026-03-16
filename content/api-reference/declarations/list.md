---
title: List Declarations
description: Retrieve a paginated list of tax declarations with optional filtering
method: GET
endpoint: /api/v1/declarations
---

# List Declarations

Retrieves a paginated list of tax declarations for the authenticated company. Declarations cover Romanian fiscal obligations such as D394, D300, D390, D100, and D112 forms.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20, max: 100) |
| `type` | string | No | Filter by declaration type: `d394`, `d300`, `d390`, `d100`, `d112` |
| `status` | string | No | Filter by status: `draft`, `validated`, `submitted`, `processing`, `accepted`, `rejected`, `error` |
| `year` | integer | No | Filter by fiscal year (e.g., 2026) |
| `month` | integer | No | Filter by fiscal month (1–12) |

## Request

```bash {% title="cURL" %}
curl -X GET "https://api.storno.ro/api/v1/declarations?page=1&limit=20&type=d394&year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations?page=1&limit=20&type=d394&year=2026', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

```json
{
  "data": [
    {
      "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "type": "d394",
      "year": 2026,
      "month": 1,
      "periodType": "monthly",
      "status": "accepted",
      "errorMessage": null,
      "anafUploadId": "5000012345",
      "xmlPath": "declarations/2026/01/d394-2026-01.xml",
      "recipisaPath": "declarations/2026/01/d394-2026-01-recipisa.pdf",
      "createdAt": "2026-02-10T08:00:00Z",
      "updatedAt": "2026-02-10T09:15:00Z",
      "createdBy": "user-uuid-here"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of declaration objects |
| `total` | integer | Total number of declarations matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `pages` | integer | Total number of pages |

### Declaration Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `type` | string | Declaration type: `d394`, `d300`, `d390`, `d100`, `d112` |
| `year` | integer | Fiscal year |
| `month` | integer | Fiscal month (1–12) |
| `periodType` | string \| null | Period type (e.g., `monthly`, `quarterly`) |
| `status` | string | Current status: `draft`, `validated`, `submitted`, `processing`, `accepted`, `rejected`, `error` |
| `errorMessage` | string \| null | Error details when status is `rejected` or `error` |
| `anafUploadId` | string \| null | ANAF upload index number assigned after submission |
| `xmlPath` | string \| null | Internal storage path of the generated XML file |
| `recipisaPath` | string \| null | Internal storage path of the ANAF recipisa PDF |
| `createdAt` | string | ISO 8601 timestamp of creation |
| `updatedAt` | string | ISO 8601 timestamp of last update |
| `createdBy` | string \| null | UUID of the user who created the declaration |

## Status Lifecycle

Declarations follow this status flow:

- **draft** — Initial state; data auto-populated from invoices, editable
- **validated** — XML generated and schema-validated; ready for submission
- **submitted** — Uploaded to ANAF SPV; awaiting processing confirmation
- **processing** — ANAF has received and is processing the declaration
- **accepted** — ANAF accepted the declaration; recipisa available
- **rejected** — ANAF rejected the declaration; check `errorMessage` for details
- **error** — A system or communication error occurred during submission

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 422 | `validation_error` | Invalid query parameters (e.g., invalid type or status value) |
| 500 | `internal_error` | Server error occurred |
