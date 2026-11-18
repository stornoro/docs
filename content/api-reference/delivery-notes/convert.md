---
title: Convert Delivery Note to Invoice
description: Convert an issued delivery note into an invoice for payment
method: POST
endpoint: /api/v1/delivery-notes/{uuid}/convert
---

# Convert Delivery Note to Invoice

Converts an issued delivery note into a draft invoice. The action creates a new invoice from the delivery note's data, marks the delivery note as `converted` and links the two documents.

Once converted, the delivery note cannot be edited and serves as a reference to the original delivery.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Company UUID to scope the request. Can be omitted when the organization has exactly one company; the `company` query parameter is accepted too |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note to convert |

## Request Body

The endpoint takes no body. The invoice always gets today's date as issue date, the delivery note's due date and the company's default `invoice` series. To use other values, change the draft invoice afterwards with [Update invoice](/api-reference/invoices/update).

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const invoice = await response.json();
```

## Response

Returns `201 Created` with the new invoice object directly (no wrapper key). The fields are described in [Get invoice](/api-reference/invoices/get#response); the example is abridged:

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440222",
  "documentType": "invoice",
  "status": "draft",
  "direction": "outgoing",
  "currency": "RON",
  "issueDate": "2026-02-20T00:00:00+00:00",
  "dueDate": "2026-03-18T00:00:00+00:00",
  "subtotal": "5000.00",
  "vatTotal": "1050.00",
  "total": "6050.00",
  "deliveryLocation": "Client warehouse - Str. Depozit 5, București",
  "projectReference": "PROJECT-2026-002",
  "notes": "Handle with care - fragile items",
  "issuerName": "John Doe"
}
```

The delivery note itself is not returned. Fetch it with [Get delivery note](/api-reference/delivery-notes/get) to see `status = converted`.

## State Changes

### Delivery note changes
- **Status:** Changed from `issued` to `converted`
- **convertedInvoice:** Set to the created invoice

### Invoice creation
- A new invoice is created in `draft` status
- All lines are copied: description, quantity, unit of measure, unit price, VAT rate and category, discounts, `vatIncluded` and product code
- The client, currency, exchange rate, notes, mentions, internal note, delivery location, project reference, sales agent, issuer and deputy fields are copied
- The issue date is today and the due date is the delivery note's due date

## Validation Rules

### Delivery note status
Only delivery notes in `issued` status can be converted. A `draft`, `cancelled` or already `converted` delivery note is refused with 422.

### Series selection
The invoice gets the company's default `invoice` series. When the company has no `invoice` series, the invoice is created without one and issuing it fails until a series exists.

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Company not found, or delivery note not found in the company |
| 422 | The delivery note is not issued, or the invoice could not be created from it |

### Example error response

```json
{
  "error": "Only issued delivery notes can be converted."
}
```

## Workflow Integration

### Standard conversion flow
1. Create delivery note (`POST /api/v1/delivery-notes`)
2. Issue delivery note (`POST /api/v1/delivery-notes/{uuid}/issue`)
3. Deliver goods/services
4. **Convert to invoice** (`POST /api/v1/delivery-notes/{uuid}/convert`) ← You are here
5. Issue the invoice and submit it to ANAF (`POST /api/v1/invoices/{uuid}/submit`)
6. Send invoice to client

### Several delivery notes on one invoice
Use [Bulk convert](/api-reference/delivery-notes/bulk-convert) to put the lines of several issued delivery notes of the same client and currency on one invoice.

## Reversing a conversion

A conversion cannot be undone. A converted delivery note cannot be cancelled. If the invoice needs to be reversed, issue a credit note for the invoice.

## Best practices

1. **Convert promptly** - Don't delay invoicing after delivery
2. **Review before converting** - The invoice copies the delivery note data
3. **Check the series** - Make sure a default `invoice` series exists
4. **Submit quickly** - Submit the invoice to ANAF within the required timeframe
