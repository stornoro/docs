---
title: Update Declaration
description: Update the data or metadata of a draft tax declaration
method: PATCH
endpoint: /api/v1/declarations/{uuid}
---

# Update Declaration

Partially updates a tax declaration's `data` or `metadata` fields. Only declarations in `draft` status can be updated. Once a declaration has been validated or submitted, it becomes immutable.

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
| `data` | object | No | Partial or full replacement of the declaration's fiscal data payload |
| `metadata` | object | No | Partial or full replacement of the declaration's metadata |

At least one of `data` or `metadata` must be provided.

## Request

```bash {% title="cURL" %}
curl -X PATCH https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "totalSalesBase": "85000.00",
      "totalSalesVat": "16150.00",
      "totalPurchasesBase": "42016.81",
      "totalPurchasesVat": "7983.19",
      "invoiceCount": 48
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
      totalSalesBase: '85000.00',
      totalSalesVat: '16150.00',
      totalPurchasesBase: '42016.81',
      totalPurchasesVat: '7983.19',
      invoiceCount: 48
    }
  })
});

const declaration = await response.json();
```

## Response

Returns the updated declaration object.

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d394",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "draft",
  "data": {
    "totalSalesBase": "85000.00",
    "totalSalesVat": "16150.00",
    "totalPurchasesBase": "42016.81",
    "totalPurchasesVat": "7983.19",
    "invoiceCount": 48
  },
  "metadata": {
    "generatedAt": "2026-02-10T08:00:00Z",
    "invoiceCountAtGeneration": 47
  },
  "errorMessage": null,
  "anafUploadId": null,
  "xmlPath": null,
  "recipisaPath": null,
  "createdAt": "2026-02-10T08:00:00Z",
  "updatedAt": "2026-02-10T08:30:00Z",
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
| `status` | string | Always `draft` after a successful update |
| `data` | object | Updated fiscal data payload |
| `metadata` | object | Updated metadata |
| `errorMessage` | string \| null | Error details (null for draft declarations) |
| `anafUploadId` | string \| null | Always `null` for draft declarations |
| `xmlPath` | string \| null | Path to generated XML (null until validated) |
| `recipisaPath` | string \| null | Path to ANAF recipisa (null until accepted) |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 timestamp of this update |
| `createdBy` | string \| null | UUID of the user who created the declaration |

## Restrictions

- The declaration must be in `draft` status
- `type`, `year`, `month`, and `periodType` cannot be changed via this endpoint
- To refresh data from invoices automatically, use the [recalculate endpoint](/api-reference/declarations/recalculate) instead

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request body structure |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Declaration not found or doesn't belong to the company |
| 409 | `conflict` | Declaration is not in draft status and cannot be updated |
| 422 | `validation_error` | Validation failed |
| 500 | `internal_error` | Server error occurred |

## Example Error Response

### Status Conflict

```json
{
  "error": {
    "code": "conflict",
    "message": "Declaration cannot be updated",
    "details": {
      "status": "validated",
      "reason": "Only draft declarations can be updated"
    }
  }
}
```
