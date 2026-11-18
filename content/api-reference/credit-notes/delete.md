---
title: Delete Credit Note
description: Delete a draft or cancelled credit note
method: DELETE
endpoint: /api/v1/invoices/{uuid}
---

# Delete Credit Note

Deletes a credit note. Credit notes use the invoice endpoint. Only a credit note in `draft` or `cancelled` status can be deleted. An issued credit note (status `refund`) and one submitted to ANAF cannot be deleted.

The credit note is soft-deleted: it is marked deleted and no longer appears in lists. When the deleted credit note held the latest number of its series and was never sent to ANAF, the series counter goes back by one.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not used by this endpoint. The credit note is found by its id |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The id of the credit note to delete |

## Request

```bash {% title="cURL" %}
curl -X DELETE https://api.storno.ro/api/v1/invoices/850e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/invoices/850e8400-e29b-41d4-a716-446655440000', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

// Success: 204 No Content (no response body)
if (response.status === 204) {
  console.log('Credit note deleted successfully');
}
```

## Response

`204 No Content` with an empty body.

## Restrictions

Only these statuses can be deleted:

- `draft`
- `cancelled`

Any other status, including `refund`, `sent_to_provider`, `validated` and `rejected`, returns `422`. To cancel a draft credit note before deleting it, use [Cancel invoice](/api-reference/invoices/cancel); `cancelled` credit notes can be restored with [Restore invoice](/api-reference/invoices/restore).

Deleting a draft credit note does not change the original invoice. The original invoice becomes `refunded` when the credit note is issued, and deleting a draft never reaches that point.

## Error codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | The invoice belongs to another organization or the user lacks the permission to delete |
| `404` | `Invoice not found.` |
| `422` | `Invoice cannot be deleted.` The status is not `draft` or `cancelled` |

```json
{
  "error": "Invoice cannot be deleted."
}
```

## Reversing an issued credit note

An issued credit note cannot be deleted or cancelled. To correct it, issue a new invoice for the amount.
