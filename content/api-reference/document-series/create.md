---
title: Create document series
description: Create a new document series for invoices, proformas, credit notes, delivery notes, receipts or vouchers.
---

# Create document series

Creates a new document series for the authenticated company. The series prefix must be unique per company, across all document types.

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

Requires the `series.manage` permission.

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prefix` | string | Yes | Series prefix (unique per company) |
| `type` | string | No | Document type: `invoice` (default), `proforma`, `credit_note`, `delivery_note`, `receipt`, `voucher` |
| `currentNumber` | integer | No | Last used number (default: 0). The first document gets `currentNumber + 1` |
| `active` | boolean | No | Whether series is active (default: true) |
| `isDefault` | boolean | No | Make this the default series of its type (default: false). The default flag is cleared on the other series of the same type |

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
  "id": "series-uuid-4",
  "prefix": "FAC2026",
  "type": "invoice",
  "currentNumber": 0,
  "nextNumber": "FAC20260001",
  "active": true,
  "isDefault": false,
  "source": "manual"
}
```

## Prefix Guidelines

- Should be short and meaningful (e.g., "FAC", "PRO", "AVZ")
- Can include year for annual series (e.g., "FAC2026")
- Must be unique per company. The same prefix cannot be reused for another document type
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

| Status Code | Description |
|-------------|-------------|
| 400 | `prefix` is missing, or `type` is not a valid type |
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found |
| 409 | A series with this prefix already exists |

Error bodies have the form `{"error": "message"}`.

## Related Endpoints

- [List document series](/api-reference/document-series/list)
- [Update document series](/api-reference/document-series/update)
- [Delete document series](/api-reference/document-series/delete)
