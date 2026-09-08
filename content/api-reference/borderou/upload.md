---
title: Import a bank statement or courier report
description: Upload CSV, XLSX, XLS or the original bank PDF; the bank is detected from the PDF and incoming payments are matched against invoices
method: POST
endpoint: /api/v1/borderou/upload
---

# Import a bank statement or courier report

```
POST /api/v1/borderou/upload
Content-Type: multipart/form-data
```

Needs the `borderou.manage` permission and the `X-Company` header.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | `.csv`, `.xlsx`, `.xls` or `.pdf` |
| `sourceType` | string | Yes | `bank_statement`, `borderou` (courier payment list) or `marketplace` |
| `provider` | string | Yes | Key from `GET /api/v1/borderou/providers` (`bt`, `bcr`, `ing`, `revolut`, `generic_bank`, `fan_courier`…) |
| `currency` | string | No | Default `RON` |
| `bordereauNumber` | string | No | Reference number kept on every transaction |
| `bankAccountId` | string | No | Bank account UUID; when given, the IBAN found in the file must match it |

## PDF statements

Upload the PDF exactly as the bank generated it (internet banking, George, BT24, Home'Bank…). Scanned or re-printed PDFs have no text layer and are rejected with `Formatul extrasului PDF nu a fost recunoscut`.

The bank is detected from the document itself, so `provider` may be `generic_bank`; if you pass a specific bank and the document belongs to another one, the upload fails with a bank-mismatch error. Recognised layouts:

| Provider key | Bank | Notes |
|---|---|---|
| `bt` | Banca Transilvania | BT24 / NeoBT statement, amounts `1,234.56` |
| `bcr` | Banca Comercială Română | George statement with per-day blocks, RO and EN variants |
| `brd` | BRD | classic Debit/Credit table and the bilingual 2023+ layout |
| `ing` | ING Bank | Home'Bank / ING Business, both layouts |
| `cec` | CEC Bank | branch statement, CEConline mobile (two variants) |
| `raiffeisen` | Raiffeisen Bank | Smart Business / Raiffeisen Online |
| `unicredit` | UniCredit Bank | BusinessNet, both layouts |
| `libra` | Libra Internet Bank | |
| `garanti` | Garanti BBVA | |
| `patria` | Patria Bank | |
| `citi` | Citibank Europe | CitiDirect account statement |
| `intesa` | Intesa Sanpaolo Bank | single- and multi-account statements |
| `vista` | Vista Bank | |
| `revolut` | Revolut / Revolut Business | one statement per currency section |
| `wise` | Wise | |
| `mypos` | myPOS | |
| `viva` | Viva.com (Viva Wallet) | account statement |
| `nexent` | Nexent Bank (ex Credit Europe) | |
| `trezorerie` | Trezoreria Statului | reads the XML attached to the PDF; falls back to the printed table |

Every parser recomputes the running balance and compares it with the printed closing balance. A difference does not block the import: it is returned in `warnings` and stored on the import job, so check it before saving the transactions.

Only incoming money (credits) becomes borderou transactions, because the purpose of the import is to match payments to issued invoices. `summary.rowsInFile` tells you how many rows the file contained.

## Response

```json
{
  "importJobId": "01a06e2f-…",
  "summary": {
    "total": 3,
    "certain": 2,
    "attention": 1,
    "noMatch": 0,
    "totalAmount": "4520.00",
    "duplicatesSkipped": 0,
    "rowsInFile": 14,
    "rowsParsed": 3
  },
  "transactions": [ { "id": "…", "transactionDate": "2026-07-06", "amount": "1200.50", "clientName": "CLIENT TEST SRL", "bankReference": "2026070691839650", "matchConfidence": "certain", "…": "…" } ],
  "warnings": [],
  "detectedBank": "Banca Comerciala Romana"
}
```

Errors are returned as `422 { "error": "…" }`: unsupported extension, unrecognised PDF layout, password-protected PDF, IBAN or bank mismatch.

## Providers

```
GET /api/v1/borderou/providers
```

Returns the provider keys grouped by `sourceType`, each with the file formats it accepts (`csv`, `xlsx`, `xls`, `pdf`).

## Debugging a PDF

On the server, `php bin/console app:borderou:pdf-inspect statement.pdf --mask` prints the detected bank, IBAN, balances and every parsed row, plus the balance check, without touching the database.
