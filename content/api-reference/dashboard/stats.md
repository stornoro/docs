---
title: Dashboard Statistics
description: Get comprehensive dashboard statistics and analytics
---

# Dashboard Statistics

Retrieve statistics for the company dashboard: invoice counts, amounts, monthly totals, recent invoices and payment summary.

---

## Get Dashboard Stats

```http
GET /api/v1/dashboard/stats
```

Get aggregated statistics for the company dashboard. Needs the `report.view` permission. Amounts are converted to the company's default currency. Cancelled invoices are left out of counts and amounts, and `byStatus` still counts them.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | Conditional | Company UUID. Optional when the organization has a single company. The `?company=` query parameter is also accepted |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| dateFrom | string | No | Start of the period, `YYYY-MM-DD`, compared with the invoice issue date |
| dateTo | string | No | End of the period, `YYYY-MM-DD`, compared with the invoice issue date |

Without a period the response covers all invoices, `monthlyTotals` covers the last 12 months, and `previousPeriod` is `null`. When `dateFrom` or `dateTo` is sent, `monthlyTotals` covers the selected period and the one before it, one entry per day for periods of up to 31 days and one per month otherwise. If only `dateFrom` is sent, the period ends today. If only `dateTo` is sent, it starts 30 days earlier.

Responses without a period are cached privately for 60 seconds.

### Response

```json
{
  "invoices": {
    "total": 245,
    "incoming": 100,
    "outgoing": 145
  },
  "byStatus": {
    "draft": 12,
    "issued": 80,
    "validated": 120,
    "paid": 30,
    "cancelled": 3
  },
  "amounts": {
    "total": "1250000.50",
    "vat": "237500.10"
  },
  "clientCount": 58,
  "productCount": 34,
  "lastSyncedAt": "2026-02-16T08:00:00+00:00",
  "syncEnabled": true,
  "recentActivity": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "number": "FINV2026001",
      "direction": "outgoing",
      "status": "validated",
      "total": "12500.00",
      "currency": "RON",
      "senderName": "My Company SRL",
      "receiverName": "SC Example SRL",
      "issueDate": "2026-02-15",
      "dueDate": "2026-03-15",
      "amountPaid": "0.00",
      "syncedAt": "2026-02-16T08:00:00+00:00",
      "paidAt": null
    }
  ],
  "monthlyTotals": [
    {
      "month": "2026-01",
      "incoming": "120000.00",
      "outgoing": "450000.00"
    },
    {
      "month": "2026-02",
      "incoming": "98000.50",
      "outgoing": "380000.50"
    }
  ],
  "amountsByDirection": {
    "incoming": "540000.00",
    "outgoing": "710000.50"
  },
  "payments": {
    "outstandingCount": 45,
    "outstandingAmount": "270000.50",
    "overdueCount": 30,
    "overdueAmount": "95000.00"
  },
  "currency": "RON",
  "previousPeriod": null
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| invoices | object | `total`, `incoming` and `outgoing` invoice counts, without cancelled invoices |
| byStatus | object | Invoice count per status, including `cancelled` |
| amounts | object | `total` and `vat`, in the default currency, as decimal strings |
| clientCount | integer | Clients on file. With a period: distinct clients invoiced in that period |
| productCount | integer | Products on file. With a period: distinct products invoiced in that period |
| lastSyncedAt | string\|null | ISO 8601 time of the last ANAF sync |
| syncEnabled | boolean | Whether ANAF sync is enabled for the company |
| recentActivity | array | Up to 10 most recently synced invoices (see below) |
| monthlyTotals | array | Entries with `month` (`YYYY-MM`, or `YYYY-MM-DD` for short periods), `incoming` and `outgoing` amounts |
| amountsByDirection | object | `incoming` and `outgoing` amounts |
| payments | object | Outstanding and overdue counts and amounts (see below) |
| currency | string | The company's default currency, used for all amounts |
| previousPeriod | object\|null | Same-length period before the selected one. `null` without a period |

#### Recent activity

| Field | Type | Description |
|-------|------|-------------|
| id | string | Invoice UUID |
| number | string\|null | Invoice number |
| direction | string\|null | `outgoing` or `incoming` |
| status | string | Invoice status |
| total | string | Invoice total |
| currency | string | Invoice currency |
| senderName | string\|null | Sender name |
| receiverName | string\|null | Receiver name |
| issueDate | string\|null | `YYYY-MM-DD` |
| dueDate | string\|null | `YYYY-MM-DD` |
| amountPaid | string\|null | Amount paid so far |
| syncedAt | string\|null | ISO 8601 time of the last sync |
| paidAt | string\|null | ISO 8601 time of full payment |

#### Payments

| Field | Type | Description |
|-------|------|-------------|
| outstandingCount | integer | Invoices with an unpaid balance |
| outstandingAmount | string | Unpaid balance in the default currency |
| overdueCount | integer | Overdue invoices |
| overdueAmount | string | Overdue balance in the default currency |

#### Previous period

| Field | Type | Description |
|-------|------|-------------|
| from | string | Start date, `YYYY-MM-DD` |
| to | string | End date, `YYYY-MM-DD` |
| invoices | object | `total`, `incoming`, `outgoing` |
| amounts | object | `total`, `vat` |
| amountsByDirection | object | `incoming`, `outgoing` |
| clientCount | integer | Distinct clients invoiced in that period |
| productCount | integer | Distinct products invoiced in that period |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Missing the `report.view` permission |
| 404 | Company not found |
