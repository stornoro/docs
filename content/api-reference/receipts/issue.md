---
title: Issue Receipt
description: Mark a receipt as issued when it is printed on the fiscal cash register
method: POST
endpoint: /api/v1/receipts/{uuid}/issue
---

# Issue Receipt

Marks a receipt as issued, recording the moment the fiscal receipt is printed and handed to the customer. This action transitions the receipt from `draft` status to `issued` status and records the timestamp.

When the receipt is issued, the next sequential number from its assigned `receipt` series is permanently assigned. If no series was explicitly set on the receipt, the company's default `receipt` series is auto-found and used at this point. When the company has no `receipt` series, the receipt is issued and keeps its temporary number.

Once issued, the receipt keeps its number and can be cancelled, refunded or converted to an invoice.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Company UUID. Not used to find the receipt; access is checked against your organization |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the receipt to mark as issued |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/issue \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/issue', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

Returns the receipt in the same shape as [Get receipt](/api-reference/receipts/get), with `status = issued` and `issuedAt` set (`lines` abbreviated here):

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "BON0042",
  "documentSeries": {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "prefix": "BON",
    "nextNumber": "BON0043"
  },
  "status": "issued",
  "currency": "RON",
  "issueDate": "2026-02-18T00:00:00+02:00",
  "subtotal": "210.92",
  "vatTotal": "40.08",
  "total": "251.00",
  "discount": "0.00",
  "paymentMethod": "mixed",
  "cashPayment": "100.00",
  "cardPayment": "151.00",
  "otherPayment": "0.00",
  "cashRegisterName": "Casa 1 - Front Desk",
  "fiscalNumber": "AAAA123456",
  "customerName": "Acme SRL",
  "customerCif": "RO12345678",
  "lines": [],
  "convertedInvoice": null,
  "issuedAt": "2026-02-18T10:15:00+00:00",
  "cancelledAt": null,
  "refundOf": null,
  "refundedBy": []
}
```

## State Changes

### Status Transition
- **Before:** `status = draft`
- **After:** `status = issued`

### Series & Number Assignment
- The next sequential number from the assigned `receipt` series is permanently locked in
- If no `documentSeriesId` was set on the receipt, the company's default `receipt` series is auto-found and assigned at this point
- The document number does not change after it is assigned

### Timestamp
- Sets `issuedAt` to the current time (ISO 8601 format)

### Restrictions Applied
Once issued:
- The receipt can still be updated with `PUT`, but its number does not change
- It cannot be deleted
- It can be cancelled, refunded or converted to an invoice

## Validation Rules

- Receipt must have `status = draft`. Any other status is refused with 422

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Receipt not found or not in your organization |
| 422 | Receipt is not in `draft` status |

Error responses have the form `{"error": "message"}`.

## Workflow Integration

### Standard POS Flow
1. Create receipt draft (`POST /api/v1/receipts`)
2. Print receipt on fiscal cash register device
3. **Mark as issued** (`POST /api/v1/receipts/{uuid}/issue`) ← You are here
4. Hand receipt to customer
5. If customer requests invoice, convert (`POST /api/v1/receipts/{uuid}/convert`)

## Reversibility

There is no "unissue" action. Once issued, the receipt remains in `issued` status until:
- You cancel it (→ `cancelled`)
- You convert it to an invoice (→ `invoiced`)

If issued by mistake:
1. Cannot revert to draft
2. Must cancel if needed (requires cancellation receipt on the fiscal device)
3. Create a new receipt if the transaction was entered incorrectly

## Related Endpoints

- [Cancel receipt](/api-reference/receipts/cancel) - Cancel an issued receipt
- [Convert receipt to invoice](/api-reference/receipts/convert) - Convert to a formal invoice
- [Update receipt](/api-reference/receipts/update) - Edit the draft before issuing
