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
| `name` | string | Yes | 1–100 characters, displayed on the POS chip |
| `color` | string | No | Hex swatch — `"#RRGGBB"` or `"RRGGBB"`. Invalid values are silently dropped. |
| `sortOrder` | integer | No | Default 0. Smaller = earlier in the chip strip |

## Response

`201 Created` — same shape as the list entry.

## Permissions

Requires `product.edit`.
