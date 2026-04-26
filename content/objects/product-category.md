---
title: Product Category
description: Product category for grouping and filtering on the POS product grid
---

# Product Category

The ProductCategory object groups [Products](/objects/product) into a small, ordered set of buckets used by the mobile POS. Categories drive the chip strip above the product grid (tap to filter) and supply a fallback colour swatch for product tiles when `Product.color` is null.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Unique identifier |
| name | string | Display name (1–100 chars) |
| color | string \| null | Optional hex swatch (`#RRGGBB`) used for the chip background and as a fallback Product tile colour |
| sortOrder | integer | Sort key (smaller = earlier). Defaults to 0 |
| createdAt | datetime | Timestamp when created |
| updatedAt | datetime | Timestamp of last update |

## Example

```json
{
  "id": "0a1b2c3d-4e5f-6789-abcd-ef0123456789",
  "name": "Cafele",
  "color": "#7c3aed",
  "sortOrder": 0,
  "createdAt": "2026-04-20T09:00:00+03:00",
  "updatedAt": "2026-04-20T09:00:00+03:00"
}
```

## Notes

- Categories are scoped to a single Company (via the `X-Company` header).
- `Product.category` is an optional FK with `ON DELETE SET NULL` — deleting a category does not delete its products; the products simply become uncategorised.
- The mobile POS sorts the chip strip by `sortOrder` ascending, then by `name` ascending as a tie-breaker.
- When a Product tile's `color` is null, the POS falls back to the category colour; when both are null, it uses a deterministic palette derived from the product UUID.

## Related Endpoints

- [List product categories](/api-reference/product-categories/list)
- [Create product category](/api-reference/product-categories/create)
- [Update product category](/api-reference/product-categories/update)
- [Delete product category](/api-reference/product-categories/delete)
