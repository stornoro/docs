---
title: Delete VAT rate
description: Soft-delete a VAT rate from the company configuration.
---

# Delete VAT rate

Soft-deletes a VAT rate from the authenticated company. The rate is marked as deleted but not removed from the database.

```http
DELETE /api/v1/vat-rates/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the VAT rate |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

Requires the `settings.manage` permission.

## Response

Returns `200 OK` with a confirmation message.

```json
{
  "message": "VAT rate deleted."
}
```

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/vat-rates/vat-uuid-4' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found, or VAT rate not found in this company |

Error bodies have the form `{"error": "message"}`.

## Soft Delete Behavior

- The VAT rate is marked as deleted (`deletedAt` timestamp is set)
- The rate no longer appears in the list endpoint

## Related Endpoints

- [List VAT rates](/api-reference/vat-rates/list)
- [Create VAT rate](/api-reference/vat-rates/create)
- [Update VAT rate](/api-reference/vat-rates/update)
