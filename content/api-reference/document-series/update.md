---
title: Update document series
description: Update an existing document series.
---

# Update document series

Updates an existing document series. Note that the prefix and type cannot be changed after creation.

```http
PATCH /api/v1/document-series/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the document series |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

All parameters are optional, but at least one must be provided.

| Parameter | Type | Description |
|-----------|------|-------------|
| `currentNumber` | integer | Update the last used number (use with caution) |
| `active` | boolean | Set series as active or inactive |

## Response

Returns the updated document series object.

## Example Request

```bash
curl -X PATCH 'https://api.storno.ro/api/v1/document-series/series-uuid-3' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "active": false
  }'
```

## Example Response

```json
{
  "uuid": "series-uuid-3",
  "prefix": "FAC2025",
  "type": "invoice",
  "currentNumber": 1523,
  "nextNumber": 1524,
  "active": false,
  "createdAt": "2025-01-01T08:00:00Z",
  "updatedAt": "2026-02-16T16:15:00Z"
}
```

## Field Restrictions

### Non-Editable Fields

The following fields cannot be changed after creation:

- `prefix` - Series prefix
- `type` - Document type

These restrictions prevent breaking existing invoice number sequences and ensure data integrity.

### Editable Fields

- `currentNumber` - Can be updated, but use with extreme caution
- `active` - Can be toggled to activate/deactivate series

## Updating currentNumber

Modifying `currentNumber` should only be done in exceptional circumstances:

- Correcting data migration issues
- Aligning with external accounting systems
- Fixing numbering gaps

### Warning

Setting `currentNumber` to a value lower than the highest existing invoice number in this series may cause duplicate numbers, which could violate fiscal regulations.

### Best Practice

Instead of modifying `currentNumber`, consider:
- Creating a new series with the desired starting number
- Marking the old series as inactive

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Document series not found or doesn't belong to company |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- No fields provided for update
- Negative `currentNumber`
- Attempting to modify `prefix` or `type`

## Related Endpoints

- [List document series](/api-reference/document-series/list)
- [Create document series](/api-reference/document-series/create)
- [Delete document series](/api-reference/document-series/delete)
