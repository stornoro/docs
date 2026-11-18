---
title: List VAT rates
description: Retrieve all VAT rates configured for the authenticated company.
---

# List VAT rates

Retrieves all VAT rates configured for the authenticated company, sorted by position and then by rate, highest first.

```http
GET /api/v1/vat-rates
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns an object with a `data` array of VAT rate objects.

### VAT Rate Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `rate` | string | VAT percentage as a decimal string (e.g., `"19.00"`) |
| `label` | string | Display label (e.g., "TVA 19%", "Scutit") |
| `categoryCode` | string | e-Factura category code (default: "S") |
| `isDefault` | boolean | Whether this is the default rate |
| `isActive` | boolean | Whether the rate is active |
| `position` | integer | Display order (lower numbers appear first) |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/vat-rates' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": [
    {
      "id": "vat-uuid-1",
      "rate": "19.00",
      "label": "TVA 19%",
      "categoryCode": "S",
      "isDefault": true,
      "isActive": true,
      "position": 1
    },
    {
      "id": "vat-uuid-2",
      "rate": "9.00",
      "label": "TVA 9%",
      "categoryCode": "S",
      "isDefault": false,
      "isActive": true,
      "position": 2
    },
    {
      "id": "vat-uuid-4",
      "rate": "0.00",
      "label": "Scutit",
      "categoryCode": "E",
      "isDefault": false,
      "isActive": true,
      "position": 4
    }
  ]
}
```

## e-Factura Category Codes

The supported category codes are:

- `S` - Standard rate
- `Z` - Zero rated
- `E` - Exempt
- `AE` - Reverse charge
- `K` - Exempt for export
- `L` - Intra-community supply
- `O` - Outside scope (not subject to VAT)
- `M` - Margin scheme

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 404 | Company not found |

Error bodies have the form `{"error": "message"}`.

## Important Notes

- Only one rate is kept as the default: setting a rate as default clears the flag on the others
- Position determines the order in dropdowns and forms
- Deleting a VAT rate is a soft delete

## Related Endpoints

- [Create VAT rate](/api-reference/vat-rates/create)
- [Update VAT rate](/api-reference/vat-rates/update)
- [Delete VAT rate](/api-reference/vat-rates/delete)
