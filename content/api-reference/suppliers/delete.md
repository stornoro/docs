---
title: Delete supplier
description: Soft-delete a supplier record.
---

# Delete supplier

Soft-deletes a supplier. The supplier no longer appears in lists. Incoming invoices from this supplier are not changed.

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
| `X-Company` | string | No | UUID of the company context. The `company` query parameter is accepted as an alternative, and the header can be omitted when the organization has a single company. Routes addressed by UUID resolve the company from the record |

## Response

Returns `200 OK`:

```json
{ "message": "Supplier deleted." }
```

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/suppliers/c3d4e5f6-a7b8-9012-cdef-123456789012' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Supplier not found |

Error responses have the form `{"error": "message"}`.

## Related Endpoints

- [Get supplier](/api-reference/suppliers/get)
- [Update supplier](/api-reference/suppliers/update)
- [List suppliers](/api-reference/suppliers/list)
