---
title: Convert Proforma to Invoice
description: Convert a proforma invoice into a draft invoice
method: POST
endpoint: /api/v1/proforma-invoices/{uuid}/convert
---

# Convert Proforma to Invoice

Creates a draft invoice from a proforma invoice and marks the proforma as `converted`. Only a `sent` or `accepted` proforma can be converted.

The new invoice is a draft with a temporary `DRAFT-xxxxxxxx` number. It is not issued and not submitted to ANAF; use [Issue invoice](/api-reference/invoices/issue) for that.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID. The proforma must belong to this company. Optional only when the organization has a single company |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the proforma invoice to convert |

This endpoint takes no request body. The issue date is today, the due date is the proforma's due date, and the invoice uses the company's default invoice series.

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});
const data = await response.json();
```

## Response

Returns `201 Created` with the new invoice, in the shape described in [Get invoice](/api-reference/invoices/get). The proforma is not part of the response; read it again with [Get proforma invoice](/api-reference/proforma-invoices/get) to see its `converted` status. Decimal amounts are strings and dates are ISO 8601 date-times. The example is shortened.

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440111",
  "documentType": "invoice",
  "status": "draft",
  "direction": "outgoing",
  "number": "DRAFT-1a2b3c4d",
  "senderName": "Your Company SRL",
  "senderCif": "12345678",
  "receiverName": "Client SRL",
  "receiverCif": "87654321",
  "client": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "type": "company",
    "name": "Client SRL",
    "cui": "87654321"
  },
  "documentSeries": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "prefix": "FAC",
    "nextNumber": "FAC0046"
  },
  "currency": "RON",
  "issueDate": "2026-02-18T00:00:00+00:00",
  "dueDate": "2026-03-16T00:00:00+00:00",
  "subtotal": "7000.00",
  "vatTotal": "1330.00",
  "total": "8330.00",
  "discount": "200.00",
  "amountPaid": "0.00",
  "balance": "8330.00",
  "notes": "Payment terms: 30 days from invoice date",
  "paymentTerms": "Net 30",
  "orderNumber": "PO-2026-123",
  "contractNumber": "CONTRACT-2026-456",
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
      "productCode": null
    }
  ]
}
```

## State Changes

### Proforma

- `status` becomes `converted`.
- The proforma can no longer be edited, sent, accepted, rejected or cancelled.

### Invoice

- Created with status `draft`, direction `outgoing` and document type `invoice`.
- `issueDate` is today. `dueDate` is copied from the proforma.
- The series is the company's default invoice series, or none if the company has no default. The final number is assigned when the invoice is issued.
- The invoice counts against the plan's monthly invoice limit.

## Data mapping

These fields are copied from the proforma to the invoice:

- Client and currency
- `exchangeRate`, `language` and `invoiceTypeCode`
- `notes`, `paymentTerms`, `deliveryLocation`, `projectReference`, `orderNumber`, `contractNumber`
- `issuerName`, `issuerId`, `mentions`, `salesAgent`
- Every line: description, quantity, unit of measure, unit price, `vatRate`, `vatCategoryCode`, `discount`, `discountPercent`, `vatIncluded` and `productCode`

`internalNote` is not copied.

## Validation Rules

- The proforma must be in `sent` or `accepted` status. A `draft`, `rejected`, `cancelled`, `converted` or `expired` proforma is refused.
- The company's monthly invoice limit must not be reached.
- The client must still exist.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the invoice create permission |
| 404 | Company not found, or the proforma is not found in this company |
| 422 | The proforma status does not allow conversion, or the invoice could not be created (for example the monthly invoice limit is reached) |

Errors return a JSON body with a single `error` message, for example `{"error": "Proforma not found."}`.

```json
{
  "error": "Doar proformele trimise sau acceptate pot fi convertite."
}
```

## Workflow

1. Create the proforma (`POST /api/v1/proforma-invoices`).
2. Send it (`POST /api/v1/proforma-invoices/{uuid}/send`).
3. Optionally mark it accepted (`POST /api/v1/proforma-invoices/{uuid}/accept`).
4. Convert it (`POST /api/v1/proforma-invoices/{uuid}/convert`).
5. Issue the invoice (`POST /api/v1/invoices/{uuid}/issue`).
6. Submit it to ANAF if the company does not submit automatically (`POST /api/v1/invoices/{uuid}/submit`).

## Reversing a conversion

A conversion cannot be undone. To cancel the resulting invoice, use the invoice endpoints. The proforma stays `converted`.
