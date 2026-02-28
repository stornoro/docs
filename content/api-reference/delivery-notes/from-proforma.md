---
title: Create Delivery Note from Proforma
description: Create a new delivery note from an existing proforma invoice
method: POST
endpoint: /api/v1/delivery-notes/from-proforma
---

# Create Delivery Note from Proforma

Creates a new delivery note by copying data from an existing proforma invoice. The client, line items, dates, currency, and notes are all copied from the proforma. The new delivery note is created in `draft` status. The company's default `delivery_note` series is automatically assigned to the new delivery note.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
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

Returns the newly created delivery note in `draft` status:

```json
{
  "uuid": "950e8400-e29b-41d4-a716-446655440000",
  "number": "DN-2026-013",
  "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "850e8400-e29b-41d4-a716-446655440000",
    "name": "DN",
    "nextNumber": 14
  },
  "clientId": "750e8400-e29b-41d4-a716-446655440000",
  "client": {
    "uuid": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "registrationNumber": "RO12345678",
    "email": "contact@client.ro"
  },
  "status": "draft",
  "issueDate": "2026-02-19",
  "dueDate": "2026-03-19",
  "currency": "RON",
  "exchangeRate": 1.0,
  "notes": "Based on proforma PRO-2026-008",
  "lines": [
    {
      "uuid": "A40e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 1,
      "description": "Laptop Dell Latitude 7420",
      "quantity": "10.00",
      "unitPrice": "450.00",
      "unitOfMeasure": "piece",
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "percentage": "19.00"
      },
      "subtotal": "4500.00",
      "vatAmount": "855.00",
      "total": "5355.00"
    }
  ],
  "subtotal": "4500.00",
  "vatAmount": "855.00",
  "total": "5355.00",
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z"
}
```

## Data Copied from Proforma

| Field | Copied |
|-------|--------|
| `clientId` | Yes |
| `currency` / `exchangeRate` | Yes |
| `issueDate` | Yes (set to today) |
| `dueDate` | Yes |
| `notes` | Yes |
| `lines` (all items) | Yes |
| `deliveryLocation` | Yes |
| `projectReference` | Yes |
| `documentSeriesId` | No — the company's default `delivery_note` series is auto-assigned |

## Validation Rules

- `proformaId` must be a valid UUID of a proforma belonging to the same company
- The proforma must have at least one line item
- The referenced client must still exist

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Proforma invoice not found or doesn't belong to the company |
| 422 | `validation_error` | Invalid `proformaId` or proforma has no lines |
| 500 | `internal_error` | Server error occurred |

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
