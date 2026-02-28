---
title: Cancel invoice
description: Cancel an issued invoice
---

# Cancel invoice

Cancels an issued invoice by changing its status to `cancelled`. Cancelled invoices remain in the system for record-keeping but are marked as void. A cancellation reason is required.

```
POST /api/v1/invoices/{uuid}/cancel
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `reason` | string | Yes | Reason for cancellation (minimum 10 characters) |

{% callout type="warning" %}
Cancelled invoices cannot be edited or reissued. To reverse a cancelled invoice, you must create a new invoice. Use the [restore endpoint](/api-reference/invoices/restore) only for accidental cancellations.
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

Returns the updated invoice object with status `cancelled`.

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "number": "FAC-2024-001",
  "status": "cancelled",
  "direction": "outgoing",
  "currency": "RON",
  "issueDate": "2024-02-15",
  "dueDate": "2024-03-15",
  "subtotal": 1000.00,
  "vatTotal": 190.00,
  "total": 1190.00,
  "amountPaid": 0.00,
  "balance": 0.00,
  "cancellationReason": "Client requested cancellation due to incorrect billing information",
  "cancelledAt": "2024-02-16T14:30:00Z",
  "cancelledBy": {
    "id": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
    "name": "John Doe",
    "email": "john@yourcompany.ro"
  },
  "events": [
    {
      "id": "6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
      "type": "status_change",
      "status": "cancelled",
      "timestamp": "2024-02-16T14:30:00Z",
      "details": "Invoice cancelled",
      "metadata": {
        "reason": "Client requested cancellation due to incorrect billing information"
      }
    }
  ],
  "updatedAt": "2024-02-16T14:30:00Z"
}
```

## What happens when you cancel an invoice

1. **Status change** - Invoice status changes to `cancelled`
2. **Balance zeroed** - Any remaining balance is set to zero
3. **Event logged** - Cancellation event recorded with reason and user
4. **Audit trail** - Cancellation cannot be undone (except via restore for accidental cancellations)
5. **Provider notification** - If the invoice was submitted to the e-invoice provider, a cancellation notice may be sent (depending on provider requirements)

{% callout type="info" %}
To properly reverse an invoice for accounting purposes, consider creating a **credit note** instead of cancelling. Credit notes provide a proper audit trail and are the preferred method for invoice corrections.
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

| Code | Description |
|------|-------------|
| `400` | Validation error - missing or invalid cancellation reason |
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company or insufficient permissions |
| `404` | Invoice not found |
| `409` | Invoice cannot be cancelled in current status (e.g., already cancelled) |
| `422` | Business rule violation (e.g., invoice has associated credit notes) |

## Related endpoints

- [Restore invoice](/api-reference/invoices/restore) - Restore a cancelled invoice
- [Create credit note](/api-reference/credit-notes/create) - Create a credit note to reverse an invoice
- [Invoice events](/api-reference/invoices/events) - View cancellation history
