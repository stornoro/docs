---
title: Fiscal calendar
description: The filing deadlines a company has to meet, derived from its profile and invoices, with weekend and holiday shifting, filed / overdue status and reminders 7, 3 and 1 days ahead
method: GET
endpoint: /api/v1/fiscal-calendar
---

# Fiscal calendar

The fiscal calendar lists the declarations a company has to file and when, without anyone typing the dates in. Each deadline is derived from the company's profile — `vatPayer`, `vatPeriod` (monthly / quarterly), `incomeTaxPeriod`, `hasEmployees`, person or company (see [Update company](/api-reference/companies/update)) — and from its invoices: a month with an EU counterparty adds D390, a non-VAT payer with invoices from foreign suppliers gets D301.

A deadline that falls on a Saturday, a Sunday or a Romanian legal holiday moves to the next working day (Codul de procedură fiscală art. 75). The legal holidays are the fixed ones (1–2 and 6–7 January, 24 January, 1 May, 1 June, 15 August, 30 November, 1 December, 25–26 December) and the ones set by the Orthodox Easter (Good Friday, Easter Monday, Rusalii).

| Code | Applies when | Nominal due date |
|---|---|---|
| `D300` | VAT payer | 25th of the month after the period (monthly or quarterly per `vatPeriod`) |
| `D390` | VAT payer with intra-community operations in the month (an invoice with a client or supplier established in another EU state) | 25th of the next month |
| `D394` | VAT payer | 30th of the month after the period |
| `D301` | non-VAT payer with invoices from suppliers outside Romania in the month | 25th of the next month |
| `D100` | company, per `incomeTaxPeriod` (quarterly by default) | 25th of the month after the period |
| `D112` | `hasEmployees` | 25th of the next month |
| `D406` (SAF-T) | company; follows `vatPeriod`, quarterly without VAT registration | last day of the month after the period |
| `D212` | individual (persoană fizică) | 25 May for the previous year |
| `BILANT` (annual financial statements) | company | last working day of May for the previous year |

Not listed here because they are covered elsewhere: the 5-day e-Factura submission window of issued invoices (`invoice.anaf_deadline`) and the expiry of ANAF tokens and certificates (`token.expiring_soon`).

## Status

- `filed` — a declaration of that type with status `submitted`, `processing` or `accepted` exists for the period (any month of the quarter for a quarterly period, the year alone for an annual one);
- `overdue` — the due date has passed and nothing was filed;
- `due` — otherwise.

Deadlines already past are kept for 31 days so an unfiled one shows as overdue.

## Reminders

The `fiscal.deadline` notification is sent to every member of the company 7, 3 and 1 days before a deadline that is still `due` (once per user, deadline and day), with `data.code`, `data.dueDate`, `data.declarationType`, `data.period` and `data.companyId`. It is on by default for e-mail, in-app and push; see [Notification preferences](/api-reference/notification-preferences/overview).

## Get the calendar of a company

```http
GET /api/v1/fiscal-calendar?from=2026-10-01&days=60
```

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token |
| X-Company | string | Yes | Company UUID |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| from | string | No | Start date `YYYY-MM-DD` (default today) |
| days | integer | No | Window length in days, 1–366 (default 60) |

### Response

```json
{
  "data": [
    {
      "code": "D300",
      "label": "Decont de TVA",
      "dueDate": "2026-10-26",
      "nominalDueDate": "2026-10-25",
      "daysLeft": 25,
      "period": { "year": 2026, "month": 9, "from": "2026-09-01", "to": "2026-09-30" },
      "appliesBecause": "vat_payer",
      "declarationType": "d300",
      "status": "due"
    },
    {
      "code": "D100",
      "label": "Obligații de plată la bugetul de stat",
      "dueDate": "2026-10-26",
      "nominalDueDate": "2026-10-25",
      "daysLeft": 25,
      "period": { "year": 2026, "quarter": 3, "from": "2026-07-01", "to": "2026-09-30" },
      "appliesBecause": "income_tax",
      "declarationType": "d100",
      "status": "filed"
    },
    {
      "code": "D406",
      "label": "SAF-T",
      "dueDate": "2026-11-02",
      "nominalDueDate": "2026-10-31",
      "daysLeft": 32,
      "period": { "year": 2026, "month": 9, "from": "2026-09-01", "to": "2026-09-30" },
      "appliesBecause": "saft",
      "declarationType": null,
      "status": "due"
    }
  ],
  "from": "2026-10-01",
  "days": 60,
  "company": { "id": "uuid", "name": "Firma Exemplu SRL", "cif": 12345678, "isIndividual": false },
  "counts": { "due": 5, "overdue": 0, "filed": 1 }
}
```

`nominalDueDate` is the legal date; `dueDate` is the working day it moved to. `appliesBecause` is one of `vat_payer`, `intra_community_operations`, `non_vat_payer_foreign_suppliers`, `income_tax`, `employees`, `saft`, `individual`, `company`. `declarationType` is the value [Create declaration](/api-reference/declarations/create) expects; it is `null` for SAF-T and the annual financial statements, which are filed outside Storno.

### Error Codes

| Status | Description |
|--------|-------------|
| 400 | `from` is not a date or `days` is outside 1–366 |
| 403 | The caller lacks `declaration.view` |
| 404 | The company is missing or not in the caller's organization |

## Get the calendar of every company

```http
GET /api/v1/fiscal-calendar/all?from=2026-10-01&days=60
```

The same items across every company the caller can see (all companies of the organization for owners and admins, the allowed ones otherwise), ordered by due date, each carrying `company: { id, name, cif, isIndividual }`. `companies` lists every company with its own `counts`. No `X-Company` header is needed.

```json
{
  "data": [
    { "code": "D300", "dueDate": "2026-10-26", "status": "due", "company": { "id": "uuid", "name": "Firma Exemplu SRL", "cif": 12345678, "isIndividual": false }, "...": "..." }
  ],
  "companies": [
    { "id": "uuid", "name": "Firma Exemplu SRL", "cif": 12345678, "isIndividual": false, "counts": { "due": 5, "overdue": 0, "filed": 1 } }
  ],
  "from": "2026-10-01",
  "days": 60,
  "counts": { "due": 9, "overdue": 1, "filed": 2 }
}
```

## MCP

`fiscal_calendar` (storno-cli) with `from`, `days`, `allCompanies` and `companyId`; see [TOOLS.md](https://github.com/stornoro/storno-cli/blob/main/TOOLS.md#fiscal-calendar).
