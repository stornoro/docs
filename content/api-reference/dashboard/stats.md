---
title: Dashboard Statistics
description: Get comprehensive dashboard statistics and analytics
---

# Dashboard Statistics

Retrieve comprehensive statistics for the company dashboard including invoice counts, revenue amounts, trends, and activity.

---

## Get Dashboard Stats

```http
GET /api/v1/dashboard/stats
```

Get aggregated statistics for the company dashboard.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | Yes | Company UUID |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period | string | No | Predefined period: `month`, `quarter`, `year` |
| from | string | No | Custom start date (ISO 8601) |
| to | string | No | Custom end date (ISO 8601) |

### Response

```json
{
  "invoiceCounts": {
    "total": 245,
    "draft": 12,
    "issued": 180,
    "paid": 150,
    "overdue": 30
  },
  "amounts": {
    "totalRevenue": 1250000.50,
    "totalVat": 237500.10,
    "totalPaid": 980000.00,
    "totalUnpaid": 270000.50
  },
  "monthly": [
    {
      "month": "2026-01",
      "revenue": 450000.00,
      "count": 85
    },
    {
      "month": "2026-02",
      "revenue": 380000.50,
      "count": 72
    }
  ],
  "topClients": [
    {
      "name": "SC Example SRL",
      "cif": "12345678",
      "revenue": 120000.00,
      "invoiceCount": 15
    }
  ],
  "topProducts": [
    {
      "name": "Web Development Services",
      "quantity": 450,
      "revenue": 225000.00,
      "invoiceCount": 28
    }
  ],
  "recentActivity": [
    {
      "type": "invoice_issued",
      "invoiceNumber": "FINV2026001",
      "client": "SC Example SRL",
      "amount": 12500.00,
      "timestamp": "2026-02-16T10:30:00Z"
    }
  ],
  "paymentSummary": {
    "onTime": 120,
    "late": 30,
    "pending": 45
  }
}
```

### Response Fields

#### Invoice Counts
| Field | Type | Description |
|-------|------|-------------|
| total | integer | Total number of invoices |
| draft | integer | Draft invoices not yet issued |
| issued | integer | Invoices issued to ANAF |
| paid | integer | Fully paid invoices |
| overdue | integer | Overdue unpaid invoices |

#### Amounts
| Field | Type | Description |
|-------|------|-------------|
| totalRevenue | number | Total revenue (excluding VAT) |
| totalVat | number | Total VAT collected |
| totalPaid | number | Total amount received |
| totalUnpaid | number | Outstanding receivables |

#### Monthly Breakdown
| Field | Type | Description |
|-------|------|-------------|
| month | string | Month in YYYY-MM format |
| revenue | number | Revenue for that month |
| count | integer | Number of invoices |

#### Top Clients
| Field | Type | Description |
|-------|------|-------------|
| name | string | Client company name |
| cif | string | Client fiscal code |
| revenue | number | Total revenue from client |
| invoiceCount | integer | Number of invoices |

#### Top Products
| Field | Type | Description |
|-------|------|-------------|
| name | string | Product/service name |
| quantity | number | Total quantity sold |
| revenue | number | Total revenue generated |
| invoiceCount | integer | Number of invoices containing this product |

#### Recent Activity
| Field | Type | Description |
|-------|------|-------------|
| type | string | Activity type: `invoice_issued`, `payment_received`, etc. |
| invoiceNumber | string | Invoice identifier |
| client | string | Client name |
| amount | number | Transaction amount |
| timestamp | string | ISO 8601 timestamp |

#### Payment Summary
| Field | Type | Description |
|-------|------|-------------|
| onTime | integer | Invoices paid on or before due date |
| late | integer | Invoices paid after due date |
| pending | integer | Unpaid invoices |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - no access to company |
| 422 | Invalid query parameters |
