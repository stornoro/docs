---
title: Get client
description: Retrieve detailed information about a specific client including invoice history.
---

# Get client

Retrieves detailed information about a specific client, including summary statistics of their invoice history.

```http
GET /api/v1/clients/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the client |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns a detailed client object with invoice summary statistics.

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `name` | string | Client name or full name |
| `type` | string | `company` or `individual` |
| `cui` | string \| null | Tax identification number (CUI for companies, CNP for individuals) |
| `tradeRegister` | string \| null | Trade register number |
| `email` | string \| null | Email address |
| `phone` | string \| null | Phone number |
| `address` | string \| null | Street address |
| `city` | string \| null | City |
| `county` | string \| null | County |
| `country` | string | Country code |
| `postalCode` | string \| null | Postal code |
| `bankName` | string \| null | Bank name |
| `bankAccount` | string \| null | Bank account (IBAN) |
| `invoiceSummary` | object | Summary of invoice statistics |
| `recentInvoices` | array | Array of recent invoice objects (last 10) |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

### Invoice Summary Object

| Field | Type | Description |
|-------|------|-------------|
| `totalCount` | integer | Total number of invoices |
| `unpaidCount` | integer | Number of unpaid invoices |
| `overdueCount` | integer | Number of overdue invoices |
| `totalRevenue` | number | Total revenue from all invoices |
| `unpaidAmount` | number | Total unpaid amount |
| `overdueAmount` | number | Total overdue amount |
| `averageInvoiceAmount` | number | Average invoice amount |
| `lastInvoiceDate` | string \| null | ISO 8601 date of most recent invoice |

### Recent Invoice Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Invoice UUID |
| `number` | string | Invoice number |
| `issueDate` | string | ISO 8601 issue date |
| `dueDate` | string | ISO 8601 due date |
| `totalAmount` | number | Total amount |
| `amountPaid` | number | Amount paid |
| `status` | string | Invoice status |
| `currency` | string | Currency code |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/clients/client-uuid-1' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
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
  "invoiceSummary": {
    "totalCount": 24,
    "unpaidCount": 3,
    "overdueCount": 1,
    "totalRevenue": 42780.00,
    "unpaidAmount": 5450.00,
    "overdueAmount": 1500.00,
    "averageInvoiceAmount": 1782.50,
    "lastInvoiceDate": "2026-02-10"
  },
  "recentInvoices": [
    {
      "uuid": "invoice-uuid-1",
      "number": "FAC00245",
      "issueDate": "2026-02-10",
      "dueDate": "2026-03-12",
      "totalAmount": 2380.00,
      "amountPaid": 0.00,
      "status": "unpaid",
      "currency": "RON"
    },
    {
      "uuid": "invoice-uuid-2",
      "number": "FAC00231",
      "issueDate": "2026-01-15",
      "dueDate": "2026-02-14",
      "totalAmount": 1500.00,
      "amountPaid": 0.00,
      "status": "overdue",
      "currency": "RON"
    },
    {
      "uuid": "invoice-uuid-3",
      "number": "FAC00218",
      "issueDate": "2025-12-20",
      "dueDate": "2026-01-19",
      "totalAmount": 3200.00,
      "amountPaid": 3200.00,
      "status": "paid",
      "currency": "RON"
    }
  ],
  "createdAt": "2025-06-10T09:00:00Z",
  "updatedAt": "2026-02-10T14:30:00Z"
}
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Client not found or doesn't belong to company |

## Important Notes

- Clients in Storno.ro are sync-only and come from ANAF e-Factura system
- Client data cannot be manually created or edited via API
- Use the [ANAF sync endpoint](/api-reference/anaf/sync-invoices) to fetch latest client data
- Invoice summary statistics are calculated in real-time

## Related Endpoints

- [List clients](/api-reference/clients/list)
- [List invoices](/api-reference/invoices/list)
- [Sync from ANAF](/api-reference/anaf/sync-invoices)
