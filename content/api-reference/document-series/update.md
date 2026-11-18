---
title: Update document series
description: Update an existing document series.
---

# Update document series

Updates an existing document series. The prefix cannot be changed after creation. Only the fields you send are changed.

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

Requires the `series.manage` permission.

### Body Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `currentNumber` | integer | Update the last used number (use with caution) |
| `active` | boolean | Set series as active or inactive |
| `type` | string | Document type: `invoice`, `proforma`, `credit_note`, `delivery_note`, `receipt`, `voucher` |
| `isDefault` | boolean | Make this the default series of its type. When set to `true`, the default flag is cleared on the other series of the same type |

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
  "id": "series-uuid-3",
  "prefix": "FAC2025",
  "type": "invoice",
  "currentNumber": 1523,
  "nextNumber": "FAC20251524",
  "active": false,
  "isDefault": false,
  "source": "manual"
}
```

## Field Restrictions

The `prefix` cannot be changed after creation. This protects existing document number sequences.

## Updating currentNumber

Modifying `currentNumber` should only be done in exceptional circumstances:

- Correcting data migration issues
- Aligning with external accounting systems
- Fixing numbering gaps

### Warning

Setting `currentNumber` to a value lower than the highest existing document number in this series may cause duplicate numbers, which could violate fiscal regulations.

### Best Practice

Instead of modifying `currentNumber`, consider:
- Creating a new series with the desired starting number
- Marking the old series as inactive

## Errors

| Status Code | Description |
|-------------|-------------|
| 400 | `type` is not a valid type |
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found, or document series not found in this company |

Error bodies have the form `{"error": "message"}`.

## Related Endpoints

- [List document series](/api-reference/document-series/list)
- [Create document series](/api-reference/document-series/create)
- [Delete document series](/api-reference/document-series/delete)
