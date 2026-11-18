---
title: Delete invoice
description: Delete a draft or cancelled invoice
---

# Delete invoice

Deletes a draft or cancelled invoice. Only invoices with status `draft` or `cancelled` can be deleted. Issued, submitted, or validated invoices cannot be deleted; cancel them first where cancelling is allowed.

```
DELETE /api/v1/invoices/{uuid}
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not used on this route: the invoice is found by its UUID |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

{% callout type="warning" %}
The invoice disappears from the API and cannot be restored through it. If the deleted invoice held the latest number of its series and was never sent to ANAF, the series counter goes back by one. To withdraw an issued invoice, use the [cancel endpoint](/api-reference/invoices/cancel) instead.
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
| `403` | The invoice belongs to another organization, or the user cannot delete invoices |
| `404` | Invoice not found |
| `422` | The invoice cannot be deleted because its status is not `draft` or `cancelled` |

Error bodies have the form `{"error": "message"}`.

## Related endpoints

- [Cancel invoice](/api-reference/invoices/cancel) - Cancel an invoice
- [Restore invoice](/api-reference/invoices/restore) - Restore a cancelled invoice
