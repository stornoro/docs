---
title: Get Declaration
description: Retrieve detailed information for a specific tax declaration
method: GET
endpoint: /api/v1/declarations/{uuid}
---

# Get Declaration

Retrieves the full details of a specific tax declaration, including its fiscal data payload, metadata, and current ANAF submission state.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the declaration to retrieve |

## Request

```bash {% title="cURL" %}
curl -X GET https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
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
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d394",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "accepted",
  "data": {
    "totalSalesBase": "84033.61",
    "totalSalesVat": "15966.39",
    "totalPurchasesBase": "42016.81",
    "totalPurchasesVat": "7983.19",
    "invoiceCount": 47
  },
  "metadata": {
    "generatedAt": "2026-02-10T08:05:00Z",
    "invoiceCountAtGeneration": 47
  },
  "errorMessage": null,
  "anafUploadId": "5000012345",
  "xmlPath": "declarations/2026/01/d394-2026-01.xml",
  "recipisaPath": "declarations/2026/01/d394-2026-01-recipisa.pdf",
  "createdAt": "2026-02-10T08:00:00Z",
  "updatedAt": "2026-02-10T09:15:00Z",
  "createdBy": "user-uuid-here"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `type` | string | Declaration type: `d394`, `d300`, `d390`, `d100`, `d112` |
| `year` | integer | Fiscal year |
| `month` | integer | Fiscal month (1–12) |
| `periodType` | string \| null | Period type (e.g., `monthly`, `quarterly`) |
| `status` | string | Current status: `draft`, `validated`, `submitted`, `processing`, `accepted`, `rejected`, `error` |
| `data` | object | Declaration payload — fiscal figures auto-populated from invoices; structure varies by declaration type |
| `metadata` | object | System metadata such as generation timestamp and source invoice counts |
| `errorMessage` | string \| null | Error details when status is `rejected` or `error` |
| `anafUploadId` | string \| null | ANAF upload index number assigned after submission |
| `xmlPath` | string \| null | Internal storage path of the generated XML file |
| `recipisaPath` | string \| null | Internal storage path of the ANAF recipisa PDF |
| `createdAt` | string | ISO 8601 timestamp of creation |
| `updatedAt` | string | ISO 8601 timestamp of last update |
| `createdBy` | string \| null | UUID of the user who created the declaration |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Declaration not found or doesn't belong to the company |
| 500 | `internal_error` | Server error occurred |
