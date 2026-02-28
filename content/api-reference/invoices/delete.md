---
title: Delete invoice
description: Delete a draft invoice
---

# Delete invoice

Permanently deletes a draft invoice. Only invoices with status `draft` can be deleted. Issued, submitted, or validated invoices cannot be deleted - they must be cancelled instead.

```
DELETE /api/v1/invoices/{uuid}
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

{% callout type="warning" %}
This action is permanent and cannot be undone. To reverse an issued invoice, use the [cancel endpoint](/api-reference/invoices/cancel) instead.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X DELETE https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

// Returns 204 No Content on success
if (response.status === 204) {
  console.log('Invoice deleted successfully');
}
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns `204 No Content` on successful deletion with an empty response body.

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Invoice not found |
| `409` | Cannot delete non-draft invoice. Use cancel endpoint for issued invoices. |

## Related endpoints

- [Cancel invoice](/api-reference/invoices/cancel) - Cancel an issued invoice
- [Restore invoice](/api-reference/invoices/restore) - Restore a cancelled invoice
