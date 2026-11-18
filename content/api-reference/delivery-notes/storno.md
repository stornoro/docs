---
title: Create Storno Delivery Note
description: Create a storno (return) delivery note with negated quantities
method: POST
endpoint: /api/v1/delivery-notes/{uuid}/storno
---

# Create Storno Delivery Note

Creates a storno (return) delivery note from an existing delivery note. All line item quantities are negated to represent the return of goods. The new delivery note is created in `draft` status with the client, dates, notes and other header fields of the original. The company's default `delivery_note` series is assigned to it.

The endpoint does not check the status of the source delivery note. Storno is meant for issued delivery notes.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Company UUID to scope the request. Can be omitted when the organization has exactly one company; the `company` query parameter is accepted too |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note to storno |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/storno \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/storno', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const stornoNote = await response.json();
```

## Response

Returns `201 Created` with the new storno delivery note in `draft` status. The object has the fields described in [Get delivery note](/api-reference/delivery-notes/get#response); the example is abridged:

```json
{
  "id": "a60e8400-e29b-41d4-a716-446655440001",
  "number": "AVIZ-0194f3b7",
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
  "dueDate": "2026-03-18",
  "currency": "RON",
  "notes": "Handle with care - fragile items",
  "lines": [
    {
      "id": "b10e8400-e29b-41d4-a716-446655440000",
      "position": 1,
      "description": "Laptop Dell Latitude 7420",
      "quantity": "-10.0000",
      "unitOfMeasure": "piece",
      "unitPrice": "450.00",
      "vatRate": "21.00",
      "vatCategoryCode": "S",
      "vatAmount": "-945.00",
      "lineTotal": "-4500.00"
    }
  ],
  "subtotal": "-4500.00",
  "vatTotal": "-945.00",
  "total": "-5445.00"
}
```

## State Changes

### New storno delivery note
- Created in `draft` status with a new id and a temporary `AVIZ-` number
- All line item quantities are negated (positive to negative)
- All totals are negative
- The header fields, including `notes`, are copied from the original. The original number is not added to `notes`
- Issue date is set to today; due date is copied from the original
- The company's default `delivery_note` series is assigned

### Original delivery note
- Remains unchanged
- No fields are modified on the original

## Validation Rules

None on the source delivery note: its status is not checked, and storno of a draft or cancelled delivery note creates the document too.

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Company not found, or delivery note not found in the organization |

## Workflow Integration

### Storno Flow
1. Issue a delivery note (`POST /api/v1/delivery-notes/{uuid}/issue`)
2. Goods are returned by the client
3. **Create storno** (`POST /api/v1/delivery-notes/{uuid}/storno`) ← You are here
4. Review and edit the storno delivery note if needed
5. Issue the storno delivery note (`POST /api/v1/delivery-notes/{uuid}/issue`)

## Related Endpoints

- [Issue delivery note](/api-reference/delivery-notes/issue) - Issue the new storno draft
- [Update delivery note](/api-reference/delivery-notes/update) - Edit before issuing
- [Get delivery note](/api-reference/delivery-notes/get) - View the original delivery note
