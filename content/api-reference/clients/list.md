---
title: List clients
description: Retrieve a paginated, alphabetically grouped list of clients.
---

# List clients

Retrieves a paginated list of clients for the authenticated company, grouped alphabetically by the first letter of their name. Results can be filtered by type and searched by name or tax identification number.

```http
GET /api/v1/clients
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
| `search` | string | No | Search term to filter by name, CUI/CNP, or email |
| `type` | string | No | Filter by type: `company` or `individual` |

## Response

Returns a paginated object with clients grouped alphabetically.

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `data` | object | Object with alphabetic keys (A-Z, #) containing arrays of clients |
| `total` | integer | Total number of clients matching filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `pages` | integer | Total number of pages |

### Client Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `name` | string | Client name or full name |
| `type` | string | `company` or `individual` |
| `cui` | string \| null | Tax identification number (CUI for companies, CNP for individuals) |
| `tradeRegister` | string \| null | Trade register number (J##/####/####) |
| `email` | string \| null | Email address |
| `phone` | string \| null | Phone number |
| `address` | string \| null | Street address |
| `city` | string \| null | City |
| `county` | string \| null | County |
| `country` | string | Country code (default: "RO") |
| `postalCode` | string \| null | Postal code |
| `bankName` | string \| null | Bank name |
| `bankAccount` | string \| null | Bank account (IBAN) |
| `invoiceCount` | integer | Number of invoices issued to this client |
| `totalRevenue` | number | Total revenue from this client |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/clients?page=1&limit=50&type=company' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": {
    "A": [
      {
        "uuid": "client-uuid-1",
        "name": "Acme Corporation SRL",
        "type": "company",
        "cui": "RO12345678",
        "tradeRegister": "J40/1234/2020",
        "email": "contact@acme.ro",
        "phone": "+40723456789",
        "address": "Str. Exemplu, Nr. 1",
        "city": "București",
        "county": "București",
        "country": "RO",
        "postalCode": "010101",
        "bankName": "BCR",
        "bankAccount": "RO49AAAA1B31007593840000",
        "invoiceCount": 24,
        "totalRevenue": 42780.00,
        "createdAt": "2025-06-10T09:00:00Z",
        "updatedAt": "2026-02-10T14:30:00Z"
      },
      {
        "uuid": "client-uuid-2",
        "name": "Alpha Tech SRL",
        "type": "company",
        "cui": "RO87654321",
        "tradeRegister": "J12/5678/2019",
        "email": "office@alphatech.ro",
        "phone": "+40734567890",
        "address": "Bd. Tehnologiei, Nr. 45",
        "city": "Cluj-Napoca",
        "county": "Cluj",
        "country": "RO",
        "postalCode": "400001",
        "bankName": "BT",
        "bankAccount": "RO49BTRL01101205N50289XX",
        "invoiceCount": 12,
        "totalRevenue": 18450.00,
        "createdAt": "2025-08-15T11:20:00Z",
        "updatedAt": "2026-01-25T16:45:00Z"
      }
    ],
    "B": [
      {
        "uuid": "client-uuid-3",
        "name": "Beta Solutions SRL",
        "type": "company",
        "cui": "RO11223344",
        "tradeRegister": "J23/9012/2021",
        "email": "contact@betasolutions.ro",
        "phone": "+40745678901",
        "address": "Str. Inovației, Nr. 78",
        "city": "Ilfov",
        "county": "Ilfov",
        "country": "RO",
        "postalCode": "077190",
        "bankName": "ING",
        "bankAccount": "RO49INGB0000999900000017",
        "invoiceCount": 6,
        "totalRevenue": 9200.00,
        "createdAt": "2025-09-22T10:15:00Z",
        "updatedAt": "2026-02-05T12:00:00Z"
      }
    ]
  },
  "total": 47,
  "page": 1,
  "limit": 50,
  "pages": 1
}
```

## Alphabetical Grouping

Clients are grouped by the first character of their name:

- Letters A-Z: Standard alphabetic grouping
- "#": Used for names starting with numbers or special characters

If a letter has no clients, it will not appear in the response object.

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 422 | validation_error | Invalid query parameters |

## Related Endpoints

- [Get client](/api-reference/clients/get)
- [Sync clients from ANAF](/api-reference/anaf/sync-invoices)
