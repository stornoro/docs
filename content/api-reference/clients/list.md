---
title: List clients
description: Retrieve a paginated list of clients with invoice statistics.
---

# List clients

Retrieves a paginated list of clients for the authenticated company, with the number and total of outgoing invoices issued to each. Results can be searched, filtered and sorted.

```http
GET /api/v1/clients
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
| `search` | string | No | Matches name, CUI, CNP, email, ID number or VAT code |
| `country` | string | No | Filter by country code |
| `sort` | string | No | `recent` (default), `mostInvoiced`, `mostInvoices`, `recentActivity` or `name` |
| `vatPayer` | string | No | `yes` or `no` |
| `hasInvoices` | string | No | `active` (at least one outgoing invoice) or `dormant` (none) |
| `source` | string | No | `anaf_sync` or `manual` |

## Response

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of client objects |
| `total` | integer | Total number of clients matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `currency` | string | Default currency of the company, used for `invoiceTotal` |
| `hasForeignCurrencies` | boolean | Whether the company has outgoing invoices in other currencies |
| `distinctCountries` | string[] | Country codes present among the company's clients |

### Client Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `type` | string | `company` or `individual` |
| `name` | string | Client name or full name |
| `cui` | string \| null | Tax identification number |
| `cnp` | string \| null | Personal identification number |
| `vatCode` | string \| null | Full VAT code with country prefix |
| `isVatPayer` | boolean | Whether the client is registered for VAT |
| `address` | string \| null | Street address |
| `city` | string \| null | City |
| `email` | string \| null | Email address |
| `country` | string | Country code |
| `viesValid` | boolean \| null | VIES validation result (`true` valid, `false` invalid, `null` not validated) |
| `source` | string | `anaf_sync` or `manual` |
| `status` | string | `active`, `warning` or `blocked` |
| `creditLimit` | string \| null | Credit limit in the company currency |
| `affiliated` | boolean | Affiliated party flag |
| `inactive` | boolean \| null | Inactive taxpayer status from the last verification |
| `vatRegistered` | boolean \| null | VAT registration from the last verification |
| `vatOnCollection` | boolean \| null | VAT on collection from the last verification |
| `efacturaRegistered` | boolean \| null | Presence in the e-Factura register |
| `vatStatusCheckedAt` | string \| null | Timestamp of the last verification |
| `invoiceCount` | integer | Number of outgoing invoices issued to this client |
| `invoiceTotal` | number | Total of those invoices, converted to the company currency |
| `lastInvoiceDate` | string \| null | Issue date of the most recent outgoing invoice |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/clients?page=1&limit=10&sort=name' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": [
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "type": "company",
      "name": "Acme Corporation SRL",
      "cui": "12345678",
      "cnp": null,
      "vatCode": "RO12345678",
      "isVatPayer": true,
      "address": "Str. Exemplu, Nr. 1",
      "city": "Bucuresti Sectorul 1",
      "email": "contact@acme.example",
      "country": "RO",
      "viesValid": null,
      "source": "manual",
      "status": "active",
      "creditLimit": null,
      "affiliated": false,
      "inactive": false,
      "vatRegistered": true,
      "vatOnCollection": false,
      "efacturaRegistered": true,
      "vatStatusCheckedAt": "2026-02-10 06:40:12",
      "invoiceCount": 24,
      "invoiceTotal": 42780.0,
      "lastInvoiceDate": "2026-02-10"
    }
  ],
  "total": 47,
  "page": 1,
  "limit": 10,
  "currency": "RON",
  "hasForeignCurrencies": false,
  "distinctCountries": ["DE", "RO"]
}
```

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found |

Error responses have the form `{"error": "message"}`.

## Related Endpoints

- [Get client](/api-reference/clients/get)
- [Create client](/api-reference/clients/create)
