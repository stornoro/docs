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
| `X-Company` | string | Yes | Company UUID to scope the request |

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

Returns the restored delivery note with `status = draft` and `cancelledAt` cleared:

```json
{
  "uuid": "950e8400-e29b-41d4-a716-446655440000",
  "number": "DN-2026-012",
  "seriesId": "850e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "850e8400-e29b-41d4-a716-446655440000",
    "name": "DN",
    "nextNumber": 13
  },
  "clientId": "750e8400-e29b-41d4-a716-446655440000",
  "client": {
    "uuid": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "registrationNumber": "RO12345678",
    "email": "contact@client.ro"
  },
  "status": "draft",
  "issueDate": "2026-02-18",
  "dueDate": "2026-03-18",
  "currency": "RON",
  "exchangeRate": 1.0,
  "subtotal": "5000.00",
  "vatAmount": "950.00",
  "total": "5950.00",
  "cancellationReason": null,
  "cancellationNotes": null,
  "issuedAt": null,
  "cancelledAt": null,
  "createdAt": "2026-02-18T09:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z"
}
```

## State Changes

- **Status:** Changed from `cancelled` → `draft`
- **cancelledAt:** Cleared (set to `null`)
- **cancellationReason:** Cleared (set to `null`)
- **cancellationNotes:** Cleared (set to `null`)
- **updatedAt:** Updated to current UTC timestamp

After restoring, the delivery note can be edited, re-issued, or deleted.

## Validation Rules

- Delivery note must be in `cancelled` status
- Cannot restore a delivery note that is `draft`, `issued`, or `converted`

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Delivery note not found or doesn't belong to the company |
| 422 | `validation_error` | Delivery note is not in cancelled status |
| 500 | `internal_error` | Server error occurred |

## Example Error Response

### Not Cancelled

```json
{
  "error": {
    "code": "validation_error",
    "message": "Delivery note cannot be restored",
    "details": {
      "status": "draft",
      "reason": "Only cancelled delivery notes can be restored"
    }
  }
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
