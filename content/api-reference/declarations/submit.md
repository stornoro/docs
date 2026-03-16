---
title: Submit Declaration
description: Submit a validated declaration to ANAF SPV and begin asynchronous status polling
method: POST
endpoint: /api/v1/declarations/{uuid}/submit
---

# Submit Declaration

Submits a `validated` declaration to the ANAF SPV (Spatiul Privat Virtual). The XML is uploaded to ANAF, the declaration transitions to `submitted` status, and asynchronous polling begins to track the processing result. When ANAF finishes processing, the status is updated to `accepted`, `rejected`, or `error`.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the declaration to submit |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/submit', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

Returns the updated declaration object in `submitted` status with the ANAF upload ID assigned.

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d394",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "submitted",
  "data": {
    "totalSalesBase": "84033.61",
    "totalSalesVat": "15966.39",
    "totalPurchasesBase": "42016.81",
    "totalPurchasesVat": "7983.19",
    "invoiceCount": 47
  },
  "metadata": {
    "generatedAt": "2026-02-10T08:00:00Z",
    "validatedAt": "2026-02-10T08:10:00Z",
    "submittedAt": "2026-02-10T08:15:00Z"
  },
  "errorMessage": null,
  "anafUploadId": "5000012345",
  "xmlPath": "declarations/2026/01/d394-2026-01.xml",
  "recipisaPath": null,
  "createdAt": "2026-02-10T08:00:00Z",
  "updatedAt": "2026-02-10T08:15:00Z",
  "createdBy": "user-uuid-here"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `type` | string | Declaration type |
| `year` | integer | Fiscal year |
| `month` | integer | Fiscal month |
| `periodType` | string \| null | Period type |
| `status` | string | `submitted` immediately after upload to ANAF |
| `data` | object | The fiscal data included in the submission |
| `metadata` | object | Updated metadata including `submittedAt` timestamp |
| `errorMessage` | string \| null | `null` on successful upload; may be populated if ANAF communication fails |
| `anafUploadId` | string | ANAF-assigned upload index number for tracking the submission |
| `xmlPath` | string | Internal storage path of the submitted XML file |
| `recipisaPath` | string \| null | `null` until ANAF accepts the declaration |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 timestamp of this submission |

## Restrictions

- The declaration must be in `validated` status
- The company must have valid ANAF SPV credentials configured
- ANAF processing is asynchronous — the final `accepted`/`rejected` status is determined by polling

## Status After Submission

After calling this endpoint, the declaration progresses through these states automatically:

1. `submitted` — XML uploaded to ANAF SPV; `anafUploadId` assigned
2. `processing` — ANAF has acknowledged receipt and is processing
3. `accepted` — ANAF accepted the filing; recipisa downloaded and stored
4. `rejected` — ANAF rejected the filing; `errorMessage` contains the reason
5. `error` — A communication or system error interrupted status tracking

Use [refresh-statuses](/api-reference/declarations/refresh-statuses) to force an immediate status check, or poll [GET /api/v1/declarations/{uuid}](/api-reference/declarations/get) periodically.

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Declaration not found or doesn't belong to the company |
| 409 | `conflict` | Declaration is not in validated status |
| 502 | `anaf_error` | ANAF SPV returned an error or was unreachable |
| 500 | `internal_error` | Server error occurred |
