---
title: Restore Delivery Note
description: Restore a cancelled delivery note back to draft status
method: POST
endpoint: /api/v1/delivery-notes/{uuid}/restore
---

# Restore Delivery Note

Restores a cancelled delivery note back to `draft` status. Use this endpoint to undo an accidental cancellation. The delivery note can then be edited and re-issued.

Only delivery notes in `cancelled` status can be restored.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note to restore |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/restore \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/restore', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

Returns the restored delivery note with `status = draft` and `cancelledAt` cleared. The object has the fields described in [Get delivery note](/api-reference/delivery-notes/get#response); the example is abridged:

```json
{
  "id": "950e8400-e29b-41d4-a716-446655440000",
  "number": "DN0012",
  "client": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "cui": "12345678"
  },
  "status": "draft",
  "issueDate": "2026-02-18",
  "dueDate": "2026-03-18",
  "currency": "RON",
  "subtotal": "5000.00",
  "vatTotal": "1050.00",
  "total": "6050.00",
  "cancelledAt": null,
  "convertedInvoice": null
}
```

## State Changes

- **Status:** Changed from `cancelled` → `draft`
- **cancelledAt:** Cleared (set to `null`)

After restoring, the delivery note can be edited, re-issued, or deleted.

## Validation Rules

- Delivery note must be in `cancelled` status
- Cannot restore a delivery note that is `draft`, `issued`, or `converted`

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Delivery note not found or not in the caller's organization |
| 422 | The delivery note is not in `cancelled` status |

### Example error response

```json
{
  "error": "Only cancelled delivery notes can be restored."
}
```

## Workflow Integration

### Restore Flow
1. Identify accidentally cancelled delivery note
2. **Call restore endpoint** (`POST /api/v1/delivery-notes/{uuid}/restore`) ← You are here
3. Optionally edit the delivery note if needed
4. Re-issue the delivery note (`POST /api/v1/delivery-notes/{uuid}/issue`)

## Related Endpoints

- [Cancel delivery note](/api-reference/delivery-notes/cancel) - Cancel a delivery note
- [Issue delivery note](/api-reference/delivery-notes/issue) - Issue the restored draft
- [Update delivery note](/api-reference/delivery-notes/update) - Edit the restored draft
