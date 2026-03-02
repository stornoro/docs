---
title: Bulk delete clients
description: Soft-delete multiple clients at once
---

# Bulk delete clients

Soft-deletes multiple clients in a single request. Each client is processed independently — if some deletions fail (e.g., permission denied), others will still succeed.

```http
POST /api/v1/clients/bulk-delete
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

### Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `ids` | string[] | Yes | Array of client UUIDs to delete (1–100 items) |

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/clients/bulk-delete' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "ids": [
      "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "c3d4e5f6-a7b8-9012-cdef-123456789012"
    ]
  }'
```

## Response

Returns a summary of the operation.

```json
{
  "deleted": 2,
  "errors": []
}
```

### Partial failure

If some clients cannot be deleted, the response includes both the count of successful deletions and an array of errors:

```json
{
  "deleted": 1,
  "errors": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "error": "Access Denied."
    }
  ]
}
```

## Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid request (empty array, more than 100 IDs) |
| 401 | Invalid or missing authentication token |

## Related Endpoints

- [Delete client](/api-reference/clients/delete)
- [List clients](/api-reference/clients/list)
