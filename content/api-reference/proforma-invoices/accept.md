---
title: Accept Proforma Invoice
description: Mark a proforma invoice as accepted by the client
method: POST
endpoint: /api/v1/proforma-invoices/{uuid}/accept
---

# Accept Proforma Invoice

Marks a proforma invoice as accepted by the client. The proforma moves from `sent` to `accepted` and can then be [converted](/api-reference/proforma-invoices/convert) to an invoice.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not read by this endpoint. The proforma is found by its id and must belong to your organization |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the proforma invoice |

This endpoint takes no request body.

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/accept \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/accept', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});
const data = await response.json();
```

## Response

Returns the updated proforma in the same shape as [Get proforma invoice](/api-reference/proforma-invoices/get), with `status` set to `accepted` and `acceptedAt` filled. Decimal amounts are strings and dates are ISO 8601 date-times. `documentSeries` is `null` when the proforma has no series.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "number": "PRO0001",
  "client": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "type": "company",
    "name": "Client SRL",
    "cui": "12345678",
    "cnp": null,
    "city": "București",
    "country": "RO",
    "email": "contact@client.ro"
  },
  "documentSeries": {
    "id": "650e8400-e29b-41d4-a716-446655440000",
    "prefix": "PRO",
    "nextNumber": "PRO0002"
  },
  "status": "accepted",
  "currency": "RON",
  "issueDate": "2026-02-16T00:00:00+00:00",
  "dueDate": "2026-03-16T00:00:00+00:00",
  "validUntil": "2026-03-16T00:00:00+00:00",
  "subtotal": "7000.00",
  "vatTotal": "1330.00",
  "total": "8330.00",
  "discount": "200.00",
  "notes": "Payment terms: 30 days from invoice date",
  "paymentTerms": "Net 30",
  "invoiceTypeCode": null,
  "deliveryLocation": "Client warehouse",
  "projectReference": "PROJECT-2026-001",
  "orderNumber": "PO-2026-123",
  "contractNumber": "CONTRACT-2026-456",
  "issuerName": "John Doe",
  "issuerId": null,
  "mentions": "Special delivery instructions",
  "internalNote": "VIP client - priority handling",
  "salesAgent": "Jane Smith",
  "language": "ro",
  "exchangeRate": null,
  "sentAt": "2026-02-16T10:30:00+00:00",
  "acceptedAt": "2026-02-17T09:15:00+00:00",
  "rejectedAt": null,
  "cancelledAt": null,
  "expiredAt": null,
  "lines": [
    {
      "id": "950e8400-e29b-41d4-a716-446655440000",
      "position": 1,
      "description": "Web Development Services - Phase 1",
      "quantity": "40.0000",
      "unitOfMeasure": "hour",
      "unitPrice": "150.00",
      "vatRate": "19.00",
      "vatCategoryCode": "S",
      "vatAmount": "1140.00",
      "lineTotal": "6000.00",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "productId": "450e8400-e29b-41d4-a716-446655440000",
      "productCode": null
    },
    {
      "id": "960e8400-e29b-41d4-a716-446655440000",
      "position": 2,
      "description": "Hosting Services - Annual",
      "quantity": "1.0000",
      "unitOfMeasure": "service",
      "unitPrice": "1200.00",
      "vatRate": "19.00",
      "vatCategoryCode": "S",
      "vatAmount": "190.00",
      "lineTotal": "1000.00",
      "discount": "200.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "productId": "460e8400-e29b-41d4-a716-446655440000",
      "productCode": null
    }
  ]
}
```

## State Changes

- Before: `sent`. A `draft` proforma must be sent first
- After: `accepted`
- Sets `acceptedAt` to the current time.

## Next Actions

An accepted proforma can be [converted to an invoice](/api-reference/proforma-invoices/convert) or [cancelled](/api-reference/proforma-invoices/cancel). It cannot be rejected, and it cannot be edited.


## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the invoice edit permission |
| 404 | Proforma not found, or it belongs to another organization |
| 422 | The proforma is not in `sent` status |

Errors return a JSON body with a single `error` message, for example `{"error": "Proforma not found."}`.

```json
{
  "error": "Doar proformele trimise pot fi acceptate."
}
```
