---
title: List document series
description: Retrieve all document series for the authenticated company.
---

# List document series

Retrieves all document series configured for the authenticated company. Results can be filtered by document type.

```http
GET /api/v1/document-series
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by document type: `invoice`, `proforma`, `credit_note`, `delivery_note` |

## Response

Returns an array of document series objects.

### Document Series Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `prefix` | string | Series prefix (e.g., "FAC", "PRO") |
| `type` | string | Document type: `invoice`, `proforma`, `credit_note`, `delivery_note` |
| `currentNumber` | integer | Last used number in series |
| `nextNumber` | integer | Next available number (virtual field) |
| `active` | boolean | Whether series is active |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/document-series?type=invoice' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
[
  {
    "uuid": "series-uuid-1",
    "prefix": "FAC",
    "type": "invoice",
    "currentNumber": 245,
    "nextNumber": 246,
    "active": true,
    "createdAt": "2025-01-01T08:00:00Z",
    "updatedAt": "2026-02-16T10:30:00Z"
  },
  {
    "uuid": "series-uuid-2",
    "prefix": "FRE",
    "type": "invoice",
    "currentNumber": 123,
    "nextNumber": 124,
    "active": true,
    "createdAt": "2025-06-15T09:00:00Z",
    "updatedAt": "2026-02-10T14:20:00Z"
  },
  {
    "uuid": "series-uuid-3",
    "prefix": "FAC2025",
    "type": "invoice",
    "currentNumber": 1523,
    "nextNumber": 1524,
    "active": false,
    "createdAt": "2025-01-01T08:00:00Z",
    "updatedAt": "2025-12-31T23:59:00Z"
  }
]
```

## Document Types

- `invoice` - Standard invoices
- `proforma` - Proforma invoices
- `credit_note` - Credit notes
- `delivery_note` - Delivery notes

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 422 | validation_error | Invalid type parameter |

## Important Notes

- Each prefix must be unique per company and document type
- The `nextNumber` field is a virtual field calculated as `currentNumber + 1`
- Only active series are available for new documents
- Inactive series are typically used for closed fiscal years or discontinued numbering schemes

## Related Endpoints

- [Create document series](/api-reference/document-series/create)
- [Update document series](/api-reference/document-series/update)
- [Delete document series](/api-reference/document-series/delete)
