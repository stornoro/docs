---
title: VAT Report
description: Monthly VAT summary by rate, and the quarterly OSS view of the VAT charged to EU consumers
---

# VAT Report

Two views of the VAT a company collects and deducts: the monthly summary by rate that backs the VAT return (D300), and the quarterly OSS (One Stop Shop) view of the VAT charged to consumers in other EU member states that backs the special VAT return (D398).

Both need the `REPORT_VIEW` permission and a plan that includes reports.

---

## Monthly VAT summary

```http
GET /api/v1/reports/vat
```

Issued (collected) and received (deductible) invoices of one calendar month, totalled and broken down by VAT rate from the invoice lines. Amounts are summed in the currency of each invoice; cancelled invoices are left out.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | Yes | Company UUID |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | integer | No | Report year (default: current year) |
| month | integer | No | Report month, 1–12 (default: current month) |

### Response

```json
{
  "period": "2026-09",
  "outgoing": {
    "21.00": { "taxableBase": "1250.00", "vatAmount": "262.50" },
    "9.00":  { "taxableBase": "0.00", "vatAmount": "0.00" },
    "5.00":  { "taxableBase": "0.00", "vatAmount": "0.00" },
    "0.00":  { "taxableBase": "3400.00", "vatAmount": "0.00" },
    "19.00": { "taxableBase": "151.28", "vatAmount": "28.72" }
  },
  "incoming": {
    "21.00": { "taxableBase": "933.63", "vatAmount": "196.04" },
    "9.00":  { "taxableBase": "0.00", "vatAmount": "0.00" },
    "5.00":  { "taxableBase": "0.00", "vatAmount": "0.00" },
    "0.00":  { "taxableBase": "0.00", "vatAmount": "0.00" }
  },
  "totals": {
    "outgoing": { "taxableBase": "4801.28", "vatAmount": "291.22", "total": "5092.50" },
    "incoming": { "taxableBase": "933.63", "vatAmount": "196.04", "total": "1129.67" }
  },
  "netVat": "95.18",
  "invoiceCount": { "outgoing": 61, "incoming": 6 }
}
```

| Field | Type | Description |
|-------|------|-------------|
| period | string | `YYYY-MM` |
| outgoing / incoming | object | One bucket per VAT rate (`"21.00"`, `"9.00"`, `"5.00"`, `"0.00"` always present, other rates added when used) with the taxable base and VAT of the lines at that rate |
| totals.outgoing / totals.incoming | object | Sum of the invoice subtotals, VAT and totals |
| netVat | string | Collected VAT minus deductible VAT |
| invoiceCount | object | Number of issued and received invoices in the month |

---

## Quarterly OSS VAT

```http
GET /api/v1/reports/vat/oss
```

The VAT charged to buyers who are not VAT registered (consumers) in EU member states other than Romania, at the rate of their state, grouped by state of consumption, VAT rate and invoice currency. Business buyers (reverse charge), domestic and non-EU sales are left out, as are drafts, cancelled, rejected and converted documents.

The amounts are converted to euro, the currency of the D398 return, at the ECB reference rate of the last day of the quarter or, when none was published that day, of the next publication day. While the quarter is still running the ECB has no such rate, so the euro amounts are `null` and the currencies concerned are listed in `exchange.missing`.

The payment block carries the due date (the last day of the month after the quarter), the unique reference that has to appear on the transfer (`RO/<VAT code>/Q<n>.<year>`) and the account ANAF collects the special VAT return into.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | integer | No | Year (default: current year) |
| quarter | integer | No | Quarter, 1–4 (default: current quarter) |

### Response

```json
{
  "period": "2026-Q3",
  "year": 2026,
  "quarter": 3,
  "from": "2026-07-01",
  "to": "2026-09-30",
  "ossEnabled": true,
  "currency": "EUR",
  "exchange": {
    "date": "2026-09-30",
    "rates": { "USD": { "eurPerUnit": "0.880669", "unitsPerEur": "1.1355" } },
    "missing": [],
    "source": "ECB"
  },
  "countries": [
    {
      "country": "DE",
      "rates": [
        { "vatRate": "19.00", "currency": "USD", "taxableBase": "340.38", "vatAmount": "64.62", "taxableBaseEur": "299.76", "vatAmountEur": "56.91" }
      ],
      "taxableBaseEur": "299.76",
      "vatAmountEur": "56.91",
      "invoiceCount": 9
    },
    {
      "country": "SE",
      "rates": [
        { "vatRate": "25.00", "currency": "USD", "taxableBase": "477.60", "vatAmount": "119.40", "taxableBaseEur": "420.61", "vatAmountEur": "105.15" }
      ],
      "taxableBaseEur": "420.61",
      "vatAmountEur": "105.15",
      "invoiceCount": 3
    }
  ],
  "totals": { "taxableBaseEur": "720.37", "vatAmountEur": "162.06", "invoiceCount": 12, "complete": true },
  "payment": {
    "iban": "RO30RNCB0090000695510027",
    "bic": "RNCBROBU",
    "bank": "Banca Comercială Română",
    "beneficiary": "Direcția Generală Regională a Finanțelor Publice București",
    "beneficiaryCif": "4193117",
    "currency": "EUR",
    "dueDate": "2026-10-31",
    "reference": "RO/RO12345678/Q3.2026"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| ossEnabled | boolean | Whether the company has the OSS scheme switched on in its settings; the report is computed either way |
| exchange.date | string \| null | The ECB publication day the rates come from |
| exchange.rates | object | Per invoice currency: euro per unit and units per euro |
| exchange.missing | string[] | Currencies with no ECB rate yet (quarter still running, or ECB unreachable) |
| countries[].country | string | State of consumption, EU VAT code (Greece is `EL`) |
| countries[].rates[] | array | One row per VAT rate and invoice currency, with the amounts in that currency and in euro |
| countries[].invoiceCount | integer | Invoices to consumers of that state with VAT |
| totals.complete | boolean | `false` when at least one bucket could not be converted; the euro totals are then `null` |
| payment.dueDate | string | Last day of the month after the quarter |
| payment.reference | string | Unique reference ANAF assigns to the return, mandatory on the transfer |

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Invalid `month`, `quarter` or `year` |
| 401 | Unauthorized – invalid authentication |
| 402 | Reports are not included in the plan (`code: PLAN_LIMIT`) |
| 403 | Forbidden – no `REPORT_VIEW` permission |
| 404 | Company not found |
