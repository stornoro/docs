---
title: Delete Receipt
description: Delete a receipt (draft or cancelled status only)
method: DELETE
endpoint: /api/v1/receipts/{uuid}
---

# Delete Receipt

Deletes a receipt. The receipt is soft-deleted: it no longer appears in lists or can be fetched, but the record is kept. Only receipts in `draft` or `cancelled` status can be deleted. Issued and invoiced receipts cannot be deleted.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Company UUID. Not used to find the receipt; access is checked against your organization |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the receipt to delete |

## Request

```bash {% title="cURL" %}
curl -X DELETE https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

// Success: 204 No Content (no response body)
if (response.status === 204) {
  console.log('Receipt deleted successfully');
}
```

## Response

**Success:** Returns `204 No Content` with an empty response body.

## Restrictions

### Status Requirement
Only receipts with `status` `draft` or `cancelled` can be deleted.

Receipts in the following states **cannot** be deleted:
- `issued` - Already printed and handed to customer
- `invoiced` - Converted to a formal invoice

For issued receipts, use the [cancel endpoint](/api-reference/receipts/cancel) first.

### Referential Integrity
- Deleting a receipt does not roll back the series number counter
- If the receipt was converted to an invoice, the invoice is **not** deleted

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Receipt not found or not in your organization |
| 422 | Receipt status prevents deletion (`issued` or `invoiced`) |

Error responses have the form `{"error": "message"}`.

## Example Error Responses

### Status Conflict - Issued

```json
{
  "error": "Bonul fiscal nu poate fi sters."
}
```

### Not Found

```json
{
  "error": "Receipt not found."
}
```

## Delete vs Cancel

### Delete
- **Use when:** Receipt was created by mistake and is still a draft, or a cancelled receipt is no longer needed
- **Can be done:** In `draft` or `cancelled` status

### Cancel
- **Use when:** Receipt was issued but must be voided (requires a cancellation receipt on the fiscal device)
- **Can be done:** At `draft` or `issued` status
- **Preserves:** The receipt with status `cancelled`

## Best Practices

1. **Delete drafts and cancelled receipts only** - An issued receipt must be cancelled first
2. **Verify before deleting** - Double-check you are deleting the correct document
3. **Fiscal compliance** - Deleting a draft that was never printed on the fiscal device has no fiscal impact; cancelling an issued receipt requires a corresponding cancellation receipt on the physical device
