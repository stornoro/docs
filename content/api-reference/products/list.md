---
title: List products
description: Retrieve a paginated list of products with optional filtering.
---

# List products

Retrieves a paginated list of products for the authenticated company. Results can be searched by name or code, filtered and sorted.

```http
GET /api/v1/products
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | UUID of the company context. The `company` query parameter is accepted as an alternative, and the header can be omitted when the organization has a single company |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10, maximum: 20) |
| `search` | string | No | Matches name or code |
| `sort` | string | No | `recent` (default), `name`, `priceHigh` or `priceLow` |
| `type` | string | No | `product` or `service` |
| `status` | string | No | `active` or `inactive` |
| `usage` | string | No | `sales`, `purchases`, `both` or `internal` |
| `categoryId` | string | No | Category UUID, or `none` for products without a category |
| `source` | string | No | `anaf_sync` or `manual` |

## Response

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of product objects |
| `total` | integer | Total number of matching products |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |

### Product Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Product name |
| `code` | string \| null | Product code/SKU |
| `unitOfMeasure` | string | Default unit of measure (default: `buc`) |
| `defaultPrice` | string | Default unit price, as a decimal string |
| `currency` | string | Default currency (ISO 4217) |
| `vatRate` | string | Default VAT percentage, as a decimal string such as `"21.00"` |
| `isService` | boolean | Whether the product is a service |
| `isActive` | boolean | Whether the product is active |
| `usage` | string | `sales`, `purchases`, `both` or `internal` |
| `ncCode` | string \| null | NC code |
| `cpvCode` | string \| null | CPV code |
| `color` | string \| null | Optional hex colour swatch (e.g. `"#1e40af"`) shown on the POS product grid |
| `category` | object \| null | Optional [product category](/api-reference/product-categories/list), with `id`, `name` and `color` |
| `sgrAmount` | string \| null | Romanian SGR deposit per unit (e.g. `"0.50"`) |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/products?page=1&limit=10&status=active' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": [
    {
      "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
      "name": "Cloud Hosting - Business Plan",
      "code": "HOST-BIZ-001",
      "unitOfMeasure": "buc",
      "defaultPrice": "1499.00",
      "currency": "RON",
      "vatRate": "21.00",
      "isService": true,
      "isActive": true,
      "usage": "both",
      "ncCode": null,
      "cpvCode": null,
      "color": null,
      "category": null,
      "sgrAmount": null
    }
  ],
  "total": 32,
  "page": 1,
  "limit": 10
}
```

## Create a product

```http
POST /api/v1/products
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Product name |
| `unitOfMeasure` | string | Yes | Unit of measure |
| `vatRate` | number \| string | Yes | VAT percentage |
| `defaultPrice` | number \| string | Yes | Default unit price |
| `code`, `description` | string | No | Code and description |
| `currency` | string | No | Currency (default: `RON`) |
| `vatCategoryCode` | string | No | Default `S` |
| `isService` | boolean | No | Default `false` |
| `usage` | string | No | `sales`, `purchases`, `both` (default) or `internal` |
| `ncCode`, `cpvCode` | string | No | Classification codes |
| `color` | string | No | `#RRGGBB` or `RRGGBB`; invalid values are dropped |
| `categoryId` | string | No | UUID of a product category of the company; unknown values leave the category empty |
| `sgrAmount` | number \| string | No | Deposit per unit, 0 to 999.99; invalid values are dropped |

Returns `201` with the product in the same shape as [Get product](/api-reference/products/get). Missing required fields return `400` with `{"errors": [{"key": "name", "message": "..."}]}`.

## Update a product

```http
PATCH /api/v1/products/{uuid}
```

Accepts the fields of the create request, plus `isActive` (boolean). Only the fields you send are changed. Returns the product in the same shape as [Get product](/api-reference/products/get).

## Delete a product

```http
DELETE /api/v1/products/{uuid}
```

Soft-deletes the product and returns `204 No Content`.

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found |

Error responses have the form `{"error": "message"}`.

## Related Endpoints

- [Get product](/api-reference/products/get)
- [List product categories](/api-reference/product-categories/list)
