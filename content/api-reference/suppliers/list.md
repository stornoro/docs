---
title: List suppliers
description: Retrieve a paginated list of suppliers with incoming invoice statistics.
---

# List suppliers

Retrieves a paginated list of suppliers for the authenticated company, with the number and total of incoming invoices received from each. Results can be searched, filtered and sorted.

```http
GET /api/v1/suppliers
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
| `search` | string | No | Matches name, CIF or VAT code |
| `sort` | string | No | `recent` (default), `mostInvoiced`, `mostInvoices`, `recentActivity` or `name` |
| `vatPayer` | string | No | `yes` or `no` |
| `hasInvoices` | string | No | `active` (at least one incoming invoice) or `dormant` (none) |
| `source` | string | No | `anaf_sync` or `manual` |

## Response

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of supplier objects |
| `total` | integer | Total number of suppliers matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `currency` | string | Default currency of the company, used for `invoiceTotal` |
| `hasForeignCurrencies` | boolean | Whether the company has incoming invoices in other currencies |

### Supplier Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Supplier name |
| `cif` | string \| null | Tax identification number |
| `vatCode` | string \| null | Full VAT code with country prefix |
| `isVatPayer` | boolean | Whether the supplier is registered for VAT |
| `address` | string \| null | Street address |
| `city` | string \| null | City |
| `email` | string \| null | Email address |
| `lastSyncedAt` | string \| null | Timestamp of the last synchronization |
| `source` | string | `anaf_sync` or `manual` |
| `affiliated` | boolean | Affiliated party flag |
| `inactive` | boolean \| null | Inactive taxpayer status from the last verification |
| `vatRegistered` | boolean \| null | VAT registration from the last verification |
| `vatOnCollection` | boolean \| null | VAT on collection from the last verification |
| `efacturaRegistered` | boolean \| null | Presence in the e-Factura register |
| `viesValid` | boolean \| null | VIES validation result |
| `vatStatusCheckedAt` | string \| null | Timestamp of the last verification |
| `createdAt` | string | Creation timestamp |
| `invoiceCount` | integer | Number of incoming invoices from this supplier |
| `invoiceTotal` | number | Total of those invoices, converted to the company currency |
| `lastInvoiceDate` | string \| null | Issue date of the most recent incoming invoice |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/suppliers?page=1&limit=10&sort=name' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "name": "Energie Exemplu SA",
      "cif": "12345678",
      "vatCode": "RO12345678",
      "isVatPayer": true,
      "address": "Bd. Exemplu, Nr. 74",
      "city": "Bucuresti Sectorul 3",
      "email": "relatii@energie.example",
      "lastSyncedAt": "2026-02-10 10:15:00",
      "source": "anaf_sync",
      "affiliated": false,
      "inactive": false,
      "vatRegistered": true,
      "vatOnCollection": false,
      "efacturaRegistered": true,
      "viesValid": null,
      "vatStatusCheckedAt": "2026-02-10 06:40:12",
      "createdAt": "2025-06-01 08:00:00",
      "invoiceCount": 12,
      "invoiceTotal": 4580.5,
      "lastInvoiceDate": "2026-02-10"
    }
  ],
  "total": 23,
  "page": 1,
  "limit": 10,
  "currency": "RON",
  "hasForeignCurrencies": false
}
```

## Create a supplier

```http
POST /api/v1/suppliers
```

Suppliers are created from incoming invoices during synchronization, and can also be created manually.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Supplier name |
| `county` | string | Yes | County |
| `city` | string | Yes | City |
| `address` | string | Yes | Street address |
| `registrationNumber` | string | Yes | Trade register number |
| `cif` | string | No | Tax identification number |
| `vatCode` | string | No | Full VAT code with country prefix |
| `isVatPayer` | boolean | No | Default `false` |
| `country` | string | No | Default `RO` |
| `postalCode`, `email`, `phone`, `bankName`, `bankAccount`, `notes` | string | No | Contact and banking details |
| `affiliated` | boolean | No | Affiliated party flag |

Returns `201` with `{"supplier": {...}}`. If a supplier with the same `cif` already exists, returns `200` with `{"supplier": {...}, "existing": true}`. A missing required field returns `422` with `{"error": "County is required."}` (or the matching message).

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found |

Error responses have the form `{"error": "message"}`.

## Related Endpoints

- [Get supplier](/api-reference/suppliers/get)
- [Update supplier](/api-reference/suppliers/update)
- [Delete supplier](/api-reference/suppliers/delete)
