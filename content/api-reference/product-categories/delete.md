---
title: Delete product category
description: Remove a product category. Products in the category are not deleted; their categoryId is set to null.
---

# Delete product category

```http
DELETE /api/v1/product-categories/{uuid}
```

The product → category relation uses `ON DELETE SET NULL`, so any products that were in this category lose the assignment but remain intact.

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Category UUID |

## Response

`200 OK`.

```json
{ "message": "Category deleted." }
```

## Permissions

Requires `product.edit`.
