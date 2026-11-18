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
| `name` | string | Up to 100 characters; empty rejected with `400` |
| `color` | string \| null | Pass null to clear the swatch |
| `sortOrder` | integer | Reorder in the chip strip |

## Response

`200 OK` with the updated category: `id`, `name`, `color`, `sortOrder`, `createdAt` and `updatedAt`.

## Errors

| Status | Description |
|--------|-------------|
| 400 | `name` is empty |
| 403 | Permission denied |
| 404 | Company not found, or category not found in this company |

Error bodies have the form `{"error": "message"}`.

## Permissions

Requires `product.edit`.
