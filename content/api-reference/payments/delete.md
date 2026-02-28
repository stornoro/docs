---
title: Delete invoice payment
description: Delete a recorded payment from an invoice.
---

# Delete invoice payment

Deletes a recorded payment from an invoice. This updates the invoice's `amountPaid` field and may change the invoice status.

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
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns a `204 No Content` status on successful deletion with no response body.

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

1. Removes the payment record permanently
2. Decreases the invoice's `amountPaid` by the payment amount
3. Recalculates the invoice status based on remaining payments:
   - If `amountPaid` becomes 0, status changes to `unpaid`
   - If 0 < `amountPaid` < `totalAmount`, status becomes `partially_paid`
   - If `amountPaid` ≥ `totalAmount`, status remains `paid`

## Use Cases

### Correcting Errors

Delete an incorrectly recorded payment and create a new one with correct details.

### Reversing Payments

Remove a payment that was later reversed or refunded.

### Data Cleanup

Clean up duplicate or test payments.

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Invoice or payment not found, or doesn't belong to company |

## Important Notes

- This is a permanent delete operation - data cannot be recovered
- The invoice's `amountPaid` is automatically recalculated
- The invoice status is automatically updated based on remaining payments
- Consider the accounting implications before deleting payments
- For audit purposes, you may want to record the deletion reason externally

## Recommended Approach

Instead of deleting:

1. **Add a correction payment** - For accounting accuracy, consider adding a negative payment or correction entry
2. **Document the reason** - Keep external notes explaining why payments were deleted
3. **Verify impact** - Check the updated invoice status after deletion

## Related Endpoints

- [List payments](/api-reference/payments/list)
- [Record payment](/api-reference/payments/create)
- [Get invoice](/api-reference/invoices/get)
