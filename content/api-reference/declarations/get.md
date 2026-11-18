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
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d300",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "accepted",
  "data": {
    "layout": "v2026",
    "rows": {
      "R9_1": 84034,
      "R9_2": 17647
    },
    "warnings": []
  },
  "metadata": {
    "dukValidation": {
      "valid": true,
      "validatedAt": "2026-02-10 08:10:00"
    }
  },
  "anafUploadId": "5000012345",
  "errorMessage": null,
  "submittedAt": "2026-02-10T08:15:00+00:00",
  "acceptedAt": "2026-02-10T09:15:00+00:00",
  "companyId": "company-uuid-here",
  "dosarId": null
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Declaration UUID |
| `type` | string | Declaration type: `d394`, `d300`, `d390`, `d392`, `d393`, `d406`, `d100`, `d101`, `d106`, `d112`, `d120`, `d130`, `d180`, `d205`, `d208`, `d212`, `d301`, `d311`, `d398`, `c168` |
| `year` | integer | Fiscal year |
| `month` | integer | Fiscal month (1–12) |
| `periodType` | string | Period type: `monthly`, `quarterly` or `annual` |
| `status` | string | Current status: `draft`, `validated`, `submitted`, `processing`, `accepted`, `rejected`, `error` |
| `data` | object \| null | Declaration payload; the structure depends on the declaration type. Attachments (for example the scanned contract of a C168) carry only `name`, `size`, `mime` and `stored`, never the file content |
| `metadata` | object \| null | System metadata such as the validation result (`dukValidation`), the upload `source` or the ANAF answer (`uploadResult`) |
| `anafUploadId` | string \| null | ANAF upload index number assigned after submission |
| `errorMessage` | string \| null | Error details when status is `rejected` or `error` |
| `submittedAt` | string \| null | ISO 8601 time the declaration was submitted |
| `acceptedAt` | string \| null | ISO 8601 time ANAF accepted it |
| `companyId` | string | UUID of the company |
| `dosarId` | string \| null | UUID of the [dosar](/api-reference/dosare/overview) the declaration belongs to |

## Error Codes

Errors have the body `{"error": "message"}`, with an extra `code` field on some of them.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the `declaration.view` permission |
| 404 | Declaration not found or it belongs to another company |
