---
title: Delete Delivery Note
description: Delete a delivery note (draft or cancelled status only)
method: DELETE
endpoint: /api/v1/delivery-notes/{uuid}
---

# Delete Delivery Note

Deletes a delivery note. Only delivery notes in `draft` or `cancelled` status can be deleted. Issued and converted delivery notes cannot be deleted.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note to delete |

## Request

```bash {% title="cURL" %}
curl -X DELETE https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

// Success: 204 No Content (no response body)
if (response.status === 204) {
  console.log('Delivery note deleted successfully');
}
```

## Response

**Success:** Returns `204 No Content` with an empty response body.

The delivery note is soft-deleted: it is no longer returned by the API.

## Restrictions

### Status Requirement
Only delivery notes with `status` `draft` or `cancelled` can be deleted.

Delivery notes in the following states **cannot** be deleted:
- `issued` - Already issued and delivered
- `converted` - Converted to invoice

For an issued delivery note, use the [cancel endpoint](/api-reference/delivery-notes/cancel) first.

### Referential Integrity
- Deleting a delivery note does not roll back the series counter
- If the delivery note was converted to an invoice, the invoice is **not** deleted

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Delivery note not found or not in the caller's organization |
| 422 | The delivery note is issued or converted |

### Example error response

```json
{
  "error": "This delivery note cannot be deleted."
}
```

## Best Practices

### When to delete and when to cancel

**Delete** when:
- The delivery note was created by mistake
- The delivery note is still a draft and hasn't been processed
- No physical delivery has occurred

**Cancel** when:
- The delivery note has been issued
- The delivery note has been shared with client or logistics
- Physical delivery was planned but cancelled

## Common Deletion Scenarios

### Scenario 1: Duplicate Creation
```
Problem: Accidentally created same delivery note twice
Solution: Delete the duplicate draft delivery note
```

### Scenario 2: Wrong Client
```
Problem: Created delivery note for wrong client
Solution: Delete draft, create new one with correct client
```

### Scenario 3: Order Cancelled Before Preparation
```
Problem: Client cancelled before delivery was prepared
Solution: Delete draft delivery note (no physical process started)
```

## Alternative Actions

### Update the Delivery Note
If data is mostly correct but needs changes:
```
PUT /api/v1/delivery-notes/{uuid}
```

### Cancel the Delivery Note
If delivery won't occur but you want to keep the record:
```
POST /api/v1/delivery-notes/{uuid}/cancel
```

## Deletion vs other operations

| Operation | Draft | Issued | Converted | Cancelled |
|-----------|-------|--------|-----------|-----------|
| **Delete** | yes | no | no | yes |
| **Cancel** | yes | yes | no | no |
| **Update** | yes | yes | no | no |
