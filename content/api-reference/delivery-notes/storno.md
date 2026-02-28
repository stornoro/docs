---
title: Create Storno Delivery Note
description: Create a storno (return) delivery note with negated quantities
method: POST
endpoint: /api/v1/delivery-notes/{uuid}/storno
---

# Create Storno Delivery Note

Creates a storno (return) delivery note from an existing issued delivery note. All line item quantities are negated to represent the return of goods. The new delivery note is created in `draft` status and references the original in its `notes` field. The company's default `delivery_note` series is automatically assigned to the new storno delivery note.

Only delivery notes in `issued` status can be stornoed.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the issued delivery note to storno |

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

Returns the newly created storno delivery note in `draft` status:

```json
{
  "uuid": "A60e8400-e29b-41d4-a716-446655440001",
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
  "notes": "Storno aviz DN-2026-012",
  "lines": [
    {
      "uuid": "B10e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 1,
      "description": "Laptop Dell Latitude 7420",
      "quantity": "-10.00",
      "unitPrice": "450.00",
      "unitOfMeasure": "piece",
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "percentage": "19.00"
      },
      "subtotal": "-4500.00",
      "vatAmount": "-855.00",
      "total": "-5355.00"
    }
  ],
  "subtotal": "-4500.00",
  "vatAmount": "-855.00",
  "total": "-5355.00",
  "createdAt": "2026-02-19T10:00:00Z",
  "updatedAt": "2026-02-19T10:00:00Z"
}
```

## State Changes

### New Storno Delivery Note
- Created in `draft` status with a new UUID and number
- All line item quantities are negated (positive → negative)
- All totals are negative
- `notes` field references the original delivery note number
- Issue date is set to today; due date copied from original
- The company's default `delivery_note` series is automatically assigned as `documentSeriesId`

### Original Delivery Note
- Remains unchanged in `issued` status
- No fields are modified on the original

## Validation Rules

- The source delivery note must be in `issued` status
- Cannot storno a `draft`, `cancelled`, or `converted` delivery note

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Delivery note not found or doesn't belong to the company |
| 422 | `validation_error` | Delivery note is not in issued status |
| 500 | `internal_error` | Server error occurred |

## Example Error Response

### Not Issued

```json
{
  "error": {
    "code": "validation_error",
    "message": "Delivery note cannot be stornoed",
    "details": {
      "status": "draft",
      "reason": "Only issued delivery notes can be stornoed"
    }
  }
}
```

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
