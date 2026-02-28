---
title: List products
description: Retrieve a paginated list of products with optional filtering.
---

# List products

Retrieves a paginated list of products for the authenticated company. Results can be filtered by active status and searched by name, code, or description.

```http
GET /api/v1/products
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 50, max: 200) |
| `search` | string | No | Search term to filter by name, code, or description |
| `isActive` | boolean | No | Filter by active status (true/false) |

## Response

Returns a paginated list of product objects.

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of product objects |
| `total` | integer | Total number of matching products |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `pages` | integer | Total number of pages |

### Product Object

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
| `usageCount` | integer | Number of times used in invoices |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/products?page=1&limit=50&isActive=true' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": [
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
      "usageCount": 48,
      "createdAt": "2025-05-10T10:00:00Z",
      "updatedAt": "2026-01-15T14:30:00Z"
    },
    {
      "uuid": "product-uuid-2",
      "name": "Cloud Hosting - Premium Plan",
      "code": "HOST-PREM-001",
      "description": "Premium cloud hosting package with 500GB storage and dedicated resources",
      "unitPrice": 2499.00,
      "currency": "RON",
      "vatRateId": "vat-uuid-1",
      "vatRate": 19,
      "unitOfMeasure": "buc",
      "isActive": true,
      "usageCount": 22,
      "createdAt": "2025-05-10T10:05:00Z",
      "updatedAt": "2026-02-01T09:20:00Z"
    },
    {
      "uuid": "product-uuid-3",
      "name": "SSL Certificate - Single Domain",
      "code": "SSL-SINGLE-001",
      "description": "Standard SSL certificate for single domain, valid 1 year",
      "unitPrice": 299.00,
      "currency": "RON",
      "vatRateId": "vat-uuid-1",
      "vatRate": 19,
      "unitOfMeasure": "buc",
      "isActive": true,
      "usageCount": 15,
      "createdAt": "2025-06-20T11:30:00Z",
      "updatedAt": "2025-12-10T16:45:00Z"
    }
  ],
  "total": 32,
  "page": 1,
  "limit": 50,
  "pages": 1
}
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 422 | validation_error | Invalid query parameters |

## Important Notes

- Products in Storno.ro are sync-only and come from ANAF e-Factura system
- Product data cannot be manually created or edited via API
- Use the [ANAF sync endpoint](/api-reference/anaf/sync-invoices) to fetch latest product data
- Products are extracted from invoice line items during synchronization
- `usageCount` reflects how many times a product has been used in invoice lines

## Related Endpoints

- [Get product](/api-reference/products/get)
- [Sync from ANAF](/api-reference/anaf/sync-invoices)
