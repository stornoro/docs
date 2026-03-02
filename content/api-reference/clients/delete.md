---
title: Delete client
description: Soft-delete a client
---

# Delete client

Soft-deletes a client. The client is marked as deleted but remains in the database. Soft-deleted clients are excluded from list queries and cannot be used on new invoices.

```http
DELETE /api/v1/clients/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the client |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/clients/b2c3d4e5-f6a7-8901-bcde-f12345678901' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Response

Returns `204 No Content` on success.

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Client not found |

## Related Endpoints

- [List clients](/api-reference/clients/list)
- [Bulk delete clients](/api-reference/clients/bulk-delete)
