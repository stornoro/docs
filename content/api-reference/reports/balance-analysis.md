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
  }
}
```

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
