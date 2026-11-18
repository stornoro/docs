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

## Request Body

The endpoint takes no body. The invoice is created with today's date as issue date, in the receipt's currency, using the company's default `invoice` series.

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const invoice = await response.json();
```

## Response

`201 Created`. The body is the new invoice in draft status, in the shape described in [Get invoice](/api-reference/invoices/get). It is not wrapped, and it does not include the receipt. Fetch the receipt with [Get receipt](/api-reference/receipts/get) to see its new `invoiced` status.

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440222",
  "status": "draft",
  "currency": "RON",
  "subtotal": "107.58",
  "vatTotal": "17.92",
  "total": "125.50",
  "lines": [
    {
      "id": "h8i9j0k1-l2m3-4567-nopq-789012345678",
      "position": 1,
      "description": "Coffee - Espresso",
      "quantity": "2.0000",
      "unitPrice": "12.61",
      "vatRate": "9.00",
      "vatAmount": "2.27",
      "lineTotal": "25.22"
    }
  ]
}
```

## State Changes

### Receipt Changes
- **Status:** Changed from `issued` → `invoiced`
- **convertedInvoice:** Set to the created invoice

### Invoice Creation
- New invoice created with status `draft`
- All line items, the notes, mentions, project reference, issuer fields and the exchange rate are copied from the receipt
- The client is the receipt's linked client
- Ready to be issued and uploaded to ANAF

## Validation Rules

### Receipt Status
Only receipts in `issued` status can be converted. Receipts in `draft`, `cancelled` or `invoiced` status are refused with 422.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Company or receipt not found |
| 422 | Receipt is not in `issued` status, or the invoice could not be created |

Error responses have the form `{"error": "message"}`.

## Example Error Response

```json
{
  "error": "Doar bonurile emise pot fi convertite in factura."
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
4. **Convert to invoice**. The invoice takes the date of the conversion

## Post-Conversion Actions

After conversion:
1. **Upload to ANAF** — Submit the invoice to ANAF e-Factura if required
2. **Generate PDF** — Create PDF version for the customer
3. **Send to customer** — Email invoice to the customer
4. **Archive receipt** — Keep receipt as reference document

## Best Practices

1. **Convert on the same day** — The invoice takes the date of the conversion, so convert in the same tax period as the receipt
2. **Link client before converting** — Update the receipt with a `clientId` first so the invoice has the buyer data
3. **Upload to ANAF promptly** — Submit the resulting invoice within the required ANAF timeframe
