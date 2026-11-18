---
title: Create Delivery Note from Proforma
description: Create a new delivery note from an existing proforma invoice
method: POST
endpoint: /api/v1/delivery-notes/from-proforma
---

# Create Delivery Note from Proforma

Creates a new delivery note by copying data from an existing proforma invoice. The client, line items, due date, currency, and notes are copied from the proforma; the issue date is today. The new delivery note is created in `draft` status. The company's default `delivery_note` series is automatically assigned to the new delivery note.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Company UUID to scope the request. Can be omitted when the organization has exactly one company; the `company` query parameter is accepted too |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `proformaId` | string | Yes | UUID of the proforma invoice to copy from |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/delivery-notes/from-proforma \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "proformaId": "720e8400-e29b-41d4-a716-446655440000"
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/from-proforma', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    proformaId: '720e8400-e29b-41d4-a716-446655440000'
  })
});

const deliveryNote = await response.json();
```

## Response

Returns `201 Created` with the new delivery note in `draft` status. The object has the fields described in [Get delivery note](/api-reference/delivery-notes/get#response); the example is abridged:

```json
{
  "id": "950e8400-e29b-41d4-a716-446655440000",
  "number": "AVIZ-0194f3c1",
  "documentSeries": {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "prefix": "DN",
    "nextNumber": "DN0014"
  },
  "client": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "cui": "12345678"
  },
  "status": "draft",
  "issueDate": "2026-02-19",
  "dueDate": "2026-03-19",
  "currency": "RON",
  "notes": "Based on the proforma",
  "lines": [
    {
      "id": "a40e8400-e29b-41d4-a716-446655440000",
      "position": 1,
      "description": "Laptop Dell Latitude 7420",
      "quantity": "10.0000",
      "unitOfMeasure": "piece",
      "unitPrice": "450.00",
      "vatRate": "21.00",
      "vatCategoryCode": "S",
      "vatAmount": "945.00",
      "lineTotal": "4500.00"
    }
  ],
  "subtotal": "4500.00",
  "vatTotal": "945.00",
  "total": "5445.00"
}
```

## Data Copied from Proforma

| Field | Copied |
|-------|--------|
| `client` | Yes |
| `currency` / `exchangeRate` | Yes |
| `issueDate` | No, set to today |
| `dueDate` | Yes |
| `notes`, `mentions`, `internalNote` | Yes |
| `deliveryLocation`, `projectReference` | Yes |
| `issuerName`, `issuerId`, `salesAgent` | Yes |
| `lines` (all items) | Yes |
| `documentSeries` | No, the company's default `delivery_note` series is assigned |

## Validation Rules

- `proformaId` is required
- The proforma must belong to the company

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 400 | `proformaId` is missing |
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Company not found, or proforma invoice not found in the company |

## Workflow Integration

### Proforma to Delivery Note Flow
1. Create proforma invoice (`POST /api/v1/proforma-invoices`)
2. Send proforma to client for approval
3. **Create delivery note from proforma** (`POST /api/v1/delivery-notes/from-proforma`) ← You are here
4. Adjust the delivery note if quantities changed
5. Issue the delivery note (`POST /api/v1/delivery-notes/{uuid}/issue`)
6. Convert to invoice after delivery (`POST /api/v1/delivery-notes/{uuid}/convert`)

## Related Endpoints

- [Create delivery note](/api-reference/delivery-notes/create) - Create a delivery note manually
- [Issue delivery note](/api-reference/delivery-notes/issue) - Issue the new draft
- [Update delivery note](/api-reference/delivery-notes/update) - Adjust before issuing
