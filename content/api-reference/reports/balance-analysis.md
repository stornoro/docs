# Balance Analysis API

Upload monthly trial balance PDFs (Balanta de verificare) and analyze financial indicators.

## Endpoints

### Upload Balance

```
POST /api/v1/balances/upload
```

Upload one or more trial balance PDFs. Supports **multi-file upload**. Year, month, and company CUI are **auto-detected** from each PDF. If a balance already exists for the same company/year/month, it is replaced. Duplicate files (same content hash) are rejected.

The CUI detected from each PDF is validated against the selected company.

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `files[]` | file[] | Yes* | One or more PDF files (max 10MB each) |
| `file` | file | Yes* | Single PDF file (backwards compatible) |

\* Provide either `files[]` or `file`.

**Response:** `201 Created`

```json
{
  "results": [
    {
      "filename": "balanta-iunie-2025.pdf",
      "success": true,
      "id": "0192d3e4-...",
      "year": 2025,
      "month": 6,
      "status": "pending"
    },
    {
      "filename": "balanta-iulie-2025.pdf",
      "success": false,
      "error": "This file has already been uploaded.",
      "code": "DUPLICATE_FILE"
    }
  ]
}
```

**Per-file error codes:**

| Code | Description |
|------|-------------|
| `DUPLICATE_FILE` | File with same content hash already uploaded |
| `CUI_MISMATCH` | PDF CUI doesn't match selected company |
| `INVALID_TYPE` | File is not a PDF |
| `FILE_TOO_LARGE` | File exceeds 10MB |
| `PARSE_ERROR` | Failed to parse PDF content |
| `NO_YEAR` | Could not detect year from PDF |
| `NO_MONTH` | Could not detect month from PDF |

Row parsing is processed asynchronously in the background. Status transitions: `pending` -> `processing` -> `completed` | `failed`.

---

### List Balances

```
GET /api/v1/balances?year=2025
```

List all uploaded balances for a company and year.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `year` | integer | current year | Filter by year |

**Response:** `200 OK`

```json
[
  {
    "id": "0192d3e4-...",
    "year": 2025,
    "month": 1,
    "status": "completed",
    "totalAccounts": 85,
    "originalFilename": "balanta-ian-2025.pdf",
    "sourceSoftware": "SAGA",
    "error": null,
    "processedAt": "2025-02-01T10:05:00+00:00",
    "createdAt": "2025-02-01T10:00:00+00:00"
  }
]
```

---

### Get Balance

```
GET /api/v1/balances/{id}
```

Get details of a single balance.

**Response:** `200 OK` (same structure as list item)

---

### Get Balance Rows

```
GET /api/v1/balances/{id}/rows
```

Get the parsed account rows for a balance. Useful for debugging and verifying PDF parsing results.

**Response:** `200 OK`

```json
[
  {
    "accountCode": "411",
    "accountName": "Clienti",
    "initialDebit": "5000.00",
    "initialCredit": "0.00",
    "previousDebit": "12000.00",
    "previousCredit": "8000.00",
    "currentDebit": "3000.00",
    "currentCredit": "2000.00",
    "totalDebit": "15000.00",
    "totalCredit": "10000.00",
    "finalDebit": "10000.00",
    "finalCredit": "5000.00"
  }
]
```

---

### Delete Balance

```
DELETE /api/v1/balances/{id}
```

Soft-delete a balance and its parsed rows.

**Response:** `204 No Content`

---

### Reprocess Balance

```
POST /api/v1/balances/{id}/reprocess
```

Re-parse a balance PDF. Useful after parser improvements to re-extract data from previously uploaded files.

**Response:** `200 OK`

```json
{
  "message": "Reprocessing started",
  "id": "0192d3e4-...",
  "status": "pending"
}
```

---

### Balance Analysis

```
GET /api/v1/balances/analysis?year=2025
```

Compute financial analysis from all completed balances for a year.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `year` | integer | current year | Analysis year |

**Response:** `200 OK`

```json
{
  "year": 2025,
  "balances": [
    {
      "id": "...",
      "month": 1,
      "status": "completed",
      "totalAccounts": 85,
      "originalFilename": "balanta-ian.pdf",
      "processedAt": "...",
      "uploadedAt": "..."
    }
  ],
  "indicators": {
    "revenue": "850000.00",
    "expenses": "720000.00",
    "netProfit": "130000.00",
    "turnover": "800000.00",
    "salaries": "280000.00",
    "profitTax": "20800.00",
    "supplierDebts": "45000.00",
    "clientReceivables": "120000.00",
    "bankBalance": "95000.00",
    "cashBalance": "5200.00"
  },
  "monthlyEvolution": [
    { "month": 1, "revenue": "70000.00", "expenses": "60000.00", "profit": "10000.00" },
    { "month": 2, "revenue": "75000.00", "expenses": "62000.00", "profit": "13000.00" }
  ],
  "profitability": {
    "profitMargin": 15.3,
    "expenseRatio": 84.7,
    "salaryRatio": 32.9
  },
  "topExpenses": [
    { "accountCode": "641", "accountName": "Cheltuieli cu salariile", "amount": "280000.00", "percentage": 38.9 },
    { "accountCode": "612", "accountName": "Cheltuieli cu chiriile", "amount": "96000.00", "percentage": 13.3 }
  ],
  "yoyComparison": {
    "currentYear": 2025,
    "previousYear": 2024,
    "current": { "revenue": "850000.00", "expenses": "720000.00", "profit": "130000.00" },
    "previous": { "revenue": "780000.00", "expenses": "680000.00", "profit": "100000.00" },
    "changes": { "revenue": 8.97, "expenses": 5.88, "profit": 30.0 }
  },
  "balanceSheet": {
    "hasData": true,
    "currentAssets": "220200.00", "fixedAssets": "180000.00", "totalAssets": "400200.00",
    "inventory": "32000.00", "receivables": "120000.00",
    "cash": "5200.00", "bank": "95000.00", "securities": "0.00",
    "currentLiabilities": "98500.00", "longTermDebt": "60000.00", "totalLiabilities": "158500.00",
    "supplierDebts": "45000.00", "salaryDebts": "18000.00", "taxDebts": "22000.00",
    "vatPayable": "8500.00", "shortTermDebt": "13500.00",
    "equity": "241700.00", "depreciation": "12000.00", "interestExpense": "3400.00",
    "cogs": "320000.00", "servicesExpense": "85000.00"
  },
  "liquidity": {
    "hasData": true,
    "currentRatio":            { "value": 2.24, "status": "normal" },
    "quickRatio":              { "value": 1.91, "status": "normal" },
    "cashRatio":               { "value": 1.02, "status": "normal" },
    "workingCapital":          { "value": "121700.00", "status": "normal" },
    "workingCapitalLongTerm":  { "value": "121700.00", "status": "normal" },
    "workingCapitalRequirement": { "value": "67000.00", "status": "normal" },
    "netCash":                 { "value": "54700.00", "status": "normal" }
  },
  "solvency": {
    "hasData": true,
    "debtToEquity":      { "value": 0.66, "status": "normal" },
    "financialAutonomy": { "value": 60.4, "status": "normal" },
    "debtRatio":         { "value": 39.6, "status": "normal" },
    "generalSolvency":   { "value": 2.52, "status": "normal" },
    "interestCoverage":  { "value": 45.6, "status": "normal" }
  },
  "profitabilityRatios": {
    "hasData": true,
    "grossMargin":        { "value": 49.4, "status": "normal" },
    "operatingMargin":    { "value": 18.7, "status": "normal" },
    "ebitdaMargin":       { "value": 20.2, "status": "normal" },
    "netMargin":          { "value": 15.3, "status": "normal" },
    "returnOnAssets":     { "value": 32.5, "status": "normal" },
    "returnOnEquity":     { "value": 53.8, "status": "normal" },
    "returnOnCapitalEmployed": { "value": 52.9, "status": "normal" },
    "ebit": "154200.00",
    "ebitda": "166200.00"
  },
  "efficiency": {
    "hasData": true,
    "assetTurnover":         { "value": 2.12, "status": "normal" },
    "fixedAssetTurnover":    { "value": 4.72, "status": "normal" },
    "inventoryTurnover":     { "value": 10.0, "status": "normal" },
    "inventoryDays":         { "value": 37, "status": "normal" },
    "dso":                   { "value": 51, "status": "normal" },
    "dpo":                   { "value": 41, "status": "warning" },
    "cashConversionCycle":   { "value": 47, "status": "normal" }
  },
  "fiscal": {
    "hasData": true,
    "vatPayable":     { "value": "8500.00",  "status": "warning" },
    "salaryDebts":    { "value": "18000.00", "status": "warning" },
    "stateTaxDebts":  { "value": "22000.00", "status": "warning" },
    "microThreshold": {
      "isMicro": false,
      "plafonEur": 250000,
      "plafonRon": "1250000.00",
      "revenueEur": "170000.00",
      "usagePercent": 68.0,
      "status": "normal"
    },
    "vatThreshold": {
      "isVatPayer": true,
      "plafonRon": "300000.00",
      "usagePercent": 283.3,
      "status": "na"
    }
  },
  "cashflow": {
    "hasData": true,
    "cashRunwayMonths":  { "value": 1.39, "status": "critical" },
    "monthlyBurnRate":   { "value": "10833.33", "status": "normal" },
    "breakEvenRevenue":  { "value": "204000.00", "status": "normal" },
    "breakEvenMonths":   { "value": 2.9, "status": "normal" },
    "contributionRatePercent": 52.4,
    "operatingLeverage": { "value": 2.43, "status": "normal" }
  },
  "aging": {
    "buckets": [
      { "range": "0-30",  "amount": "82000.00" },
      { "range": "31-60", "amount": "25000.00" },
      { "range": "61-90", "amount": "8000.00"  },
      { "range": "90+",   "amount": "5000.00"  }
    ],
    "totalUnpaid": "120000.00",
    "totalCount": 18,
    "countOver90": 2,
    "percentOver90": 4.2,
    "overdueStatus": "normal",
    "estimatedProvision": "1900.00"
  },
  "concentration": {
    "top5SharePercent": 62.4,
    "top10SharePercent": 81.7,
    "top5Status": "warning",
    "topClients": [
      { "name": "SC EXEMPLE SRL", "revenue": "180000.00", "percent": 21.2 },
      { "name": "ALT CLIENT SRL", "revenue": "120000.00", "percent": 14.1 }
    ],
    "totalRevenue": "850000.00"
  }
}
```

## Grouped Ratios

The response also includes 8 grouped indicator sections. Each ratio is `{ value: number | null, status: 'normal' | 'warning' | 'critical' | 'na' }`. Each amount is `{ value: string | null, status }`. Sub-objects backed by the trial balance carry `hasData: false` until at least one balance is uploaded; aging/concentration are sourced from invoice data and therefore always populated.

| Section | Fields | Computed from |
|---------|--------|---------------|
| `liquidity` | `currentRatio`, `quickRatio`, `cashRatio`, `workingCapital`, `workingCapitalLongTerm`, `workingCapitalRequirement`, `netCash` | Trial balance — active circulante / datorii curente |
| `solvency` | `debtToEquity`, `financialAutonomy`, `debtRatio`, `generalSolvency`, `interestCoverage` | Trial balance — capitaluri proprii, datorii, EBIT |
| `profitabilityRatios` | `grossMargin`, `operatingMargin`, `ebitdaMargin`, `netMargin`, `returnOnAssets`, `returnOnEquity`, `returnOnCapitalEmployed`, plus `ebit` / `ebitda` raw amounts | Trial balance — CA, costuri, profit |
| `efficiency` | `assetTurnover`, `fixedAssetTurnover`, `inventoryTurnover`, `inventoryDays`, `dso`, `dpo`, `cashConversionCycle` | Trial balance — annualised |
| `fiscal` | `vatPayable`, `salaryDebts`, `stateTaxDebts`, `microThreshold` (`isMicro`, `plafonEur`, `plafonRon`, `revenueEur`, `usagePercent`, `status`), `vatThreshold` (`isVatPayer`, `plafonRon`, `usagePercent`, `status`) | Trial balance + Company.vatPayer + EUR/RON rate from `ExchangeRateService` |
| `cashflow` | `cashRunwayMonths`, `monthlyBurnRate`, `breakEvenRevenue`, `breakEvenMonths`, `contributionRatePercent`, `operatingLeverage` | Trial balance + monthly evolution |
| `aging` | `buckets[]` (`0-30`, `31-60`, `61-90`, `90+`), `totalUnpaid`, `totalCount`, `countOver90`, `percentOver90`, `overdueStatus`, `estimatedProvision` | `invoice` table — outgoing, unpaid, non-cancelled |
| `concentration` | `top5SharePercent`, `top10SharePercent`, `top5Status`, `topClients[]`, `totalRevenue` | `invoice` table — outgoing, current year |

Romanian thresholds are configured at the top of `BalanceAnalysisService` (`MICRO_THRESHOLD_EUR = 250000`, `VAT_THRESHOLD_RON = 300000`, `SAFE_RUNWAY_MONTHS = 6`).

## Indicator Computation

Indicators are computed from the **latest month's** trial balance rows using the Romanian chart of accounts.

**P&L accounts (classes 6-7)** use **cumulative turnover columns** (`currentDebit`/`currentCredit`) instead of final balance columns. This handles Romanian trial balances where monthly closing entries make `finalDebit == finalCredit` for P&L accounts, and year-end closings zero out final balances entirely.

**Balance sheet accounts (classes 1-5)** use `GREATEST(finalDebit, finalCredit)` to handle potential column order inconsistencies from PDF text extraction.

| Indicator | Account Code Pattern | Column Used |
|-----------|---------------------|-------------|
| Revenue | `7%` | SUM(currentCredit) |
| Expenses | `6%` | SUM(currentDebit) |
| Net Profit | - | Revenue - Expenses |
| Turnover | `70%`, `71%` | SUM(currentCredit) |
| Salaries | `641%`, `642%` | SUM(currentDebit) |
| Profit Tax | `691%` | SUM(currentDebit) |
| Supplier Debts | `401%` | SUM(GREATEST(finalCredit, finalDebit)) |
| Client Receivables | `411%` | SUM(GREATEST(finalDebit, finalCredit)) |
| Bank Balance | `5121%` | SUM(GREATEST(finalDebit, finalCredit)) |
| Cash Balance | `5311%` | SUM(GREATEST(finalDebit, finalCredit)) |

## Permissions

All endpoints require `REPORT_VIEW` permission and the `canViewReports()` license check.

## PDF Parsing

Supported accounting software exports: SAGA C, Ciel, FGO, WinMentor, Nexus, Charme, ASiS.

The parser extracts:
- Period (year/month) from header
- Company CUI (validated against selected company)
- Source software detection
- Account rows with 10 numeric columns (initial D/C, previous D/C, current D/C, total D/C, final D/C)

Number format support:
- Romanian: `1.234.567,89` (dots as thousands, comma as decimal)
- Space-separated: `1 101 657.93` (spaces as thousands, dot as decimal)
- Standard: `1234.56`
- Standalone dashes (`-`, `–`, `—`) are treated as zero values
