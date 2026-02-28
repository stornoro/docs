---
title: List invoice payments
description: Retrieve all payments recorded for a specific invoice.
---

# List invoice payments

Retrieves all payments recorded for a specific invoice, ordered by payment date (most recent first).

```http
GET /api/v1/invoices/{uuid}/payments
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

## Response

Returns an array of payment objects.

### Payment Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `amount` | number | Payment amount |
| `currency` | string | Currency code (ISO 4217) |
| `paymentDate` | string | ISO 8601 payment date |
| `paymentMethod` | string | Payment method: `bank_transfer`, `cash`, `card`, `other` |
| `reference` | string \| null | Payment reference number |
| `notes` | string \| null | Additional notes |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/invoices/invoice-uuid-1/payments' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
[
  {
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
  {
    "uuid": "payment-uuid-2",
    "amount": 880.00,
    "currency": "RON",
    "paymentDate": "2026-02-10",
    "paymentMethod": "bank_transfer",
    "reference": "TRF-2026-02-10-045",
    "notes": "Plată parțială",
    "createdAt": "2026-02-10T10:15:00Z",
    "updatedAt": "2026-02-10T10:15:00Z"
  }
]
```

## Payment Methods

| Value | Description |
|-------|-------------|
| `bank_transfer` | Bank transfer / wire transfer |
| `cash` | Cash payment |
| `card` | Card payment (credit/debit) |
| `other` | Other payment method |

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Invoice not found or doesn't belong to company |

## Important Notes

- Payments are ordered by `paymentDate` in descending order (most recent first)
- The sum of all payment amounts should not exceed the invoice total
- Each payment updates the invoice's `amountPaid` field
- When `amountPaid` equals `totalAmount`, the invoice status becomes `paid`
- When `amountPaid` is greater than 0 but less than `totalAmount`, status becomes `partially_paid`

## Related Endpoints

- [Record payment](/api-reference/payments/create)
- [Delete payment](/api-reference/payments/delete)
- [Get invoice](/api-reference/invoices/get)
