---
title: Record invoice payment
description: Record a payment received for a specific invoice.
---

# Record invoice payment

Records a payment received for a specific invoice. This updates the invoice's `amountPaid` field and may change the invoice status to `paid` or `partially_paid`.

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
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Payment amount (must be > 0) |
| `paymentDate` | string | Yes | ISO 8601 date of payment |
| `paymentMethod` | string | No | Payment method (default: `bank_transfer`) |
| `currency` | string | No | Currency code (defaults to invoice currency) |
| `reference` | string | No | Payment reference number |
| `notes` | string | No | Additional notes about the payment |

## Response

Returns the created payment object with a `201 Created` status and the updated invoice summary.

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `payment` | object | The created payment object |
| `invoice` | object | Updated invoice summary |

### Invoice Summary

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Invoice UUID |
| `number` | string | Invoice number |
| `totalAmount` | number | Total invoice amount |
| `amountPaid` | number | Updated amount paid |
| `remainingAmount` | number | Remaining unpaid amount |
| `status` | string | Updated invoice status |

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
  "payment": {
    "uuid": "payment-uuid-1",
    "amount": 1500.00,
    "currency": "RON",
    "paymentDate": "2026-02-15",
    "paymentMethod": "bank_transfer",
    "reference": "TRF-2026-02-15-001",
    "notes": "Virament bancar în cont principal",
    "createdAt": "2026-02-15T14:30:00Z",
    "updatedAt": "2026-02-15T14:30:00Z"
  },
  "invoice": {
    "uuid": "invoice-uuid-1",
    "number": "FAC00245",
    "totalAmount": 2380.00,
    "amountPaid": 1500.00,
    "remainingAmount": 880.00,
    "status": "partially_paid"
  }
}
```

## Payment Methods

| Value | Description | Common Use Case |
|-------|-------------|-----------------|
| `bank_transfer` | Bank transfer | Default method, most common |
| `cash` | Cash payment | In-person transactions |
| `card` | Card payment | Credit/debit card transactions |
| `other` | Other method | Alternative payment systems |

## Invoice Status Updates

Recording a payment automatically updates the invoice status:

| Condition | Status |
|-----------|--------|
| `amountPaid` = 0 | `unpaid` |
| 0 < `amountPaid` < `totalAmount` | `partially_paid` |
| `amountPaid` ≥ `totalAmount` | `paid` |

## Validation Rules

- Payment amount must be greater than 0
- Payment date cannot be in the future
- Currency should match invoice currency (warning if different)
- Total payments cannot exceed invoice total by more than a small tolerance (e.g., 0.01)
- Payment date should not be before invoice issue date (warning only)

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Invoice not found or doesn't belong to company |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- Missing `amount` field
- Amount is zero or negative
- Missing `paymentDate` field
- Invalid date format
- Payment date is in the future
- Total payments exceed invoice total
- Currency mismatch with invoice

## Important Notes

- Recording a payment updates the invoice's `amountPaid` in real-time
- Overpayments are allowed with a tolerance but will generate a warning
- For partial payments, record each payment separately
- Payments are immutable once created; use delete to correct errors
- Payment data is preserved even if the invoice is later modified

## Related Endpoints

- [List payments](/api-reference/payments/list)
- [Delete payment](/api-reference/payments/delete)
- [Get invoice](/api-reference/invoices/get)
