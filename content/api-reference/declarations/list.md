---
title: List Declarations
description: Retrieve a paginated list of tax declarations with optional filtering
method: GET
endpoint: /api/v1/declarations
---

# List Declarations

Retrieves a paginated list of tax declarations for the authenticated company. Declarations cover Romanian fiscal obligations such as D394, D300, D390, D100, and D112 forms. Results are ordered by creation date, newest first.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10, max: 20) |
| `type` | string | No | Filter by declaration type: `d394`, `d300`, `d390`, `d392`, `d393`, `d406`, `d100`, `d101`, `d106`, `d112`, `d120`, `d130`, `d180`, `d205`, `d208`, `d212`, `d301`, `d311`, `d398`, `c168` |
| `status` | string | No | Filter by status: `draft`, `validated`, `submitted`, `processing`, `accepted`, `rejected`, `error` |
| `year` | integer | No | Filter by fiscal year (e.g., 2026) |
| `month` | integer | No | Filter by fiscal month (1–12) |

## Request

```bash {% title="cURL" %}
curl -X GET "https://api.storno.ro/api/v1/declarations?page=1&limit=10&type=d394&year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations?page=1&limit=10&type=d394&year=2026', {
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
  "items": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "type": "d394",
      "year": 2026,
      "month": 1,
      "periodType": "monthly",
      "status": "accepted",
      "metadata": {},
      "submittedAt": "2026-02-10T09:00:00+00:00",
      "acceptedAt": "2026-02-10T09:15:00+00:00",
      "companyId": "company-uuid-here",
      "dosarId": null
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 10
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `items` | array | Array of declaration objects |
| `total` | integer | Total number of declarations matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |

### Declaration Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Declaration UUID |
| `type` | string | Declaration type (see the `type` filter above) |
| `year` | integer | Fiscal year |
| `month` | integer | Fiscal month (1–12) |
| `periodType` | string | Period type: `monthly`, `quarterly` or `annual` |
| `status` | string | Current status: `draft`, `validated`, `submitted`, `processing`, `accepted`, `rejected`, `error` |
| `metadata` | object \| null | System metadata (validation result, upload source and similar) |
| `submittedAt` | string \| null | ISO 8601 time the declaration was submitted |
| `acceptedAt` | string \| null | ISO 8601 time ANAF accepted it |
| `companyId` | string | UUID of the company |
| `dosarId` | string \| null | UUID of the [dosar](/api-reference/dosare/overview) the declaration belongs to |

The list leaves out `data`, `anafUploadId` and `errorMessage`; [get declaration](/api-reference/declarations/get) returns them.

## Status Lifecycle

Declarations follow this status flow:

- **draft**: Initial state; data auto-populated from invoices, editable
- **validated**: XML generated and validated; ready for submission
- **submitted**: Submitted to ANAF; awaiting processing confirmation
- **processing**: ANAF has received and is processing the declaration
- **accepted**: ANAF accepted the declaration
- **rejected**: ANAF rejected the declaration; check `errorMessage` on the detail response
- **error**: A system or communication error occurred during submission

## Error Codes

Errors have the body `{"error": "message"}`, with an extra `code` field on some of them.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the `declaration.view` permission |
| 404 | The company was not found |
