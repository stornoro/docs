---
title: Delete Proforma Invoice
description: Delete a proforma invoice (draft or cancelled status only)
method: DELETE
endpoint: /api/v1/proforma-invoices/{uuid}
---

# Delete Proforma Invoice

Deletes a proforma invoice. Only proformas in `draft` or `cancelled` status can be deleted. A deleted proforma no longer appears in the API.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not read by this endpoint. The proforma is found by its id and must belong to your organization |

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

## Restrictions

Only proformas with status `draft` or `cancelled` can be deleted.

Proformas in these states cannot be deleted:

- `sent`
- `accepted`
- `rejected`
- `converted`
- `expired`

To remove a `sent` or `accepted` proforma, [cancel](/api-reference/proforma-invoices/cancel) it first, then delete it.

The invoice number series is not rolled back when a proforma is deleted. If the proforma was converted to an invoice, the invoice is not affected.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the invoice delete permission |
| 404 | Proforma not found, or it belongs to another organization |
| 422 | The status does not allow deletion |

Errors return a JSON body with a single `error` message, for example `{"error": "Proforma not found."}`.

```json
{
  "error": "Proforma nu poate fi stearsa."
}
```
