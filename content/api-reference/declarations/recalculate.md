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

Returns the updated declaration object with freshly calculated `data` and updated `metadata`.

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d394",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "draft",
  "data": {
    "totalSalesBase": "91250.42",
    "totalSalesVat": "17337.58",
    "totalPurchasesBase": "44800.00",
    "totalPurchasesVat": "8512.00",
    "invoiceCount": 52
  },
  "metadata": {
    "generatedAt": "2026-02-10T09:00:00Z",
    "invoiceCountAtGeneration": 52
  },
  "errorMessage": null,
  "anafUploadId": null,
  "xmlPath": null,
  "recipisaPath": null,
  "createdAt": "2026-02-10T08:00:00Z",
  "updatedAt": "2026-02-10T09:00:00Z",
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
| `status` | string | Always `draft` after recalculation |
| `data` | object | Freshly recalculated fiscal data from current invoice records |
| `metadata` | object | Updated metadata with new generation timestamp and invoice count |
| `errorMessage` | string \| null | Always `null` after successful recalculation |
| `xmlPath` | string \| null | Reset to `null` — any previously generated XML is invalidated |
| `recipisaPath` | string \| null | `null` until declaration is accepted |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 timestamp of this recalculation |

## Restrictions

- The declaration must be in `draft` status
- Recalculating always overwrites the current `data` with freshly aggregated values; any manual edits made via PATCH will be replaced

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Declaration not found or doesn't belong to the company |
| 409 | `conflict` | Declaration is not in draft status and cannot be recalculated |
| 500 | `internal_error` | Server error occurred |
