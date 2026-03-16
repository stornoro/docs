---
title: Delete Declaration
description: Soft-delete a tax declaration (not allowed for accepted declarations)
method: DELETE
endpoint: /api/v1/declarations/{uuid}
---

# Delete Declaration

Soft-deletes a tax declaration, removing it from the active list. Accepted declarations cannot be deleted to preserve the fiscal audit trail. Declarations in all other statuses (`draft`, `validated`, `submitted`, `processing`, `rejected`, `error`) may be deleted.

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

## Restrictions

Declarations in `accepted` status **cannot** be deleted. Accepted declarations represent filings on record with ANAF and must be retained for audit purposes.

All other statuses can be deleted:
- `draft` — Not yet submitted; safe to remove
- `validated` — XML generated but not submitted
- `submitted` / `processing` — In-flight submissions; deletion removes the local record but does not cancel the submission at ANAF
- `rejected` / `error` — Failed submissions that are no longer needed

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Declaration not found or doesn't belong to the company |
| 409 | `conflict` | Declaration is in `accepted` status and cannot be deleted |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict — Accepted

```json
{
  "error": {
    "code": "conflict",
    "message": "Declaration cannot be deleted",
    "details": {
      "status": "accepted",
      "reason": "Accepted declarations cannot be deleted"
    }
  }
}
```

### Not Found

```json
{
  "error": {
    "code": "not_found",
    "message": "Declaration not found"
  }
}
```
