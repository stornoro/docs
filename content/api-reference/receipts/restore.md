---
title: Restore Receipt
description: Restore a cancelled receipt back to draft status
method: POST
endpoint: /api/v1/receipts/{uuid}/restore
---

# Restore Receipt

Restores a cancelled receipt back to `draft` status. Use this endpoint to undo an accidental cancellation. The receipt can then be edited and re-issued.

Only receipts in `cancelled` status can be restored.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the receipt to restore |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/restore \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/restore', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

Returns the restored receipt with `status = draft` and `cancelledAt` cleared:

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "BON-2026-042",
  "seriesId": "850e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "850e8400-e29b-41d4-a716-446655440000",
    "name": "BON",
    "nextNumber": 43
  },
  "status": "draft",
  "issueDate": "2026-02-18",
  "currency": "RON",
  "subtotal": "210.92",
  "vatAmount": "40.08",
  "total": "251.00",
  "paymentMethod": "mixed",
  "cashPayment": "100.00",
  "cardPayment": "151.00",
  "otherPayment": "0.00",
  "cashRegisterName": "Casa 1 - Front Desk",
  "fiscalNumber": "AAAA123456",
  "cancellationReason": null,
  "cancellationNotes": null,
  "issuedAt": null,
  "cancelledAt": null,
  "createdAt": "2026-02-18T10:14:00Z",
  "updatedAt": "2026-02-18T11:30:00Z"
}
```

## State Changes

- **Status:** Changed from `cancelled` → `draft`
- **cancelledAt:** Cleared (set to `null`)
- **cancellationReason:** Cleared (set to `null`)
- **cancellationNotes:** Cleared (set to `null`)
- **updatedAt:** Updated to current UTC timestamp

After restoring, the receipt can be edited, re-issued, or deleted.

## Validation Rules

- Receipt must be in `cancelled` status
- Cannot restore a receipt that is `draft`, `issued`, or `invoiced`

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Receipt not found or doesn't belong to the company |
| 422 | `validation_error` | Receipt is not in cancelled status |
| 500 | `internal_error` | Server error occurred |

## Example Error Response

### Not Cancelled

```json
{
  "error": {
    "code": "validation_error",
    "message": "Receipt cannot be restored",
    "details": {
      "status": "draft",
      "reason": "Only cancelled receipts can be restored"
    }
  }
}
```

## Fiscal Compliance Note

Restoring a receipt in the system to `draft` does not automatically reverse any fiscal cancellation receipt that was issued on the physical cash register device. If a cancellation receipt was printed on the device, you must handle the fiscal correction separately in accordance with ANAF regulations.

Restore is most appropriate for receipts that were cancelled in the system but where no physical cancellation receipt was printed yet.

## Workflow Integration

### Restore Flow
1. Identify accidentally cancelled receipt
2. **Call restore endpoint** (`POST /api/v1/receipts/{uuid}/restore`) ← You are here
3. Optionally edit the receipt if needed
4. Re-issue the receipt (`POST /api/v1/receipts/{uuid}/issue`)

## Related Endpoints

- [Cancel receipt](/api-reference/receipts/cancel) - Cancel a receipt
- [Issue receipt](/api-reference/receipts/issue) - Issue the restored draft
- [Update receipt](/api-reference/receipts/update) - Edit the restored draft
