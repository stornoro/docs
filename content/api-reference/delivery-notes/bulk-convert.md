---
title: Bulk Convert Delivery Notes
description: Convert multiple issued delivery notes into a single invoice
method: POST
endpoint: /api/v1/delivery-notes/bulk-convert
---

# Bulk Convert Delivery Notes

Converts multiple issued delivery notes into a single consolidated invoice. All line items from every delivery note are combined into one invoice. Each delivery note is then marked as `converted`.

This is useful for end-of-period billing where multiple deliveries to the same client should appear on one invoice.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ids` | string[] | Yes | Array of delivery note UUIDs to convert (minimum 2) |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/delivery-notes/bulk-convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [
      "950e8400-e29b-41d4-a716-446655440000",
      "951e8400-e29b-41d4-a716-446655440001",
      "952e8400-e29b-41d4-a716-446655440002"
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/bulk-convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ids: [
      '950e8400-e29b-41d4-a716-446655440000',
      '951e8400-e29b-41d4-a716-446655440001',
      '952e8400-e29b-41d4-a716-446655440002'
    ]
  })
});

const invoice = await response.json();
```

## Response

Returns the newly created invoice object in `draft` status:

```json
{
  "uuid": "650e8400-e29b-41d4-a716-446655440222",
  "number": "FAC-2026-051",
  "status": "draft",
  "direction": "outgoing",
  "isCreditNote": false,
  "clientId": "750e8400-e29b-41d4-a716-446655440000",
  "client": {
    "uuid": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "registrationNumber": "RO12345678",
    "email": "contact@client.ro"
  },
  "currency": "RON",
  "exchangeRate": 1.0,
  "issueDate": "2026-02-28",
  "dueDate": "2026-03-28",
  "lines": [
    {
      "uuid": "C10e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 1,
      "description": "Laptop Dell Latitude 7420",
      "quantity": "10.00",
      "unitPrice": "450.00",
      "unitOfMeasure": "piece",
      "subtotal": "4500.00",
      "vatAmount": "855.00",
      "total": "5355.00"
    },
    {
      "uuid": "C20e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 2,
      "description": "Wireless Mouse Logitech MX Master 3",
      "quantity": "5.00",
      "unitPrice": "50.00",
      "unitOfMeasure": "piece",
      "subtotal": "250.00",
      "vatAmount": "47.50",
      "total": "297.50"
    }
  ],
  "subtotal": "4750.00",
  "vatAmount": "902.50",
  "total": "5652.50",
  "deliveryNoteIds": [
    "950e8400-e29b-41d4-a716-446655440000",
    "951e8400-e29b-41d4-a716-446655440001",
    "952e8400-e29b-41d4-a716-446655440002"
  ],
  "createdAt": "2026-02-28T16:00:00Z",
  "updatedAt": "2026-02-28T16:00:00Z"
}
```

## State Changes

### Created Invoice
- New invoice created in `draft` status
- Lines from all delivery notes are merged in order
- `deliveryNoteIds` lists all source delivery note UUIDs
- Issue date defaults to today
- The company's default `invoice` series is automatically assigned to the created invoice

### Source Delivery Notes
- Each delivery note status is changed from `issued` → `converted`
- `convertedAt` is set on each delivery note
- `convertedInvoiceId` is set to the new invoice UUID

## Validation Rules

All delivery notes in the `ids` array must:
- Exist and belong to the same company
- Be in `issued` status
- Share the same client
- Share the same currency

| Validation Failure | Error Code | Description |
|--------------------|------------|-------------|
| Different clients | `validation_error` | All delivery notes must have the same client |
| Different currencies | `validation_error` | All delivery notes must use the same currency |
| Non-issued status | `validation_error` | All delivery notes must be in issued status |
| Not found | `not_found` | One or more delivery note UUIDs not found |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | One or more delivery notes not found or not in this company |
| 422 | `validation_error` | Validation failed (different clients, currencies, or non-issued status) |
| 500 | `internal_error` | Server error occurred |

## Example Error Response

### Mixed Clients

```json
{
  "error": {
    "code": "validation_error",
    "message": "Cannot bulk convert delivery notes",
    "details": {
      "reason": "All delivery notes must belong to the same client",
      "conflictingIds": [
        "952e8400-e29b-41d4-a716-446655440002"
      ]
    }
  }
}
```

## Workflow Integration

### End-of-Period Billing Flow
1. Issue delivery notes throughout the month
2. At period end, collect all issued delivery note UUIDs for a client
3. **Bulk convert** (`POST /api/v1/delivery-notes/bulk-convert`) ← You are here
4. Review the consolidated invoice
5. Upload to ANAF (`POST /api/v1/invoices/{uuid}/upload`)
6. Send invoice to client

## Related Endpoints

- [Convert single delivery note](/api-reference/delivery-notes/convert) - Convert one delivery note to invoice
- [List delivery notes](/api-reference/delivery-notes/list) - Find issued delivery notes to bulk convert
- [Get invoice](/api-reference/invoices/get) - View the created invoice
