---
title: Record invoice payment
description: Record a payment received for a specific invoice.
---

# Record invoice payment

Records a payment on an invoice. The payment updates the invoice `amountPaid`, `balance` and `paidAt`. It does not change the invoice `status`.

```http
POST /api/v1/invoices/{uuid}/payments
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the invoice |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | UUID of the company context. The invoice is found by its UUID, so the header is not used |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number or string | Yes | Payment amount. Must be greater than 0 and not more than the invoice `balance` |
| `paymentMethod` | string | Yes | Payment method, for example `bank_transfer`, `cash` or `card`. The value is stored as sent |
| `paymentDate` | string | No | Date of payment (ISO 8601). Defaults to the current date and time |
| `currency` | string | No | Currency code. Defaults to the invoice currency |
| `reference` | string | No | Payment reference number |
| `notes` | string | No | Additional notes about the payment |

## Response

Returns `201 Created` with the created payment object. The response does not include the invoice.

### Payment object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Payment UUID |
| `amount` | string | Payment amount, for example `"1500.00"` |
| `currency` | string | Currency code |
| `paymentDate` | string | ISO 8601 date and time |
| `paymentMethod` | string | Payment method |
| `reference` | string or null | Payment reference number |
| `notes` | string or null | Additional notes |
| `isReconciled` | boolean | Whether the payment was matched to a bank transaction |
| `receiptNumber` | string or null | Receipt (chitanta) number, once issued |
| `receiptDate` | string or null | Receipt date |
| `receiptIssuedAt` | string or null | When the receipt was issued |
| `receiptSeriesId` | string or null | UUID of the receipt series |
| `createdAt` | string | ISO 8601 creation timestamp |

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/invoices/invoice-uuid-1/payments' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 1500.00,
    "paymentDate": "2026-02-15",
    "paymentMethod": "bank_transfer",
    "currency": "RON",
    "reference": "TRF-2026-02-15-001",
    "notes": "Virament bancar în cont principal"
  }'
```

## Example Response

```json
{
  "id": "payment-uuid-1",
  "amount": "1500.00",
  "currency": "RON",
  "paymentDate": "2026-02-15T00:00:00+00:00",
  "paymentMethod": "bank_transfer",
  "reference": "TRF-2026-02-15-001",
  "notes": "Virament bancar în cont principal",
  "isReconciled": false,
  "receiptNumber": null,
  "receiptDate": null,
  "receiptIssuedAt": null,
  "receiptSeriesId": null,
  "createdAt": "2026-02-15T14:30:00+00:00"
}
```

## Effect on the invoice

Recording a payment recalculates these invoice fields:

| Field | Value after the payment |
|-------|-------------------------|
| `amountPaid` | Sum of all payments on the invoice |
| `balance` | `total` minus `amountPaid` |
| `paidAt` | The date of the latest payment when `amountPaid` reaches `total`, otherwise null |
| `paymentMethod` | The method of the latest payment when the invoice is fully paid, otherwise unchanged |

The invoice `status` is not changed. There is no `unpaid` status. To find out whether an invoice is paid, read `amountPaid`, `balance` and `paidAt` from [Get invoice](/api-reference/invoices/get).

## Validation Rules

- `amount` must be greater than 0.
- `amount` cannot exceed the current invoice `balance`.
- Invoices with a zero or negative total are settled automatically and do not accept payments.

Payment date and currency are not checked against the invoice.

## Errors

Error responses have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 400 | `amount` or `paymentMethod` is missing or empty |
| 401 | Invalid or missing authentication token |
| 403 | The invoice is not accessible to the caller, or the caller lacks the payment create permission |
| 404 | Invoice not found |
| 422 | The amount is not greater than zero, exceeds the remaining balance, or the invoice has a zero or negative total |

## Important Notes

- For partial payments, record each payment separately.
- Payments cannot be edited. Use [delete](/api-reference/payments/delete) to correct a mistake.
- A `payment.received` webhook event is sent when a payment is recorded.

## Related Endpoints

- [List payments](/api-reference/payments/list)
- [Delete payment](/api-reference/payments/delete)
- [Cash receipt for a payment](/api-reference/payments/receipt)
- [Get invoice](/api-reference/invoices/get)
