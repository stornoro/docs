---
title: Delete Receipt
description: Permanently delete a receipt (draft status only)
method: DELETE
endpoint: /api/v1/receipts/{uuid}
---

# Delete Receipt

Permanently deletes a receipt and all its line items. Only receipts in `draft` status can be deleted. Once issued, invoiced, or cancelled, a receipt cannot be deleted.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

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

The receipt and all associated line items are permanently deleted from the database.

## Restrictions

### Status Requirement
Only receipts with `status = draft` can be deleted.

Receipts in the following states **cannot** be deleted:
- `issued` - Already printed and handed to customer
- `invoiced` - Converted to a formal invoice
- `cancelled` - Already cancelled

For issued or invoiced receipts, use the [cancel endpoint](/api-reference/receipts/cancel) instead.

### Referential Integrity
- Deleting a receipt does not roll back the series number counter
- If the receipt was converted to an invoice, the invoice is **not** deleted

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Receipt not found or doesn't belong to the company |
| 409 | `conflict` | Receipt status prevents deletion (not in draft) |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict - Issued

```json
{
  "error": {
    "code": "conflict",
    "message": "Receipt cannot be deleted",
    "details": {
      "status": "issued",
      "reason": "Only draft receipts can be deleted. Use cancel instead.",
      "issuedAt": "2026-02-18T10:15:00Z"
    }
  }
}
```

### Not Found

```json
{
  "error": {
    "code": "not_found",
    "message": "Receipt not found"
  }
}
```

## Delete vs Cancel

### Delete
- **Use when:** Receipt was created by mistake and is still in draft
- **Preserves:** Nothing — permanently removed
- **Can be done:** Only in `draft` status
- **Audit trail:** None

### Cancel
- **Use when:** Receipt was issued but must be voided (requires a cancellation receipt on the fiscal device)
- **Preserves:** Full audit trail and historical data
- **Can be done:** At `draft` or `issued` status
- **Audit trail:** Full

## Best Practices

1. **Delete only drafts** - Never attempt to delete an issued receipt
2. **Verify before deleting** - Double-check you are deleting the correct document
3. **Cancel issued receipts** - If a receipt was already printed, use cancel to maintain the audit trail
4. **Fiscal compliance** - Deleting a draft that was never printed on the fiscal device has no fiscal impact; cancelling an issued receipt requires a corresponding cancellation receipt on the physical device
