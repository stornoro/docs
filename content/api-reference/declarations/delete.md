---
title: Delete Declaration
description: Soft-delete a tax declaration
method: DELETE
endpoint: /api/v1/declarations/{uuid}
---

# Delete Declaration

Soft-deletes a tax declaration, removing it from the active list. Deleting a declaration that was already submitted removes the local record only; it does not cancel the filing at ANAF.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the declaration to delete |

## Request

```bash {% title="cURL" %}
curl -X DELETE https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

// Success: 204 No Content (no response body)
if (response.status === 204) {
  console.log('Declaration deleted successfully');
}
```

## Response

**Success:** Returns `204 No Content` with an empty response body.

## Error Codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the `declaration.submit` permission |
| 404 | Declaration not found or it belongs to another company |

## Example error response

```json
{
  "error": "Declaration not found."
}
```
