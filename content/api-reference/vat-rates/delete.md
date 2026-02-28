---
title: Delete VAT rate
description: Soft-delete a VAT rate from the company configuration.
---

# Delete VAT rate

Soft-deletes a VAT rate from the authenticated company. The rate is marked as deleted but not permanently removed, preserving historical invoice data integrity.

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

## Response

Returns a `204 No Content` status on successful deletion with no response body.

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/vat-rates/vat-uuid-4' \
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
| 404 | not_found | VAT rate not found or doesn't belong to company |
| 409 | conflict | Cannot delete the default VAT rate or last remaining rate |

## Soft Delete Behavior

This endpoint performs a soft delete:

- The VAT rate is marked as deleted (`deletedAt` timestamp is set)
- The rate no longer appears in list endpoints or dropdowns
- Existing invoice lines that use this rate are not affected
- Historical reports continue to display the rate correctly
- The rate can be restored by support if needed

## Important Notes

- You cannot delete the default VAT rate; set another rate as default first
- You cannot delete the last remaining VAT rate; create another rate first
- Existing invoices preserve the VAT rate at the time of creation
- Invoice line items retain the full VAT rate details (percentage, label, category)

## Recommended Approach

Before deleting a VAT rate:

1. **Check usage** - Verify how many invoices use this rate
2. **Set new default** - If deleting the default rate, set another as default
3. **Create replacement** - Ensure an alternative rate exists for future invoices
4. **Document reason** - Keep internal notes on why the rate was removed

## Related Endpoints

- [List VAT rates](/api-reference/vat-rates/list)
- [Create VAT rate](/api-reference/vat-rates/create)
- [Update VAT rate](/api-reference/vat-rates/update)
