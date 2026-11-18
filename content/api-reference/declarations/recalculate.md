---
title: Recalculate Declaration
description: Recalculate a draft declaration by re-aggregating data from current invoice records
method: POST
endpoint: /api/v1/declarations/{uuid}/recalculate
---

# Recalculate Declaration

Recalculates the fiscal data of a `draft` declaration by re-aggregating invoice data for the declaration's type and period. Use this endpoint after adding, editing, or deleting invoices in the period to ensure the declaration reflects the latest state.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the declaration to recalculate |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/recalculate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/recalculate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

Returns the updated declaration object with freshly calculated `data`.

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d300",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "draft",
  "data": {
    "layout": "v2026",
    "rows": { "R9_1": 91250, "R9_2": 19163 },
    "warnings": []
  },
  "metadata": null,
  "anafUploadId": null,
  "errorMessage": null,
  "submittedAt": null,
  "acceptedAt": null,
  "companyId": "company-uuid-here",
  "dosarId": null
}
```

The fields are the ones described in [get declaration](/api-reference/declarations/get).

## Restrictions

- The declaration must be in `draft` status
- The declaration type must be one that Storno can populate from invoices
- Recalculating always overwrites the current `data` with freshly aggregated values; any manual edits made via PATCH will be replaced

## Error Codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 400 | The declaration is not in `draft` status, or its type has no populator |
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the `declaration.submit` permission |
| 404 | Declaration not found or it belongs to another company |
