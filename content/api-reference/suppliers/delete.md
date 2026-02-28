---
title: Delete supplier
description: Soft-delete a supplier record.
---

# Delete supplier

Soft-deletes a supplier record. The supplier is marked as deleted but not permanently removed from the database. Incoming invoices associated with this supplier remain unchanged.

```http
DELETE /api/v1/suppliers/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the supplier |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns a `204 No Content` status on successful deletion with no response body.

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/suppliers/supplier-uuid-1' \
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
| 404 | not_found | Supplier not found or doesn't belong to company |
| 409 | conflict | Cannot delete supplier with active references |

## Soft Delete Behavior

This endpoint performs a soft delete:

- The supplier record is marked as deleted (`deletedAt` timestamp is set)
- The supplier no longer appears in list endpoints
- Incoming invoices associated with this supplier are not affected
- The supplier can potentially be restored by support if needed
- If the supplier sends new invoices via ANAF, they will be recreated

## Important Notes

- This is a soft delete operation - data is not permanently removed
- Existing incoming invoices from this supplier remain intact
- Invoice history and statistics are preserved
- If new invoices arrive from this supplier via ANAF sync, the supplier record will be restored automatically

## Related Endpoints

- [Get supplier](/api-reference/suppliers/get)
- [Update supplier](/api-reference/suppliers/update)
- [List suppliers](/api-reference/suppliers/list)
