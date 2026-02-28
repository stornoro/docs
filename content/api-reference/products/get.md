---
title: Get product
description: Retrieve detailed information about a specific product.
---

# Get product

Retrieves detailed information about a specific product, including usage statistics.

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
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns a detailed product object.

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `name` | string | Product name |
| `code` | string \| null | Product code/SKU |
| `description` | string \| null | Product description |
| `unitPrice` | number | Default unit price |
| `currency` | string | Default currency (ISO 4217) |
| `vatRateId` | string | Default VAT rate UUID |
| `vatRate` | number | Default VAT percentage |
| `unitOfMeasure` | string | Default unit of measure |
| `isActive` | boolean | Whether product is active |
| `usageStats` | object | Product usage statistics |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

### Usage Stats Object

| Field | Type | Description |
|-------|------|-------------|
| `totalUsage` | integer | Total times used in invoices |
| `totalRevenue` | number | Total revenue generated |
| `averageQuantity` | number | Average quantity per invoice |
| `firstUsedDate` | string \| null | ISO 8601 date of first use |
| `lastUsedDate` | string \| null | ISO 8601 date of last use |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/products/product-uuid-1' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "uuid": "product-uuid-1",
  "name": "Cloud Hosting - Business Plan",
  "code": "HOST-BIZ-001",
  "description": "Business cloud hosting package with 100GB storage and unlimited bandwidth",
  "unitPrice": 1499.00,
  "currency": "RON",
  "vatRateId": "vat-uuid-1",
  "vatRate": 19,
  "unitOfMeasure": "buc",
  "isActive": true,
  "usageStats": {
    "totalUsage": 48,
    "totalRevenue": 71952.00,
    "averageQuantity": 1.0,
    "firstUsedDate": "2025-06-15",
    "lastUsedDate": "2026-02-10"
  },
  "createdAt": "2025-05-10T10:00:00Z",
  "updatedAt": "2026-01-15T14:30:00Z"
}
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Product not found or doesn't belong to company |

## Important Notes

- Products in Storno.ro are sync-only and come from ANAF e-Factura system
- Product data cannot be manually created or edited via API
- Use the [ANAF sync endpoint](/api-reference/anaf/sync-invoices) to fetch latest product data
- Products are automatically created from invoice line items during synchronization
- Usage statistics are calculated in real-time based on invoice line items

## Related Endpoints

- [List products](/api-reference/products/list)
- [Sync from ANAF](/api-reference/anaf/sync-invoices)
