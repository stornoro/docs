---
title: Create document series
description: Create a new document series for invoices, proformas, credit notes, or delivery notes.
---

# Create document series

Creates a new document series for the authenticated company. The series prefix must be unique per company and document type.

```http
POST /api/v1/document-series
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prefix` | string | Yes | Series prefix (unique per company+type) |
| `type` | string | Yes | Document type: `invoice`, `proforma`, `credit_note`, `delivery_note` |
| `currentNumber` | integer | No | Starting number (default: 0) |
| `active` | boolean | No | Whether series is active (default: true) |

## Response

Returns the created document series object with a `201 Created` status.

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/document-series' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "prefix": "FAC2026",
    "type": "invoice",
    "currentNumber": 0,
    "active": true
  }'
```

## Example Response

```json
{
  "uuid": "series-uuid-4",
  "prefix": "FAC2026",
  "type": "invoice",
  "currentNumber": 0,
  "nextNumber": 1,
  "active": true,
  "createdAt": "2026-02-16T16:00:00Z",
  "updatedAt": "2026-02-16T16:00:00Z"
}
```

## Prefix Guidelines

- Should be short and meaningful (e.g., "FAC", "PRO", "AVZ")
- Can include year for annual series (e.g., "FAC2026")
- Must be unique per company and document type
- Typically uppercase, but no strict format requirement
- Avoid special characters that may cause issues in file names

## Common Use Cases

### Fiscal Year Series

Create a new series for each fiscal year:
- "FAC2025" for 2025 invoices
- "FAC2026" for 2026 invoices

### Department Series

Create separate series by department:
- "FAC-IT" for IT department
- "FAC-HR" for HR department

### Document Type Series

Different prefixes for different invoice types:
- "FAC" for regular invoices
- "FRE" for recurring invoices
- "FEX" for export invoices

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- Missing `prefix` field
- Missing `type` field
- Invalid `type` value
- Prefix already exists for this company and type
- Negative `currentNumber`

## Related Endpoints

- [List document series](/api-reference/document-series/list)
- [Update document series](/api-reference/document-series/update)
- [Delete document series](/api-reference/document-series/delete)
