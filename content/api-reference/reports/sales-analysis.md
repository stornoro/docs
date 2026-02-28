---
title: Sales Analysis Report
description: Generate sales analysis reports for a date range
---

# Sales Analysis Report

Generate a comprehensive sales analysis report for a specified date range, including KPI summaries, monthly revenue trends, recent invoices, top clients, and top products.

---

## Generate Sales Analysis Report

```http
GET /api/v1/reports/sales
```

Returns a full sales analysis covering the requested period, including year-over-year KPI comparisons, monthly revenue breakdowns, and rankings for clients and products.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | Yes | Company UUID |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| dateFrom | string | Yes | Start date in YYYY-MM-DD format (e.g., 2026-01-01) |
| dateTo | string | Yes | End date in YYYY-MM-DD format (e.g., 2026-02-26) |

### Response

```json
{
  "period": {
    "dateFrom": "2026-01-01",
    "dateTo": "2026-02-26"
  },
  "kpiSummary": {
    "annualTotal": {
      "amount": 1250000.00,
      "year": 2026,
      "prevAmount": 980000.00,
      "prevYear": 2025
    },
    "periodInvoiced": {
      "subtotal": 210084.03,
      "vatTotal": 39915.97,
      "total": 250000.00,
      "count": 42
    },
    "periodCollected": {
      "subtotal": 168067.23,
      "vatTotal": 31932.77,
      "total": 200000.00,
      "count": 35
    },
    "periodOutstanding": {
      "subtotal": 42016.81,
      "vatTotal": 7983.19,
      "total": 50000.00,
      "count": 7
    }
  },
  "monthlyRevenue": [
    {
      "month": "2026-01",
      "invoiced": 130000.00,
      "collected": 110000.00
    },
    {
      "month": "2026-02",
      "invoiced": 120000.00,
      "collected": 90000.00
    }
  ],
  "recentInvoices": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "number": "FINV2026042",
      "issueDate": "2026-02-24",
      "clientName": "SC Example SRL",
      "total": 11900.00,
      "currency": "RON",
      "status": "paid",
      "paidAt": "2026-02-25"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "number": "FINV2026041",
      "issueDate": "2026-02-20",
      "clientName": "SC Another SRL",
      "total": 5950.00,
      "currency": "RON",
      "status": "unpaid",
      "paidAt": null
    }
  ],
  "topClients": [
    {
      "clientId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "clientName": "SC Top Client SRL",
      "total": 95000.00,
      "count": 12
    },
    {
      "clientId": "d4e5f6a7-b8c9-0123-defa-234567890123",
      "clientName": "SC Second Client SRL",
      "total": 72000.00,
      "count": 8
    }
  ],
  "topProducts": [
    {
      "description": "Software Development Services",
      "productCode": "SVC-001",
      "total": 80000.00,
      "quantity": 400
    },
    {
      "description": "Consulting Hours",
      "productCode": "SVC-002",
      "total": 45000.00,
      "quantity": 150
    }
  ]
}
```

### Response Fields

#### `period`

| Field | Type | Description |
|-------|------|-------------|
| dateFrom | string | Start of the report period (YYYY-MM-DD) |
| dateTo | string | End of the report period (YYYY-MM-DD) |

#### `kpiSummary`

| Field | Type | Description |
|-------|------|-------------|
| annualTotal | object | Year-to-date totals for the current and previous year |
| periodInvoiced | object | Invoiced amounts within the requested date range |
| periodCollected | object | Collected (paid) amounts within the requested date range |
| periodOutstanding | object | Unpaid amounts within the requested date range |

##### `annualTotal`

| Field | Type | Description |
|-------|------|-------------|
| amount | number | Total invoiced amount for the current year |
| year | integer | Current year |
| prevAmount | number | Total invoiced amount for the previous year |
| prevYear | integer | Previous year |

##### `periodInvoiced` / `periodCollected` / `periodOutstanding`

| Field | Type | Description |
|-------|------|-------------|
| subtotal | number | Amount excluding VAT |
| vatTotal | number | VAT amount |
| total | number | Total amount including VAT |
| count | integer | Number of invoices in this bucket |

#### `monthlyRevenue`

Array of monthly revenue breakdown objects.

| Field | Type | Description |
|-------|------|-------------|
| month | string | Month in YYYY-MM format |
| invoiced | number | Total invoiced amount (including VAT) for the month |
| collected | number | Total collected amount (including VAT) for the month |

#### `recentInvoices`

Array of the most recent invoices in the period, ordered by issue date descending.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Invoice UUID |
| number | string | Invoice number |
| issueDate | string | Issue date (YYYY-MM-DD) |
| clientName | string | Client display name |
| total | number | Total invoice amount (including VAT) |
| currency | string | Currency code (e.g., RON, EUR) |
| status | string | Invoice status: `paid`, `unpaid`, `overdue`, `draft` |
| paidAt | string \| null | Payment date (YYYY-MM-DD), or null if unpaid |

#### `topClients`

Array of top clients ranked by total invoiced amount in the period.

| Field | Type | Description |
|-------|------|-------------|
| clientId | string | Client UUID |
| clientName | string | Client display name |
| total | number | Total invoiced amount (including VAT) |
| count | integer | Number of invoices issued to this client |

#### `topProducts`

Array of top products/services ranked by total invoiced amount in the period.

| Field | Type | Description |
|-------|------|-------------|
| description | string | Product or service description |
| productCode | string | Product code or SKU |
| total | number | Total invoiced amount for this product |
| quantity | number | Total quantity invoiced |

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad request - missing or invalid `dateFrom` / `dateTo` parameters |
| 402 | Plan limit exceeded - feature not available on current subscription plan |
| 403 | Forbidden - authenticated user has no access to the specified company |
| 404 | Company not found - the specified company UUID does not exist |
