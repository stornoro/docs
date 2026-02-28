---
title: VAT Rate
description: VAT rate configuration object
---

# VAT Rate

The VatRate object represents a configured VAT rate that can be applied to invoice line items. Romanian companies typically use rates of 19%, 9%, 5%, and 0%.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Unique identifier |
| rate | decimal | VAT percentage rate (e.g., 19.00, 9.00, 5.00, 0.00) |
| label | string | Display label (e.g., "Standard 19%", "Reduced 9%") |
| categoryCode | string | ANAF category code (S, Z, E, AE, etc.) |
| isDefault | boolean | Whether this is the default VAT rate |
| isActive | boolean | Whether this rate is active and available |
| position | integer | Sort order for display |
| createdAt | datetime | Timestamp when created |
| updatedAt | datetime | Timestamp of last update |

## Example

```json
{
  "id": "a3b4c5d6-e7f8-9012-7890-123456789012",
  "rate": 19.00,
  "label": "Standard 19%",
  "categoryCode": "S",
  "isDefault": true,
  "isActive": true,
  "position": 1,
  "createdAt": "2024-01-01T10:00:00+02:00",
  "updatedAt": "2024-01-01T10:00:00+02:00"
}
```

## Common Romanian VAT Rates

```json
[
  {
    "id": "a3b4c5d6-e7f8-9012-7890-123456789012",
    "rate": 19.00,
    "label": "Standard 19%",
    "categoryCode": "S",
    "isDefault": true,
    "isActive": true,
    "position": 1
  },
  {
    "id": "b4c5d6e7-f8a9-0123-8901-234567890123",
    "rate": 9.00,
    "label": "Reduced 9%",
    "categoryCode": "S",
    "isDefault": false,
    "isActive": true,
    "position": 2
  },
  {
    "id": "c5d6e7f8-a9b0-1234-9012-345678901234",
    "rate": 5.00,
    "label": "Super-reduced 5%",
    "categoryCode": "S",
    "isDefault": false,
    "isActive": true,
    "position": 3
  },
  {
    "id": "d6e7f8a9-b0c1-2345-0123-456789012345",
    "rate": 0.00,
    "label": "Zero rate 0%",
    "categoryCode": "Z",
    "isDefault": false,
    "isActive": true,
    "position": 4
  },
  {
    "id": "e7f8a9b0-c1d2-3456-1234-567890123456",
    "rate": 0.00,
    "label": "Exempt",
    "categoryCode": "E",
    "isDefault": false,
    "isActive": true,
    "position": 5
  }
]
```

## VAT Category Codes (ANAF)

| Code | Description |
|------|-------------|
| S | Standard rate (19%, 9%, 5%) |
| Z | Zero rate (0%) |
| E | Exempt from VAT |
| AE | Reverse charge (Taxare inversă) |
| K | Intra-community supply |
| G | Export outside EU |
| O | Outside scope of VAT |
| L | Canary Islands general indirect tax |
| M | Tax for production, services and importation in Ceuta and Melilla |

## Romanian VAT Rate History

- **19%** - Standard rate (most goods and services)
- **9%** - Reduced rate (food, water supply, restaurants, hotels, cultural services)
- **5%** - Super-reduced rate (social housing, certain books, newspapers)
- **0%** - Zero rate (intra-community deliveries, exports)

## Notes

- Only one VAT rate should be marked as `isDefault: true`
- The default rate is pre-selected when adding new products or invoice lines
- **rate**: Stored as decimal percentage (19.00, not 0.19)
- **categoryCode**: Must match ANAF e-Factura requirements
- **position**: Controls the display order in dropdowns (lower = first)
- Inactive rates (`isActive: false`) are hidden from selection but remain in system
- Historical invoices maintain their VAT rate even if the rate is later deactivated
