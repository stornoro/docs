---
title: Delete document series
description: Permanently delete a document series.
---

# Delete document series

Permanently deletes a document series from the authenticated company.

```http
DELETE /api/v1/document-series/{uuid}
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

Requires the `series.manage` permission.

## Response

Returns `200 OK` with a confirmation message.

```json
{
  "message": "Document series deleted."
}
```

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/document-series/series-uuid-4' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found, or document series not found in this company |

Error bodies have the form `{"error": "message"}`.

## Important Notes

- This is a permanent delete operation. The data cannot be recovered
- The endpoint does not check whether documents were issued from the series
- Consider marking the series as inactive instead of deleting it

## Recommended Approach

Instead of deleting a series, consider:

1. **Mark as inactive** - Use the [update endpoint](/api-reference/document-series/update) to set `active: false`
2. **Preserve history** - Inactive series keep the link to existing documents
3. **Audit trail** - Keeping inactive series provides a complete audit trail

Deletion fits a series created by mistake that was never used.

## Related Endpoints

- [List document series](/api-reference/document-series/list)
- [Create document series](/api-reference/document-series/create)
- [Update document series](/api-reference/document-series/update)
