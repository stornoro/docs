---
title: List document series
description: Retrieve all document series for the authenticated company.
---

# List document series

Retrieves all document series configured for the authenticated company, ordered by prefix.

```http
GET /api/v1/document-series
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

Requires the `series.view` permission. The endpoint takes no query parameters.

## Response

Returns an object with a `data` array of document series objects.

### Document Series Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `prefix` | string | Series prefix (e.g., "FAC", "PRO") |
| `type` | string | Document type: `invoice`, `proforma`, `credit_note`, `delivery_note`, `receipt`, `voucher` |
| `currentNumber` | integer | Last used number in series |
| `nextNumber` | string | Formatted next document number: the prefix followed by `currentNumber + 1` padded to at least four digits (e.g., `"FAC0246"`) |
| `active` | boolean | Whether series is active |
| `isDefault` | boolean | Whether this is the default series for its type |
| `source` | string | How the series was created: `manual`, `default` or `efactura` |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/document-series' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": [
    {
      "id": "series-uuid-1",
      "prefix": "FAC",
      "type": "invoice",
      "currentNumber": 245,
      "nextNumber": "FAC0246",
      "active": true,
      "isDefault": true,
      "source": "manual"
    },
    {
      "id": "series-uuid-2",
      "prefix": "FRE",
      "type": "invoice",
      "currentNumber": 123,
      "nextNumber": "FRE0124",
      "active": true,
      "isDefault": false,
      "source": "manual"
    },
    {
      "id": "series-uuid-3",
      "prefix": "CH",
      "type": "receipt",
      "currentNumber": 0,
      "nextNumber": "CH0001",
      "active": false,
      "isDefault": false,
      "source": "default"
    }
  ]
}
```

## Document Types

- `invoice` - Standard invoices
- `proforma` - Proforma invoices
- `credit_note` - Credit notes
- `delivery_note` - Delivery notes
- `receipt` - Receipts
- `voucher` - Fiscal vouchers

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found |

Error bodies have the form `{"error": "message"}`.

## Important Notes

- Each prefix is unique per company, across all document types
- Only active series are picked automatically for new documents
- Inactive series are typically used for closed fiscal years or discontinued numbering schemes

## Related Endpoints

- [Create document series](/api-reference/document-series/create)
- [Update document series](/api-reference/document-series/update)
- [Delete document series](/api-reference/document-series/delete)
- [Numbering decision (decizia de numerotare)](/api-reference/document-series/numbering-decision)
