---
title: List product categories
description: List all product categories for the active company, ordered by sortOrder then name.
---

# List product categories

Returns all product categories defined for the company. Categories appear as a horizontal chip strip above the POS product grid; tapping one filters the grid to that category.

```http
GET /api/v1/product-categories
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `X-Company` | string | Yes | Company UUID |

## Response

```json
{
  "data": [
    { "id": "0a..f", "name": "Cafele", "color": "#7c3aed", "sortOrder": 0 },
    { "id": "1b..e", "name": "Sandwich-uri", "color": "#16a34a", "sortOrder": 1 }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Category UUID |
| `name` | string | Display name (1–100 chars) |
| `color` | string \| null | Optional hex swatch (`#RRGGBB`) used for the chip and as Product card fallback |
| `sortOrder` | integer | Sort key (smaller = earlier) |

## Permissions

Requires `product.view`.
