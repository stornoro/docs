---
title: Create product category
description: Create a new POS product category for the active company.
---

# Create product category

```http
POST /api/v1/product-categories
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `X-Company` | string | Yes | Company UUID |
| `Content-Type` | string | Yes | `application/json` |

## Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Displayed on the POS chip. Up to 100 characters |
| `color` | string | No | Hex swatch — `"#RRGGBB"` or `"RRGGBB"`. Invalid values are silently dropped. |
| `sortOrder` | integer | No | Default 0. Smaller = earlier in the chip strip |

## Response

`201 Created` with the category: `id`, `name`, `color`, `sortOrder`, `createdAt` and `updatedAt`.

## Errors

| Status | Description |
|--------|-------------|
| 400 | `name` is missing or empty |
| 403 | Permission denied |
| 404 | Company not found |

Error bodies have the form `{"error": "message"}`.

## Permissions

Requires `product.edit`.
