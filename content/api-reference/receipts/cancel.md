---
title: Cancel Receipt
description: Cancel a receipt to void it from fiscal records
method: POST
endpoint: /api/v1/receipts/{uuid}/cancel
---

# Cancel Receipt

Cancels a receipt by transitioning it to `cancelled` status. Cancellation is used when a transaction must be voided — for example, when an item is returned, when the wrong products were rung up, or when a payment was reversed.

Unlike deletion, a cancelled receipt stays visible in lists with status `cancelled`. For issued receipts, cancellation on the physical fiscal device must be performed separately in accordance with ANAF regulations.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Company UUID. Not used to find the receipt; access is checked against your organization |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the receipt to cancel |

## Request Body

The endpoint takes no body.

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/cancel', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const data = await response.json();
```

## Response

Returns the receipt in the same shape as [Get receipt](/api-reference/receipts/get), with `status = cancelled` and `cancelledAt` set (`lines` abbreviated here):

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "BON0042",
  "documentSeries": {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "prefix": "BON",
    "nextNumber": "BON0043"
  },
  "status": "cancelled",
  "currency": "RON",
  "issueDate": "2026-02-18T00:00:00+02:00",
  "subtotal": "210.92",
  "vatTotal": "40.08",
  "total": "251.00",
  "paymentMethod": "mixed",
  "cashPayment": "100.00",
  "cardPayment": "151.00",
  "otherPayment": "0.00",
  "cashRegisterName": "Casa 1 - Front Desk",
  "fiscalNumber": "AAAA123456",
  "lines": [],
  "issuedAt": "2026-02-18T10:15:00+00:00",
  "cancelledAt": "2026-02-18T11:00:00+00:00"
}
```

## State Changes

### Status Transition
- **Before:** Any status except `invoiced` or `cancelled`
- **After:** `status = cancelled`

### Timestamp
- Sets `cancelledAt` to the current time (ISO 8601 format)

### Restrictions Applied
Once cancelled:
- Cannot be converted to invoice
- Cannot be refunded
- Can be restored to `draft`, or deleted
- Serves as historical record

## Validation Rules

Can cancel receipts in these statuses:
- `draft` — Not yet printed
- `issued` — Already printed and handed to customer

Cannot cancel receipts in these statuses:
- `invoiced` — Already converted to a formal invoice (use credit note instead)
- `cancelled` — Already cancelled

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Receipt not found or not in your organization |
| 422 | Receipt is already invoiced or already cancelled |

Error responses have the form `{"error": "message"}`.

## Fiscal Compliance Note

Cancelling a receipt in the system does not automatically void the physical fiscal receipt. For **issued** receipts, you must also:

1. Issue a cancellation receipt on the physical fiscal cash register device according to ANAF regulations
2. Keep the cancellation receipt as part of the Z report records
3. Ensure the cancellation is reflected in the daily Z report

For **draft** receipts that were never printed on the fiscal device, no additional fiscal action is required.

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
