---
title: Delete recurring invoice
description: Delete a recurring invoice template.
---

# Delete recurring invoice

Deletes a recurring invoice template. It no longer appears in the list and generates nothing. Documents generated from it are not affected.

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

## Response

Returns a `204 No Content` status on successful deletion with no response body.

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/recurring-invoices/rec-inv-uuid-1' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Example Response

```http
HTTP/1.1 204 No Content
```

## Errors

Errors have the form `{"error": "message"}`.

| Status | Description |
|--------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Missing permission |
| 404 | Recurring invoice not found |

## Important Notes

- Documents generated from this template remain unchanged
- To pause generation without deleting, use the [toggle endpoint](/api-reference/recurring-invoices/toggle)
- The client and the series are not deleted

## Related Endpoints

- [List recurring invoices](/api-reference/recurring-invoices/list)
- [Toggle recurring invoice](/api-reference/recurring-invoices/toggle)
- [Get recurring invoice](/api-reference/recurring-invoices/get)
