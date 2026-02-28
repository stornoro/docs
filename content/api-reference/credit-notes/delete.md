---
title: Delete Credit Note
description: Permanently delete a credit note (draft status only)
method: DELETE
endpoint: /api/v1/invoices/{uuid}
---

# Delete Credit Note

Permanently deletes a credit note and all its line items. Only credit notes in `draft` status can be deleted. Once uploaded to ANAF, a credit note cannot be deleted.

Credit notes use the same delete endpoint as invoices.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the credit note to delete |

## Request

```bash {% title="cURL" %}
curl -X DELETE https://api.storno.ro/api/v1/invoices/850e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/invoices/850e8400-e29b-41d4-a716-446655440000', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

// Success: 204 No Content (no response body)
if (response.status === 204) {
  console.log('Credit note deleted successfully');
}
```

## Response

**Success:** Returns `204 No Content` with an empty response body.

The credit note and all associated line items are permanently deleted from the database.

## Restrictions

### Status Requirement
Only credit notes with `status = draft` can be deleted.

Credit notes in the following states **cannot** be deleted:
- `uploaded` - Already submitted to ANAF
- `validated` - ANAF has validated it
- `error` - Upload failed but record must be kept for troubleshooting

### Referential Integrity
- Deleting a credit note does not affect the parent invoice
- The credit note number series counter is not rolled back
- Parent invoice's credited amount tracking is updated

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Credit note not found or doesn't belong to the company |
| 409 | `conflict` | Credit note status prevents deletion (not in draft) |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict - Uploaded

```json
{
  "error": {
    "code": "conflict",
    "message": "Credit note cannot be deleted",
    "details": {
      "status": "uploaded",
      "reason": "Only draft credit notes can be deleted. This credit note has been uploaded to ANAF.",
      "uploadedAt": "2026-02-20T10:00:00Z",
      "anafUploadIndex": 2026000234
    }
  }
}
```

### Status Conflict - Validated

```json
{
  "error": {
    "code": "conflict",
    "message": "Credit note cannot be deleted",
    "details": {
      "status": "validated",
      "reason": "Only draft credit notes can be deleted. This credit note has been validated by ANAF.",
      "validatedAt": "2026-02-20T10:15:00Z",
      "anafUploadIndex": 2026000234
    }
  }
}
```

### Not Found

```json
{
  "error": {
    "code": "not_found",
    "message": "Credit note not found"
  }
}
```

## Best Practices

### When to Delete
**Delete** when:
- The credit note was created by mistake
- The credit note is still in draft and hasn't been uploaded
- You want to remove all traces of the document
- Wrong parent invoice was referenced
- Amounts were completely incorrect and easier to recreate

### When NOT to Delete
**Do NOT delete** when:
- Credit note has been uploaded to ANAF
- Credit note has been sent to client (even if draft)
- You need audit trail
- You need historical records for reporting
- Credit note was shared externally

### Alternatives to Deletion

#### For Uploaded Credit Notes
If credit note is already uploaded and you need to reverse it:
1. **Cannot delete** - Deletion is not possible
2. **Issue corrective credit note** - Create opposite credit note (positive amounts) to reverse
3. **Document in notes** - Add explanation in accounting records
4. **Consult accountant** - Get guidance on proper reversal procedure

#### For Draft Credit Notes with History
If credit note is draft but has been communicated:
1. **Delete if appropriate** - If not shared externally
2. **Keep for audit** - If there's any external communication
3. **Create corrected version** - Delete and recreate with correct data
4. **Document reason** - Log why deletion was necessary

## Audit Considerations

Deleted credit notes:
- Are permanently removed from the database
- Do not appear in reports or exports
- Cannot be recovered
- Do not leave audit trail entries
- Do not affect ANAF records (since never uploaded)

For compliance and audit purposes:
- Only delete draft credit notes
- Log deletion action in external system if needed
- Consider keeping screenshot or PDF if shared with client
- Document business reason for deletion

## Impact on Parent Invoice

When a draft credit note is deleted:
- Parent invoice is **not affected**
- Parent invoice credited amount tracking is updated
- Parent invoice remains valid and unchanged
- Can create new credit note against same parent invoice

## Deletion vs Reversal

### Deletion (Draft Only)
- **Scope:** Draft credit notes only
- **Effect:** Permanent removal
- **Audit trail:** None (record removed)
- **ANAF impact:** None (never uploaded)
- **Use when:** Created by mistake, not shared

### Reversal (Uploaded/Validated)
- **Scope:** Any status
- **Effect:** Create opposite entry
- **Audit trail:** Both records preserved
- **ANAF impact:** New submission required
- **Use when:** Need to undo validated credit note

## Recovery from Accidental Deletion

If you accidentally delete a draft credit note:
1. **Cannot recover** - Deletion is permanent
2. **Recreate from parent invoice** - Use parent invoice data
3. **Check backups** - If database backups exist
4. **Retrieve from PDF** - If PDF was generated
5. **Check email history** - If sent to client

## Common Scenarios

### Scenario 1: Wrong Parent Invoice
```
Problem: Created credit note against wrong invoice
Solution: Delete draft credit note, create new one with correct parent
```

### Scenario 2: Incorrect Amount
```
Problem: Used wrong line items or quantities
Solution: Delete draft credit note, recreate with correct amounts
```

### Scenario 3: Duplicate Creation
```
Problem: Accidentally created same credit note twice
Solution: Delete the duplicate draft credit note
```

### Scenario 4: Client Cancelled Request
```
Problem: Client no longer wants refund
Solution: Delete draft credit note before upload
```

## Best Practices Summary

1. **Delete only drafts** - Never attempt to delete uploaded credit notes
2. **Verify before deleting** - Double-check you're deleting the right document
3. **Log the action** - Record why credit note was deleted in external system
4. **Recreate if needed** - Create new correct credit note immediately
5. **Communicate changes** - If credit note was discussed with client, inform them
6. **Check parent status** - Ensure parent invoice is still valid
7. **Review process** - Understand why incorrect credit note was created

## After Deletion

Once deleted:
1. **Verify deletion** - Check that credit note is removed from list
2. **Create replacement** - If credit is still needed
3. **Update documentation** - Note the deletion in related records
4. **Notify stakeholders** - If credit note was expected by others
5. **Review workflow** - Prevent similar errors in future
