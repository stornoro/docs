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
| `X-Company` | string | No | Not used on this route: the invoice is found by its UUID |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

{% callout type="warning" %}
Restoring an invoice should be done carefully. If the invoice was already sent to the client, restoring may cause confusion. Consider creating a new invoice instead.
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

Returns the invoice object (same shape as [Get invoice details](/api-reference/invoices/get)) with status `draft`.

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "number": "FAC0001",
  "status": "draft",
  "direction": "outgoing",
  "currency": "RON",
  "issueDate": "2024-02-15T00:00:00+00:00",
  "dueDate": "2024-03-15T00:00:00+00:00",
  "subtotal": "1000.00",
  "vatTotal": "210.00",
  "total": "1210.00",
  "amountPaid": "0.00",
  "balance": "1210.00",
  "cancellationReason": null,
  "cancelledAt": null
}
```

## What happens when you restore an invoice

1. The status changes from `cancelled` to `draft`.
2. `cancelledAt` and `cancellationReason` are cleared.
3. An event is recorded in the [invoice events](/api-reference/invoices/events).

The invoice keeps its number, payments and balance. After restoring you can edit it, delete it or issue it again.

## When to use restore

| Scenario | Action |
|----------|--------|
| Accidental cancellation | Restore |
| Invoice number must be preserved | Restore |
| Invoice sent to client | Create a new invoice |
| Need different amounts | Edit the restored draft, or create a new invoice |

## Error codes

Error bodies have the form `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | The invoice belongs to another organization, or the user cannot edit invoices |
| `404` | Invoice not found |
| `422` | The invoice is not cancelled |

## Related endpoints

- [Cancel invoice](/api-reference/invoices/cancel) - Cancel an invoice
- [Update invoice](/api-reference/invoices/update) - Edit the restored invoice
- [Delete invoice](/api-reference/invoices/delete) - Delete the restored draft
- [Invoice events](/api-reference/invoices/events) - View restoration history
