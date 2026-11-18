---
title: Update Declaration
description: Update the data or metadata of a draft tax declaration
method: PATCH
endpoint: /api/v1/declarations/{uuid}
---

# Update Declaration

Updates a tax declaration's `data` or `metadata`. Only declarations in `draft` status can be edited. The one exception is `filedExternally`, which records a declaration filed outside Storno.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the declaration to update |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data` | object | No | New fiscal data payload. It replaces the stored `data` as a whole; send the complete object. Attachments sent back without `contentBase64` keep the stored file with the same name |
| `metadata` | object | No | Keys to merge into the stored metadata; keys you do not send are kept |
| `filedExternally` | object | No | `{index, ghiseu?}`: the declaration was filed outside Storno (portal by hand, another program, at the ANAF counter). Storno stores ANAF's number as `anafUploadId`, sets `submitted`, and follows the state on StareD112 (recipisa into the case file). `ghiseu: true` when the number is the counter registration number, not an online upload index. `index` is required. Refused when the declaration is already `submitted`, `processing` or `accepted`. |

Send `data`, `metadata` or `filedExternally`.

## Request

```bash {% title="cURL" %}
curl -X PATCH https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "layout": "v2026",
      "rows": { "R9_1": 85000, "R9_2": 17850 },
      "warnings": []
    }
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: {
      layout: 'v2026',
      rows: { R9_1: 85000, R9_2: 17850 },
      warnings: []
    }
  })
});

const declaration = await response.json();
```

## Response

Returns the updated declaration object.

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
    "rows": { "R9_1": 85000, "R9_2": 17850 },
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

The fields are the ones described in [get declaration](/api-reference/declarations/get). After `filedExternally` the `status` is `submitted` and `anafUploadId` holds ANAF's number.

## Restrictions

- `data` and `metadata` can only be changed while the declaration is in `draft` status
- `type`, `year`, `month`, and `periodType` cannot be changed via this endpoint
- To refresh data from invoices automatically, use the [recalculate endpoint](/api-reference/declarations/recalculate) instead

## Error Codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 400 | The declaration is not in `draft` status (`Only draft declarations can be edited.`), or `filedExternally` is invalid |
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the `declaration.submit` permission |
| 404 | Declaration not found or it belongs to another company |

## Example error response

```json
{
  "error": "Only draft declarations can be edited."
}
```
