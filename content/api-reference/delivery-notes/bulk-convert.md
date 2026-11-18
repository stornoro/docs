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
| `X-Company` | string | No | Company UUID to scope the request. Can be omitted when the organization has exactly one company; the `company` query parameter is accepted too |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ids` | string[] | Yes | Array of delivery note UUIDs to convert (at least 1) |

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

Returns `201 Created` with the new invoice object directly (no wrapper key), in `draft` status. The fields are described in [Get invoice](/api-reference/invoices/get#response); the example is abridged:

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440222",
  "documentType": "invoice",
  "status": "draft",
  "direction": "outgoing",
  "currency": "RON",
  "issueDate": "2026-02-28T00:00:00+00:00",
  "subtotal": "4750.00",
  "vatTotal": "997.50",
  "total": "5747.50"
}
```

## State Changes

### Created invoice
- A new invoice is created in `draft` status
- Lines from all delivery notes are merged in order
- The issue date is today
- The client and currency are those of the first delivery note. Notes, mentions and other header fields of the delivery notes are not copied
- The company's default `invoice` series is assigned to the invoice

### Source delivery notes
- Each delivery note status is changed from `issued` to `converted`
- `convertedInvoice` is set on each delivery note

## Validation Rules

All delivery notes in the `ids` array must:
- Exist and belong to the company
- Be in `issued` status
- Share the same client
- Share the same currency

| Validation failure | Status | Error message |
|--------------------|--------|---------------|
| Different clients | 422 | `All selected delivery notes must have the same client.` |
| Different currencies | 422 | `All selected delivery notes must have the same currency.` |
| Non-issued status | 422 | `Delivery note <number> is not issued. Only issued delivery notes can be converted.` |
| Not found | 404 | `Delivery note <id> not found.` |
| Missing or empty `ids` | 400 | `ids array is required.` |

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 400 | `ids` is missing or empty |
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Company not found, or a delivery note is not found in the company |
| 422 | Different clients, different currencies, or a delivery note that is not issued |

## Example error response

```json
{
  "error": "All selected delivery notes must have the same client."
}
```

## Workflow Integration

### End-of-Period Billing Flow
1. Issue delivery notes throughout the month
2. At period end, collect all issued delivery note UUIDs for a client
3. **Bulk convert** (`POST /api/v1/delivery-notes/bulk-convert`) ← You are here
4. Review the consolidated invoice
5. Issue the invoice and submit it to ANAF (`POST /api/v1/invoices/{uuid}/submit`)
6. Send invoice to client

## Related Endpoints

- [Convert single delivery note](/api-reference/delivery-notes/convert) - Convert one delivery note to invoice
- [List delivery notes](/api-reference/delivery-notes/list) - Find issued delivery notes to bulk convert
- [Get invoice](/api-reference/invoices/get) - View the created invoice
