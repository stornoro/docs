---
title: Issue Receipt
description: Mark a receipt as issued when it is printed on the fiscal cash register
method: POST
endpoint: /api/v1/receipts/{uuid}/issue
---

# Issue Receipt

Marks a receipt as issued, recording the moment the fiscal receipt is printed and handed to the customer. This action transitions the receipt from `draft` status to `issued` status and records the timestamp.

When the receipt is issued, the next sequential number from its assigned `receipt` series is permanently assigned. If no series was explicitly set on the receipt, the company's default `receipt` series is auto-found and used at this point.

Once issued, the receipt becomes immutable and can only be cancelled or converted to an invoice.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

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

Returns the updated receipt with `status = issued` and `issuedAt` timestamp:

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "BON-2026-042",
  "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "850e8400-e29b-41d4-a716-446655440000",
    "name": "BON",
    "nextNumber": 43
  },
  "status": "issued",
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
  "customerName": "Acme SRL",
  "customerCif": "RO12345678",
  "issuedAt": "2026-02-18T10:15:00Z",
  "cancelledAt": null,
  "convertedInvoiceId": null,
  "createdAt": "2026-02-18T10:14:00Z",
  "updatedAt": "2026-02-18T10:15:00Z"
}
```

## State Changes

### Status Transition
- **Before:** `status = draft`
- **After:** `status = issued`

### Series & Number Assignment
- The next sequential number from the assigned `receipt` series is permanently locked in
- If no `documentSeriesId` was set on the receipt, the company's default `receipt` series is auto-found and assigned at this point
- Once issued, the series and document number cannot be changed

### Timestamp
- Sets `issuedAt` to current UTC timestamp (ISO 8601 format)
- Updates `updatedAt` timestamp

### Restrictions Applied
Once marked as issued:
- Cannot be updated (PUT requests will fail)
- Cannot be deleted (DELETE requests will fail)
- Can be cancelled or converted to an invoice

## Validation Rules

- Receipt must have `status = draft`
- Cannot issue a receipt that is already issued, invoiced, or cancelled
- Receipt must have at least one line item

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Receipt not found or doesn't belong to the company |
| 409 | `conflict` | Receipt status prevents issuing (not in draft status) |
| 422 | `validation_error` | Receipt data is incomplete or invalid |
| 500 | `internal_error` | Server error occurred |

## Example Error Response

### Status Conflict

```json
{
  "error": {
    "code": "conflict",
    "message": "Receipt cannot be issued",
    "details": {
      "status": "issued",
      "reason": "Receipt is already marked as issued",
      "issuedAt": "2026-02-18T10:15:00Z"
    }
  }
}
```

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
