---
title: Delete Delivery Note
description: Permanently delete a delivery note (draft status only)
method: DELETE
endpoint: /api/v1/delivery-notes/{uuid}
---

# Delete Delivery Note

Permanently deletes a delivery note and all its line items. Only delivery notes in `draft` status can be deleted. Once issued, converted, or cancelled, a delivery note cannot be deleted.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

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

The delivery note and all associated line items are permanently deleted from the database.

## Restrictions

### Status Requirement
Only delivery notes with `status = draft` can be deleted.

Delivery notes in the following states **cannot** be deleted:
- `issued` - Already issued and delivered
- `converted` - Converted to invoice
- `cancelled` - Already cancelled

For non-draft delivery notes, use the [cancel endpoint](/api-reference/delivery-notes/cancel) instead.

### Referential Integrity
- Deleting a delivery note does not affect the series number counter
- The series counter is not rolled back
- If the delivery note was converted to an invoice, the invoice is **not** deleted

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Delivery note not found or doesn't belong to the company |
| 409 | `conflict` | Delivery note status prevents deletion (not in draft) |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict - Issued

```json
{
  "error": {
    "code": "conflict",
    "message": "Delivery note cannot be deleted",
    "details": {
      "status": "issued",
      "reason": "Only draft delivery notes can be deleted. Use cancel instead.",
      "issuedAt": "2026-02-18T14:30:00Z"
    }
  }
}
```

### Status Conflict - Converted

```json
{
  "error": {
    "code": "conflict",
    "message": "Delivery note cannot be deleted",
    "details": {
      "status": "converted",
      "reason": "Delivery note has been converted to an invoice",
      "convertedAt": "2026-02-20T10:00:00Z",
      "convertedInvoiceId": "650e8400-e29b-41d4-a716-446655440222",
      "convertedInvoiceNumber": "FAC-2026-050"
    }
  }
}
```

### Not Found

```json
{
  "error": {
    "code": "not_found",
    "message": "Delivery note not found"
  }
}
```

## Best Practices

### When to Delete vs Cancel

**Delete** when:
- The delivery note was created by mistake
- The delivery note is still in draft and hasn't been processed
- You want to remove all traces of the document
- No physical delivery has occurred
- Easier to recreate than to update

**Cancel** when:
- The delivery note has been issued
- The delivery note has been shared with client or logistics
- You need to maintain audit trail
- Physical delivery was planned but cancelled
- Historical records needed for reporting

### Audit Considerations

Deleted delivery notes:
- Are permanently removed from the database
- Do not appear in reports or exports
- Cannot be recovered
- Do not leave audit trail entries
- Do not affect series counter

For compliance and audit purposes, consider using the cancel endpoint instead of delete, especially for delivery notes that were shared or processed.

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

### Scenario 3: Data Entry Errors
```
Problem: Multiple errors, easier to recreate
Solution: Delete draft, create fresh delivery note
```

### Scenario 4: Order Cancelled Before Preparation
```
Problem: Client cancelled before delivery was prepared
Solution: Delete draft delivery note (no physical process started)
```

## Impact Analysis

### What Gets Deleted
- Delivery note record
- All line items
- Associated metadata

### What Remains Unchanged
- Client record
- Product records
- Series configuration
- Series counter (next number not rolled back)
- Related proformas or invoices (if any)

## Recovery from Accidental Deletion

If you accidentally delete a draft delivery note:
1. **Cannot recover** - Deletion is permanent
2. **Recreate from scratch** - Use client and product data
3. **Check backups** - If database backups exist
4. **Review logs** - Check application logs for deleted data
5. **Prevent future errors** - Implement confirmation dialogs

## Alternative Actions

Instead of deleting, consider:

### Update the Delivery Note
If data is mostly correct but needs changes:
```
PUT /api/v1/delivery-notes/{uuid}
```

### Cancel the Delivery Note
If delivery won't occur but needs audit trail:
```
POST /api/v1/delivery-notes/{uuid}/cancel
```

### Keep as Draft
If uncertain about delivery timing:
- Leave in draft status
- Add internal notes about status
- Update when delivery is confirmed

## Deletion vs Other Operations

| Operation | Draft | Issued | Converted | Effect | Audit Trail |
|-----------|-------|--------|-----------|--------|-------------|
| **Delete** | ✓ | ✗ | ✗ | Permanent removal | None |
| **Cancel** | ✓ | ✓ | ✗ | Status change | Full |
| **Update** | ✓ | ✗ | ✗ | Modify data | Change log |

## Best Practices Summary

1. **Delete only drafts** - Never attempt to delete issued delivery notes
2. **Verify before deleting** - Double-check you're deleting the right document
3. **Log the action** - Record why delivery note was deleted in external system
4. **Recreate if needed** - Create new correct delivery note immediately
5. **Use cancel for issued** - If delivery note was issued, cancel instead
6. **Check references** - Ensure no other documents reference this delivery note
7. **Review process** - Understand why incorrect delivery note was created

## After Deletion

Once deleted:
1. **Verify removal** - Check that delivery note is removed from list
2. **Create replacement** - If delivery is still needed
3. **Update documentation** - Note the deletion in related records
4. **Notify stakeholders** - If delivery note was expected by others
5. **Review inventory** - Ensure inventory status is correct
6. **Check logistics** - Cancel any related shipment preparations
