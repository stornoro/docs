---
title: Delete invoice payment
description: Delete a recorded payment from an invoice.
---

# Delete invoice payment

Deletes a recorded payment from an invoice. The invoice `amountPaid`, `balance` and `paidAt` are recalculated from the remaining payments. The invoice `status` is not changed.

```http
DELETE /api/v1/invoices/{uuid}/payments/{paymentId}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the invoice |
| `paymentId` | string | Yes | The UUID of the payment to delete |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | UUID of the company context. The invoice is found by its UUID, so the header is not used |

## Response

Returns `204 No Content` with no response body.

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/invoices/invoice-uuid-1/payments/payment-uuid-2' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```http
HTTP/1.1 204 No Content
```

## Behavior

Deleting a payment:

1. Removes the payment record. The deletion cannot be undone.
2. Sets `amountPaid` to the sum of the remaining payments, and `balance` to `total` minus `amountPaid`.
3. Clears `paidAt` when the remaining payments do not cover the total, and clears the invoice `paymentMethod` when no payments remain.

The invoice `status` is not changed.

## Use Cases

### Correcting errors

Delete an incorrectly recorded payment and record a new one with the correct details.

### Reversing payments

Remove a payment that was later reversed or refunded.

### Data cleanup

Clean up duplicate or test payments.

## Errors

Error responses have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | The invoice is not accessible to the caller, or the caller lacks the payment delete permission |
| 404 | Invoice not found, or the payment does not belong to the invoice |

## Important Notes

- Check `amountPaid`, `balance` and `paidAt` on the invoice after a deletion.
- Consider the accounting implications before deleting payments, and keep a record of the reason outside Storno.

## Related Endpoints

- [List payments](/api-reference/payments/list)
- [Record payment](/api-reference/payments/create)
- [Get invoice](/api-reference/invoices/get)
