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
| `X-Company` | string | No | UUID of the company context. The invoice is found by its UUID, so the header is not used |

## Response

Returns a JSON array of payment objects. The list is not paginated.

### Payment Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `amount` | string | Payment amount, for example `"1500.00"` |
| `currency` | string | Currency code (ISO 4217) |
| `paymentDate` | string | ISO 8601 date and time |
| `paymentMethod` | string | Payment method, stored as it was sent (for example `bank_transfer`, `cash`, `card`) |
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
curl -X GET 'https://api.storno.ro/api/v1/invoices/invoice-uuid-1/payments' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
[
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
  },
  {
    "id": "payment-uuid-2",
    "amount": "880.00",
    "currency": "RON",
    "paymentDate": "2026-02-10T00:00:00+00:00",
    "paymentMethod": "bank_transfer",
    "reference": "TRF-2026-02-10-045",
    "notes": "Plată parțială",
    "isReconciled": false,
    "receiptNumber": null,
    "receiptDate": null,
    "receiptIssuedAt": null,
    "receiptSeriesId": null,
    "createdAt": "2026-02-10T10:15:00+00:00"
  }
]
```

## Errors

Error responses have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | The invoice is not accessible to the caller |
| 404 | Invoice not found |

## Important Notes

- Payments are ordered by `paymentDate`, most recent first.
- Payments update the invoice `amountPaid`, `balance` and `paidAt`. They do not change the invoice `status`.

## Related Endpoints

- [Record payment](/api-reference/payments/create)
- [Delete payment](/api-reference/payments/delete)
- [Get invoice](/api-reference/invoices/get)
