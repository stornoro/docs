---
title: List VAT rates
description: Retrieve all VAT rates configured for the authenticated company.
---

# List VAT rates

Retrieves all VAT rates configured for the authenticated company, sorted by position.

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

Returns an array of VAT rate objects sorted by position.

### VAT Rate Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `rate` | number | VAT percentage (e.g., 19 for 19%) |
| `label` | string | Display label (e.g., "TVA 19%", "Scutit") |
| `categoryCode` | string | e-Factura category code (default: "S") |
| `isDefault` | boolean | Whether this is the default rate |
| `position` | integer | Display order (lower numbers appear first) |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/vat-rates' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
[
  {
    "uuid": "vat-uuid-1",
    "rate": 19,
    "label": "TVA 19%",
    "categoryCode": "S",
    "isDefault": true,
    "position": 1,
    "createdAt": "2025-06-01T10:00:00Z",
    "updatedAt": "2025-06-01T10:00:00Z"
  },
  {
    "uuid": "vat-uuid-2",
    "rate": 9,
    "label": "TVA 9%",
    "categoryCode": "AA",
    "isDefault": false,
    "position": 2,
    "createdAt": "2025-06-01T10:05:00Z",
    "updatedAt": "2025-06-01T10:05:00Z"
  },
  {
    "uuid": "vat-uuid-3",
    "rate": 5,
    "label": "TVA 5%",
    "categoryCode": "AA",
    "isDefault": false,
    "position": 3,
    "createdAt": "2025-06-01T10:10:00Z",
    "updatedAt": "2025-06-01T10:10:00Z"
  },
  {
    "uuid": "vat-uuid-4",
    "rate": 0,
    "label": "Scutit",
    "categoryCode": "E",
    "isDefault": false,
    "position": 4,
    "createdAt": "2025-06-01T10:15:00Z",
    "updatedAt": "2025-06-01T10:15:00Z"
  }
]
```

## Common VAT Rates in Romania

| Rate | Label | Category Code | Use Case |
|------|-------|---------------|----------|
| 19% | TVA 19% | S | Standard rate (most goods and services) |
| 9% | TVA 9% | AA | Reduced rate (food, medicines, hotels, restaurants) |
| 5% | TVA 5% | AA | Super-reduced rate (books, newspapers) |
| 0% | Scutit | E | Exempt (education, healthcare, financial services) |
| 0% | Neimpozabil | O | Outside scope (intra-community, exports) |

## e-Factura Category Codes

- `S` - Standard rate
- `AA` - Reduced rate
- `E` - Exempt
- `O` - Outside scope (not subject to VAT)
- `Z` - Zero rated
- `AE` - Reverse charge

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |

## Important Notes

- Each company should configure the VAT rates they use
- Only one rate can be marked as default
- The default rate is automatically selected when creating new invoice lines
- Position determines the order in dropdowns and forms
- Deleting a VAT rate is a soft delete - rates used in invoices are preserved

## Related Endpoints

- [Create VAT rate](/api-reference/vat-rates/create)
- [Update VAT rate](/api-reference/vat-rates/update)
- [Delete VAT rate](/api-reference/vat-rates/delete)
