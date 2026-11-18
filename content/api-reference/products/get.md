---
title: Get product
description: Retrieve detailed information about a specific product.
---

# Get product

Retrieves a product by UUID.

```http
GET /api/v1/products/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the product |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | UUID of the company context. The `company` query parameter is accepted as an alternative, and the header can be omitted when the organization has a single company. Routes addressed by UUID resolve the company from the record |

## Response

Returns the product object.

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Product name |
| `code` | string \| null | Product code/SKU |
| `description` | string \| null | Product description |
| `unitOfMeasure` | string | Default unit of measure |
| `defaultPrice` | string | Default unit price, as a decimal string |
| `currency` | string | Default currency (ISO 4217) |
| `vatRate` | string | Default VAT percentage, as a decimal string such as `"21.00"` |
| `vatCategoryCode` | string | VAT category code (default: `S`) |
| `isService` | boolean | Whether the product is a service |
| `usage` | string | `sales`, `purchases`, `both` or `internal` |
| `ncCode` | string \| null | NC code |
| `cpvCode` | string \| null | CPV code |
| `color` | string \| null | Optional hex colour swatch (e.g. `"#1e40af"`) shown on the POS product grid. When null, mobile clients fall back to a deterministic palette derived from the product UUID |
| `category` | object \| null | Optional [product category](/api-reference/product-categories/list), with `id`, `name` and `color`. Used as fallback swatch and grid grouping on the POS |
| `sgrAmount` | string \| null | Romanian SGR (Sistem Garantie-Returnare) deposit per unit, e.g. `"0.50"` for plastic beverage bottles. Null when the product is not SGR-eligible. The deposit is VAT-exempt and appears as a separate auto-managed line on POS receipts |
| `source` | string | `anaf_sync` or `manual` |
| `lastSyncedAt` | string \| null | Timestamp of the last synchronization |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/products/d4e5f6a7-b8c9-0123-defa-234567890123' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
  "name": "Cloud Hosting - Business Plan",
  "code": "HOST-BIZ-001",
  "description": "Business cloud hosting package with 100GB storage",
  "unitOfMeasure": "buc",
  "defaultPrice": "1499.00",
  "currency": "RON",
  "vatRate": "21.00",
  "vatCategoryCode": "S",
  "isService": true,
  "usage": "both",
  "ncCode": null,
  "cpvCode": null,
  "color": null,
  "category": null,
  "sgrAmount": null,
  "source": "manual",
  "lastSyncedAt": null
}
```

## Product usage

```http
GET /api/v1/products/{uuid}/usage
```

Returns the number of documents that contain the product on a line:

```json
{
  "invoices": 48,
  "proformaInvoices": 3,
  "recurringInvoices": 1,
  "total": 52
}
```

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Product not found |

Error responses have the form `{"error": "message"}`.

## Related Endpoints

- [List products](/api-reference/products/list)
- [Create, update and delete a product](/api-reference/products/list#create-a-product)
