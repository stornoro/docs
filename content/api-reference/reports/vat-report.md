---
title: VAT Report
description: Generate monthly VAT reports for tax filing
---

# VAT Report

Generate detailed VAT (TVA) reports for a specific month to support tax filing requirements.

---

## Generate VAT Report

```http
GET /api/v1/reports/vat
```

Generate a comprehensive VAT report including sales, purchases, VAT collected, and VAT deductible.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | Yes | Company UUID |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | integer | Yes | Report year (e.g., 2026) |
| month | integer | Yes | Report month (1-12) |

### Response

```json
{
  "period": "2026-02",
  "totalSales": 450000.00,
  "totalVatCollected": 85500.00,
  "totalPurchases": 180000.00,
  "totalVatDeductible": 34200.00,
  "vatDue": 51300.00,
  "invoices": [
    {
      "number": "FINV2026001",
      "type": "sale",
      "date": "2026-02-03",
      "client": "SC Example SRL",
      "cif": "12345678",
      "baseAmount": 10000.00,
      "vatRate": 19,
      "vatAmount": 1900.00,
      "totalAmount": 11900.00
    },
    {
      "number": "FINV2026002",
      "type": "purchase",
      "date": "2026-02-05",
      "supplier": "SC Supplier SRL",
      "cif": "87654321",
      "baseAmount": 5000.00,
      "vatRate": 19,
      "vatAmount": 950.00,
      "totalAmount": 5950.00
    }
  ]
}
```

### Response Fields

#### Summary
| Field | Type | Description |
|-------|------|-------------|
| period | string | Report period in YYYY-MM format |
| totalSales | number | Total sales revenue (excluding VAT) |
| totalVatCollected | number | Total VAT collected on sales |
| totalPurchases | number | Total purchases (excluding VAT) |
| totalVatDeductible | number | Total VAT paid on purchases |
| vatDue | number | Net VAT due (collected - deductible) |

#### Invoice Details
| Field | Type | Description |
|-------|------|-------------|
| number | string | Invoice number |
| type | string | Transaction type: `sale` or `purchase` |
| date | string | Invoice date (YYYY-MM-DD) |
| client | string | Client name (for sales) |
| supplier | string | Supplier name (for purchases) |
| cif | string | Company fiscal code |
| baseAmount | number | Base amount (excluding VAT) |
| vatRate | integer | VAT rate percentage |
| vatAmount | number | VAT amount |
| totalAmount | number | Total amount (including VAT) |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - no access to company |
| 422 | Invalid parameters - year and month required |
