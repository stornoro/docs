---
title: Delete recurring invoice
description: Permanently delete a recurring invoice template.
---

# Delete recurring invoice

Permanently deletes a recurring invoice template. This action cannot be undone. Previously generated invoices from this template are not affected.

```http
DELETE /api/v1/recurring-invoices/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the recurring invoice |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns a `204 No Content` status on successful deletion with no response body.

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/recurring-invoices/rec-inv-uuid-1' \
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
| 404 | not_found | Recurring invoice not found or doesn't belong to company |

## Important Notes

- This action is permanent and cannot be undone
- Invoices previously generated from this template remain unchanged
- To temporarily stop invoice generation, use the [toggle endpoint](/api-reference/recurring-invoices/toggle) instead
- Deleting a recurring invoice does not delete the associated client or series

## Related Endpoints

- [List recurring invoices](/api-reference/recurring-invoices/list)
- [Toggle recurring invoice](/api-reference/recurring-invoices/toggle)
- [Get recurring invoice](/api-reference/recurring-invoices/get)
