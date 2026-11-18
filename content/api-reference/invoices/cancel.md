---
title: Cancel invoice
description: Cancel a draft or issued invoice
---

# Cancel invoice

Cancels an invoice by changing its status to `cancelled`. Only a `draft` invoice, or an `issued` invoice that has not been uploaded to ANAF, can be cancelled. Cancelled invoices remain in the system but are marked as void. A cancellation reason is optional.

```
POST /api/v1/invoices/{uuid}/cancel
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not used on this route: the invoice is found by its UUID |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `reason` | string | No | Reason for cancellation, stored on the invoice |

{% callout type="warning" %}
A cancelled invoice cannot be edited or issued. The [restore endpoint](/api-reference/invoices/restore) turns it back into a draft. An invoice that was already uploaded to ANAF cannot be cancelled; reverse it with a credit note instead.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Client requested cancellation due to incorrect billing information"
  }'
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/cancel', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reason: 'Client requested cancellation due to incorrect billing information'
  })
});

const invoice = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the invoice object (same shape as [Get invoice details](/api-reference/invoices/get)) with status `cancelled`. Amounts are strings and `amountPaid` and `balance` are left as they were.

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "number": "FAC0001",
  "status": "cancelled",
  "direction": "outgoing",
  "currency": "RON",
  "issueDate": "2024-02-15T00:00:00+00:00",
  "dueDate": "2024-03-15T00:00:00+00:00",
  "subtotal": "1000.00",
  "vatTotal": "210.00",
  "total": "1210.00",
  "amountPaid": "0.00",
  "balance": "1210.00",
  "cancellationReason": "Client requested cancellation due to incorrect billing information",
  "cancelledAt": "2024-02-16T14:30:00+00:00",
  "scheduledSendAt": null,
  "scheduledEmailAt": null
}
```

## What happens when you cancel an invoice

1. The status changes to `cancelled`, and `cancelledAt` and `cancellationReason` are set.
2. A scheduled automatic e-Factura submission and a scheduled email are removed.
3. An event with the reason and the previous status is recorded in the [invoice events](/api-reference/invoices/events).
4. Payments and the balance are not changed.

{% callout type="info" %}
To properly reverse an invoice for accounting purposes, consider creating a **credit note** instead of cancelling. A credit note keeps the original invoice in the records and is the way to correct an invoice that was already uploaded to ANAF.
{% /callout %}

## When to cancel vs. credit note

| Scenario | Action |
|----------|--------|
| Invoice not yet sent to client | Cancel |
| Duplicate invoice created | Cancel |
| Invoice created in error | Cancel |
| Need to correct amounts/items | Create credit note |
| Partial refund required | Create credit note |
| Already recorded in accounting | Create credit note |

## Error codes

Error bodies have the form `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | The invoice belongs to another organization, or the user cannot cancel invoices |
| `404` | Invoice not found |
| `422` | The invoice is not a draft or an issued invoice, or it was already uploaded to ANAF |

## Related endpoints

- [Restore invoice](/api-reference/invoices/restore) - Restore a cancelled invoice
- [Create credit note](/api-reference/credit-notes/create) - Create a credit note to reverse an invoice
- [Invoice events](/api-reference/invoices/events) - View cancellation history
