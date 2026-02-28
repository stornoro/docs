---
title: Delete Proforma Invoice
description: Permanently delete a proforma invoice (draft status only)
method: DELETE
endpoint: /api/v1/proforma-invoices/{uuid}
---

# Delete Proforma Invoice

Permanently deletes a proforma invoice and all its line items. Only proforma invoices in `draft` status can be deleted. Once sent, accepted, rejected, converted, or cancelled, a proforma cannot be deleted.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the proforma invoice to delete |

## Request

```bash {% title="cURL" %}
curl -X DELETE https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

// Success: 204 No Content (no response body)
if (response.status === 204) {
  console.log('Proforma invoice deleted successfully');
}
```

## Response

**Success:** Returns `204 No Content` with an empty response body.

The proforma invoice and all associated line items are permanently deleted from the database.

## Restrictions

### Status Requirement
Only proforma invoices with `status = draft` can be deleted.

Proforma invoices in the following states **cannot** be deleted:
- `sent` - Already sent to client
- `accepted` - Client has accepted
- `rejected` - Client has rejected
- `converted` - Converted to invoice
- `cancelled` - Already cancelled

For non-draft proforma invoices, use the [cancel endpoint](/api-reference/proforma-invoices/cancel) instead to mark them as cancelled without deleting historical data.

### Referential Integrity
- Deleting a proforma does not affect the invoice number series
- The series counter is not rolled back
- If the proforma was converted to an invoice, the invoice is **not** deleted

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Proforma invoice not found or doesn't belong to the company |
| 409 | `conflict` | Proforma status prevents deletion (not in draft) |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be deleted",
    "details": {
      "status": "sent",
      "reason": "Only draft proforma invoices can be deleted. Use cancel instead."
    }
  }
}
```

### Not Found

```json
{
  "error": {
    "code": "not_found",
    "message": "Proforma invoice not found"
  }
}
```

## Best Practices

### When to Delete vs Cancel

**Delete** when:
- The proforma was created by mistake
- The proforma is still in draft and hasn't been shared
- You want to remove all traces of the document

**Cancel** when:
- The proforma has been sent to the client
- You need to maintain audit trail
- The proforma was accepted/rejected but the deal fell through
- You need historical records for reporting

### Audit Considerations

Deleted proforma invoices:
- Are permanently removed from the database
- Do not appear in reports or exports
- Cannot be recovered
- Do not leave audit trail entries

For compliance and audit purposes, consider using the cancel endpoint instead of delete, especially for proforma invoices that were shared externally.
