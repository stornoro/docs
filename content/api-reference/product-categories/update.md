---
title: Update product category
description: Edit a product category's name, colour, or sort order.
---

# Update product category

```http
PATCH /api/v1/product-categories/{uuid}
```

All fields are optional; omitted fields stay unchanged.

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Category UUID |

## Body

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | 1–100 characters; empty rejected with `400` |
| `color` | string \| null | Pass null to clear the swatch |
| `sortOrder` | integer | Reorder in the chip strip |

## Response

`200 OK` with the updated category.

## Permissions

Requires `product.edit`.
