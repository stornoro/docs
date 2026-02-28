---
title: Restore cancelled invoice
description: Restore a cancelled invoice back to draft status
---

# Restore cancelled invoice

Restores a cancelled invoice back to `draft` status. This endpoint should only be used for accidental cancellations. Changes the invoice status from `cancelled` back to `draft`, allowing it to be edited and reissued.

```
POST /api/v1/invoices/{uuid}/restore
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

{% callout type="warning" %}
Restoring an invoice should be done carefully. If the invoice was already sent to clients or submitted to ANAF, restoring may cause confusion. Consider creating a new invoice instead.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/restore \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/restore', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const invoice = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the updated invoice object with status `draft`.

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "number": "FAC-2024-001",
  "status": "draft",
  "direction": "outgoing",
  "currency": "RON",
  "issueDate": "2024-02-15",
  "dueDate": "2024-03-15",
  "subtotal": 1000.00,
  "vatTotal": 190.00,
  "total": 1190.00,
  "amountPaid": 0.00,
  "balance": 1190.00,
  "cancellationReason": null,
  "cancelledAt": null,
  "cancelledBy": null,
  "restoredAt": "2024-02-16T15:00:00Z",
  "restoredBy": {
    "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
    "name": "John Doe",
    "email": "john@yourcompany.ro"
  },
  "events": [
    {
      "id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
      "type": "status_change",
      "status": "draft",
      "timestamp": "2024-02-16T15:00:00Z",
      "details": "Invoice restored from cancelled status"
    }
  ],
  "updatedAt": "2024-02-16T15:00:00Z"
}
```

## What happens when you restore an invoice

1. **Status change** - Invoice status changes from `cancelled` to `draft`
2. **Cancellation data cleared** - Cancellation reason, date, and user are cleared
3. **Balance restored** - Invoice balance is recalculated based on payments
4. **Editable again** - Invoice can now be edited and reissued
5. **Event logged** - Restoration event recorded with timestamp and user

After restoration, you can:
- Edit invoice details
- Modify line items
- Delete the invoice
- Reissue the invoice

## When to use restore vs. create new

| Scenario | Action |
|----------|--------|
| Accidental cancellation | Restore |
| Invoice number must be preserved | Restore |
| Invoice not yet sent | Restore (safe) |
| Invoice sent to client | Create new invoice |
| Invoice submitted to ANAF | Create new invoice |
| Need different amounts | Create new invoice |

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company or insufficient permissions |
| `404` | Invoice not found |
| `409` | Invoice is not cancelled or cannot be restored |
| `422` | Business rule violation (e.g., invoice has payments or was submitted to ANAF) |

## Restrictions

An invoice **cannot** be restored if:
- It was submitted to ANAF and validated
- It has associated credit notes
- It has recorded payments (payments must be removed first)
- It was cancelled more than 30 days ago (configurable)
- The invoice series has been deleted

## Related endpoints

- [Cancel invoice](/api-reference/invoices/cancel) - Cancel an invoice
- [Update invoice](/api-reference/invoices/update) - Edit the restored invoice
- [Delete invoice](/api-reference/invoices/delete) - Delete the restored draft
- [Invoice events](/api-reference/invoices/events) - View restoration history
