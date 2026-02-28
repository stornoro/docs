---
title: Get supplier
description: Retrieve detailed information about a specific supplier including invoice history.
---

# Get supplier

Retrieves detailed information about a specific supplier, including summary statistics of incoming invoices.

```http
GET /api/v1/suppliers/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the supplier |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns a detailed supplier object with incoming invoice summary statistics.

### Response Schema

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
| `country` | string | Country code |
| `postalCode` | string \| null | Postal code |
| `bankName` | string \| null | Bank name |
| `bankAccount` | string \| null | Bank account (IBAN) |
| `notes` | string \| null | Internal notes |
| `invoiceSummary` | object | Summary of incoming invoice statistics |
| `recentInvoices` | array | Array of recent incoming invoice objects (last 10) |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

### Invoice Summary Object

| Field | Type | Description |
|-------|------|-------------|
| `totalCount` | integer | Total number of incoming invoices |
| `totalExpenses` | number | Total expenses from all invoices |
| `averageInvoiceAmount` | number | Average invoice amount |
| `lastInvoiceDate` | string \| null | ISO 8601 date of most recent invoice |

### Recent Invoice Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Invoice UUID |
| `number` | string | Invoice number |
| `issueDate` | string | ISO 8601 issue date |
| `dueDate` | string \| null | ISO 8601 due date |
| `totalAmount` | number | Total amount |
| `currency` | string | Currency code |
| `status` | string | Invoice status |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/suppliers/supplier-uuid-1' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
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
  "notes": "Furnizor energie electrică - plată lunar prin debit direct",
  "invoiceSummary": {
    "totalCount": 12,
    "totalExpenses": 4580.50,
    "averageInvoiceAmount": 381.71,
    "lastInvoiceDate": "2026-02-10"
  },
  "recentInvoices": [
    {
      "uuid": "incoming-inv-uuid-1",
      "number": "2026/FAC00458",
      "issueDate": "2026-02-10",
      "dueDate": "2026-02-25",
      "totalAmount": 392.40,
      "currency": "RON",
      "status": "received"
    },
    {
      "uuid": "incoming-inv-uuid-2",
      "number": "2026/FAC00234",
      "issueDate": "2026-01-10",
      "dueDate": "2026-01-25",
      "totalAmount": 385.20,
      "currency": "RON",
      "status": "received"
    },
    {
      "uuid": "incoming-inv-uuid-3",
      "number": "2025/FAC04521",
      "issueDate": "2025-12-10",
      "dueDate": "2025-12-25",
      "totalAmount": 378.90,
      "currency": "RON",
      "status": "received"
    }
  ],
  "createdAt": "2025-06-01T08:00:00Z",
  "updatedAt": "2026-02-10T10:15:00Z"
}
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Supplier not found or doesn't belong to company |

## Important Notes

- Suppliers in Storno.ro are automatically created from incoming invoices via ANAF e-Factura
- Supplier core data (name, CUI, address) comes from ANAF and cannot be manually edited
- Only contact information and notes can be updated via the [update endpoint](/api-reference/suppliers/update)
- Invoice summary statistics are calculated in real-time

## Related Endpoints

- [List suppliers](/api-reference/suppliers/list)
- [Update supplier](/api-reference/suppliers/update)
- [Sync from ANAF](/api-reference/anaf/sync-invoices)
