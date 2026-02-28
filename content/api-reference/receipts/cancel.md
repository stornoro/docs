---
title: Cancel Receipt
description: Cancel a receipt to void it from fiscal records
method: POST
endpoint: /api/v1/receipts/{uuid}/cancel
---

# Cancel Receipt

Cancels a receipt by transitioning it to `cancelled` status. Cancellation is used when a transaction must be voided — for example, when an item is returned, when the wrong products were rung up, or when a payment was reversed.

Unlike deletion, cancellation preserves the receipt for historical records and audit trail. For issued receipts, cancellation on the physical fiscal device must be performed separately in accordance with ANAF regulations.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the receipt to cancel |

## Request Body (Optional)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cancellationReason` | string | No | Reason for cancellation |
| `cancellationNotes` | string | No | Internal notes about the cancellation |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "cancellationReason": "Customer returned all items",
    "cancellationNotes": "Full refund issued to customer card"
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/cancel', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cancellationReason: 'Customer returned all items',
    cancellationNotes: 'Full refund issued to customer card'
  })
});

const data = await response.json();
```

## Response

Returns the updated receipt with `status = cancelled` and `cancelledAt` timestamp:

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "BON-2026-042",
  "status": "cancelled",
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
  "cancellationReason": "Customer returned all items",
  "cancellationNotes": "Full refund issued to customer card",
  "issuedAt": "2026-02-18T10:15:00Z",
  "cancelledAt": "2026-02-18T11:00:00Z",
  "createdAt": "2026-02-18T10:14:00Z",
  "updatedAt": "2026-02-18T11:00:00Z"
}
```

## State Changes

### Status Transition
- **Before:** Any status except `invoiced` or `cancelled`
- **After:** `status = cancelled`

### Timestamp
- Sets `cancelledAt` to current UTC timestamp (ISO 8601 format)
- Updates `updatedAt` timestamp

### Restrictions Applied
Once cancelled:
- Cannot be converted to invoice
- Cannot be issued (if was in draft)
- Cannot be edited or deleted
- Serves as historical record only

## Validation Rules

Can cancel receipts in these statuses:
- `draft` — Not yet printed
- `issued` — Already printed and handed to customer

Cannot cancel receipts in these statuses:
- `invoiced` — Already converted to a formal invoice (use credit note instead)
- `cancelled` — Already cancelled

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Receipt not found or doesn't belong to the company |
| 409 | `conflict` | Receipt status prevents cancellation (already invoiced or cancelled) |
| 422 | `validation_error` | Invalid request body |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict - Already Cancelled

```json
{
  "error": {
    "code": "conflict",
    "message": "Receipt cannot be cancelled",
    "details": {
      "status": "cancelled",
      "reason": "Receipt is already cancelled",
      "cancelledAt": "2026-02-18T11:00:00Z"
    }
  }
}
```

### Status Conflict - Already Invoiced

```json
{
  "error": {
    "code": "conflict",
    "message": "Receipt cannot be cancelled",
    "details": {
      "status": "invoiced",
      "reason": "Receipt has already been converted to an invoice. Use a credit note to reverse the invoice instead.",
      "convertedInvoiceId": "650e8400-e29b-41d4-a716-446655440222",
      "convertedInvoiceNumber": "FAC-2026-050"
    }
  }
}
```

## Fiscal Compliance Note

Cancelling a receipt in the system does not automatically void the physical fiscal receipt. For **issued** receipts, you must also:

1. Issue a cancellation receipt on the physical fiscal cash register device according to ANAF regulations
2. Keep the cancellation receipt as part of the Z report records
3. Ensure the cancellation is reflected in the daily Z report

For **draft** receipts that were never printed on the fiscal device, no additional fiscal action is required.

## Common Cancellation Reasons

- **Customer returned items** — Customer brought back purchased goods
- **Wrong items rung up** — Cashier entered incorrect products
- **Payment reversed** — Card payment was declined or reversed after printing
- **Duplicate receipt** — Same transaction printed twice by mistake
- **Customer complaint** — Transaction disputed by customer
- **System error** — POS system error caused incorrect receipt

## Recovery After Cancellation

### Undo Accidental Cancellation
If the receipt was cancelled by mistake, use the `POST /api/v1/receipts/{uuid}/restore` endpoint to restore it back to `draft` status.

### Create Corrected Receipt
If the original transaction data was wrong:
1. Cancel the incorrect receipt
2. Create a new receipt with the correct data (`POST /api/v1/receipts`)
3. Issue the new receipt

## Related Endpoints

- [Restore receipt](/api-reference/receipts/restore) - Restore an accidentally cancelled receipt
- [Convert to invoice](/api-reference/receipts/convert) - Convert an issued receipt to a formal invoice
- [Get email history](/api-reference/receipts/email-history) - View previously sent emails
