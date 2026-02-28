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

## Response

Returns a `204 No Content` status on successful deletion with no response body.

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/document-series/series-uuid-4' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```http
HTTP/1.1 204 No Content
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Document series not found or doesn't belong to company |
| 409 | conflict | Cannot delete series with existing documents |

## Important Notes

- This is a permanent delete operation - data cannot be recovered
- You cannot delete a series that has been used for any documents
- Existing invoices that reference this series will retain the series prefix in their stored data
- Consider marking the series as inactive instead of deleting it

## Recommended Approach

Instead of deleting a series, consider:

1. **Mark as inactive** - Use the [update endpoint](/api-reference/document-series/update) to set `active: false`
2. **Preserve history** - Inactive series maintain referential integrity with existing documents
3. **Audit trail** - Keeping inactive series provides a complete audit trail

## Use Cases for Deletion

Deletion should only be used when:

- The series was created by mistake and has never been used
- Testing or development series that need cleanup
- Duplicate series that were never activated

## Related Endpoints

- [List document series](/api-reference/document-series/list)
- [Create document series](/api-reference/document-series/create)
- [Update document series](/api-reference/document-series/update)
