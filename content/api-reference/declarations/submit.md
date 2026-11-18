---
title: Submit Declaration
description: Submit a validated declaration to ANAF SPV and begin asynchronous status polling
method: POST
endpoint: /api/v1/declarations/{uuid}/submit
---

# Submit Declaration

Submits a `draft` or `validated` declaration to ANAF. The XML is uploaded during the request. When ANAF takes it, the declaration moves to `processing` and `anafUploadId` is set; when the upload fails, it moves to `error` and `errorMessage` says why. The request still answers 200 in both cases, so check `status`. A background check then follows the processing result and sets `accepted` or `rejected`.

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

Returns the declaration object.

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d300",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "processing",
  "data": {
    "layout": "v2026",
    "rows": { "R9_1": 84034, "R9_2": 17647 },
    "warnings": []
  },
  "metadata": {
    "uploadResult": { "id_solicitare": "5000012345" }
  },
  "anafUploadId": "5000012345",
  "errorMessage": null,
  "submittedAt": null,
  "acceptedAt": null,
  "companyId": "company-uuid-here",
  "dosarId": null
}
```

## Response fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `processing` after a successful upload, `error` when the upload failed |
| `anafUploadId` | string \| null | ANAF upload index number used for tracking the submission |
| `errorMessage` | string \| null | `null` on a successful upload; the failure reason when `status` is `error` |
| `metadata` | object \| null | Includes `uploadResult`, the answer ANAF returned |

The other fields are the ones described in [get declaration](/api-reference/declarations/get).

## Restrictions

- The declaration must be in `draft` or `validated` status
- Another declaration of the same type and period must not already be `submitted` or `processing`
- The company must have a valid ANAF token

## Status after submission

1. `processing`: ANAF has the upload and `anafUploadId` is set
2. `accepted`: ANAF accepted the filing; the recipisa is stored when it could be downloaded
3. `rejected`: ANAF rejected the filing; `errorMessage` contains the reason
4. `error`: the upload or the status tracking failed

Read [GET /api/v1/declarations/{uuid}](/api-reference/declarations/get) to follow the status.

## Error Codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 400 | The declaration is not in `draft` or `validated` status, or a declaration of the same type and period is already submitted |
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the `declaration.submit` permission |
| 404 | Declaration not found or it belongs to another company |
