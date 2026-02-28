---
title: List suppliers
description: Retrieve a paginated, alphabetically grouped list of suppliers.
---

# List suppliers

Retrieves a paginated list of suppliers for the authenticated company, grouped alphabetically by the first letter of their name. Results can be searched by name or tax identification number.

```http
GET /api/v1/suppliers
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
| `search` | string | No | Search term to filter by name, CUI, or email |

## Response

Returns a paginated object with suppliers grouped alphabetically.

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `data` | object | Object with alphabetic keys (A-Z, #) containing arrays of suppliers |
| `total` | integer | Total number of suppliers matching filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `pages` | integer | Total number of pages |

### Supplier Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `name` | string | Supplier name |
| `cui` | string \| null | Tax identification number (CUI) |
| `email` | string \| null | Email address |
| `phone` | string \| null | Phone number |
| `address` | string \| null | Street address |
| `city` | string \| null | City |
| `county` | string \| null | County |
| `country` | string | Country code (default: "RO") |
| `postalCode` | string \| null | Postal code |
| `bankName` | string \| null | Bank name |
| `bankAccount` | string \| null | Bank account (IBAN) |
| `notes` | string \| null | Internal notes |
| `invoiceCount` | integer | Number of incoming invoices from this supplier |
| `totalExpenses` | number | Total expenses from this supplier |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/suppliers?page=1&limit=50' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": {
    "E": [
      {
        "uuid": "supplier-uuid-1",
        "name": "Enel Energie Muntenia SA",
        "cui": "RO13267221",
        "email": "relatii.clienti@enel.ro",
        "phone": "+40214029700",
        "address": "Bd. Unirii, Nr. 74",
        "city": "București",
        "county": "București",
        "country": "RO",
        "postalCode": "030823",
        "bankName": "Banca Transilvania",
        "bankAccount": "RO49BTRL01304402S0390901",
        "notes": "Furnizor energie electrică",
        "invoiceCount": 12,
        "totalExpenses": 4580.50,
        "createdAt": "2025-06-01T08:00:00Z",
        "updatedAt": "2026-02-10T10:15:00Z"
      }
    ],
    "O": [
      {
        "uuid": "supplier-uuid-2",
        "name": "Orange România SA",
        "cui": "RO10625813",
        "email": "office@orange.ro",
        "phone": "+40214037777",
        "address": "Str. Laminorului, Nr. 39",
        "city": "București",
        "county": "București",
        "country": "RO",
        "postalCode": "020251",
        "bankName": "BCR",
        "bankAccount": "RO49RNCB0082034687510001",
        "notes": "Servicii telefonie și internet",
        "invoiceCount": 8,
        "totalExpenses": 1240.00,
        "createdAt": "2025-06-15T09:30:00Z",
        "updatedAt": "2026-02-05T14:20:00Z"
      }
    ]
  },
  "total": 23,
  "page": 1,
  "limit": 50,
  "pages": 1
}
```

## Alphabetical Grouping

Suppliers are grouped by the first character of their name:

- Letters A-Z: Standard alphabetic grouping
- "#": Used for names starting with numbers or special characters

If a letter has no suppliers, it will not appear in the response object.

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 422 | validation_error | Invalid query parameters |

## Important Notes

- Suppliers in Storno.ro are sync-only and come from incoming invoices via ANAF e-Factura
- Supplier data is automatically created from incoming invoice metadata
- Manual supplier updates are limited to contact information and notes
- Use the [ANAF sync endpoint](/api-reference/anaf/sync-invoices) to fetch latest supplier data

## Related Endpoints

- [Get supplier](/api-reference/suppliers/get)
- [Update supplier](/api-reference/suppliers/update)
- [Sync from ANAF](/api-reference/anaf/sync-invoices)
