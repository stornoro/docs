---
title: Convert Receipt to Invoice
description: Convert a fiscal receipt into a formal invoice
method: POST
endpoint: /api/v1/receipts/{uuid}/convert
---

# Convert Receipt to Invoice

Converts a fiscal receipt into a formal, legally-binding invoice. This action creates a new invoice with all the receipt's data, marks the receipt as `invoiced`, and establishes a link between the two documents.

This is used when a business customer (B2B) requests a formal tax invoice for a purchase they made at the point of sale.

Once converted, the receipt cannot be modified and serves as a historical reference to the original transaction.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the receipt to convert |

## Request Body (Optional)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `invoiceSeriesId` | string | No | UUID of invoice series to use |
| `issueDate` | string | No | Override invoice issue date (default: today) |
| `dueDate` | string | No | Override invoice due date (default: today) |
| `clientId` | string | No | Override the client UUID for the invoice |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceSeriesId": "660e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-18",
    "dueDate": "2026-03-18"
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    invoiceSeriesId: '660e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-18',
    dueDate: '2026-03-18'
  })
});

const data = await response.json();
```

## Response

Returns the newly created invoice along with the updated receipt status:

```json
{
  "invoice": {
    "uuid": "650e8400-e29b-41d4-a716-446655440222",
    "number": "FAC-2026-050",
    "direction": "outgoing",
    "isCreditNote": false,
    "seriesId": "660e8400-e29b-41d4-a716-446655440000",
    "series": {
      "uuid": "660e8400-e29b-41d4-a716-446655440000",
      "name": "FAC",
      "nextNumber": 51,
      "prefix": "FAC-",
      "year": 2026
    },
    "clientId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "client": {
      "uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "Acme SRL",
      "registrationNumber": "RO12345678",
      "address": "Strada Principala, nr. 10",
      "email": "office@acme.ro"
    },
    "status": "draft",
    "issueDate": "2026-02-18",
    "dueDate": "2026-03-18",
    "currency": "RON",
    "exchangeRate": 1.0,
    "invoiceTypeCode": "380",
    "receiptReference": "BON-2026-042",
    "receiptId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "lines": [
      {
        "uuid": "h8i9j0k1-l2m3-4567-nopq-789012345678",
        "lineNumber": 1,
        "description": "Coffee - Espresso",
        "quantity": "2.00",
        "unitPrice": "12.61",
        "unitOfMeasure": "pcs",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "vatRate": {
          "percentage": "9.00"
        },
        "subtotal": "25.22",
        "vatAmount": "2.27",
        "total": "27.49"
      },
      {
        "uuid": "i9j0k1l2-m3n4-5678-opqr-890123456789",
        "lineNumber": 2,
        "description": "Notebook A5",
        "quantity": "2.00",
        "unitPrice": "41.18",
        "unitOfMeasure": "pcs",
        "vatRateId": "360e8400-e29b-41d4-a716-446655440000",
        "vatRate": {
          "percentage": "19.00"
        },
        "subtotal": "82.36",
        "vatAmount": "15.65",
        "total": "98.01"
      }
    ],
    "subtotal": "107.58",
    "vatAmount": "17.92",
    "total": "125.50",
    "anafStatus": null,
    "createdAt": "2026-02-18T10:20:00Z",
    "updatedAt": "2026-02-18T10:20:00Z"
  },
  "receipt": {
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "number": "BON-2026-042",
    "status": "invoiced",
    "convertedInvoiceId": "650e8400-e29b-41d4-a716-446655440222",
    "convertedInvoiceNumber": "FAC-2026-050",
    "updatedAt": "2026-02-18T10:20:00Z"
  }
}
```

## State Changes

### Receipt Changes
- **Status:** Changed from `issued` → `invoiced`
- **convertedInvoiceId:** Set to the UUID of the created invoice
- **convertedInvoiceNumber:** Set to the invoice number for easy reference

### Invoice Creation
- New invoice created with status `draft`
- All line items copied from the receipt
- Client information copied from the receipt's `clientId` or matched via `customerCif`
- `receiptId` and `receiptReference` fields set to link back to the receipt
- Ready to be issued and uploaded to ANAF

## Validation Rules

### Receipt Status
Can convert receipts in these statuses:
- `issued` — Standard status for conversion

Cannot convert receipts in these statuses:
- `draft` — Receipt has not yet been printed and issued
- `cancelled` — Transaction was voided
- `invoiced` — Already converted to an invoice

### Client Requirement
- To convert a receipt to an invoice, a client must be identifiable:
  - The receipt must have a linked `clientId`, OR
  - A `clientId` must be provided in the request body
  - If neither is present, the conversion will fail with a validation error

### Series Selection
- If `invoiceSeriesId` is not provided, the default invoice series for the company is used
- Series must be configured for outgoing invoices
- Series must belong to the same company

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Receipt not found or doesn't belong to the company |
| 409 | `conflict` | Receipt status prevents conversion or already invoiced |
| 422 | `validation_error` | No client linked to the receipt; provide clientId in the request |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Already Invoiced

```json
{
  "error": {
    "code": "conflict",
    "message": "Receipt cannot be converted",
    "details": {
      "status": "invoiced",
      "reason": "Receipt has already been converted to an invoice",
      "convertedInvoiceId": "650e8400-e29b-41d4-a716-446655440222",
      "convertedInvoiceNumber": "FAC-2026-050"
    }
  }
}
```

### No Client

```json
{
  "error": {
    "code": "validation_error",
    "message": "Cannot convert receipt to invoice",
    "details": {
      "clientId": ["A client is required to generate an invoice. Provide a clientId in the request body or link a client to the receipt first."]
    }
  }
}
```

## Workflow Integration

### Customer Requests Invoice at POS
1. Issue receipt (`POST /api/v1/receipts/{uuid}/issue`)
2. Customer requests a formal invoice
3. **Convert to invoice** (`POST /api/v1/receipts/{uuid}/convert`) ← You are here
4. Upload invoice to ANAF (`POST /api/v1/invoices/{uuid}/submit`)
5. Email invoice to customer

### Post-Purchase Invoice Request
1. Receipt was issued earlier in the day
2. Customer contacts you later requesting an invoice
3. Link client to receipt if not already done
4. **Convert to invoice** with desired invoice date

## Post-Conversion Actions

After conversion:
1. **Upload to ANAF** — Submit the invoice to ANAF e-Factura if required
2. **Generate PDF** — Create PDF version for the customer
3. **Send to customer** — Email invoice to the customer
4. **Archive receipt** — Keep receipt as reference document

## Best Practices

1. **Convert on the same day** — Issue the invoice on the same date as the receipt to avoid tax period discrepancies
2. **Link client before converting** — Ensure the receipt has a `clientId` or provide one at conversion time for clean data
3. **Use correct invoice series** — Select the appropriate series for B2B invoices
4. **Upload to ANAF promptly** — Submit the resulting invoice within the required ANAF timeframe
