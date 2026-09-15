---
title: Numbering decision (decizia de numerotare)
description: The yearly internal decision listing, per document type, the series and the number range allocated for the year, as JSON or a print-ready PDF.
---

# Numbering decision (decizia de numerotare)

Romanian companies must hold a yearly internal decision that names the person responsible for allocating document numbers and lists, for every document type (facturi, chitanțe, avize, proforme, bonuri…), the series and the number range allocated for the year (OMFP 2634/2015, Anexa nr. 1 — Norme generale de întocmire și utilizare a documentelor financiar-contabile; before 2016, OMEF 2226/2006). Storno builds the decision from the company's [document series](/api-reference/document-series/list) and renders it as a print-ready PDF.

Rules:

- One row per series. Inactive series are listed only when they issued numbers in that year.
- **First number** = the first number actually issued from the series in that year (invoices, proformas, delivery notes and receipts; drafts and deleted documents ignored). When nothing was issued yet, the next free number (`currentNumber + 1`).
- **Last number** = `firstNumber + rangeSize − 1`, extended to the highest number already issued in the year when that is larger.
- Format = the series prefix followed by the number padded to at least four digits, exactly as issued documents carry it (`FAC0001`).
- The **responsible person** defaults to the company representative; the decision date defaults to 1 January of the year; the decision number defaults to 1.
- The legal basis follows the year: OMFP 2634/2015 for 2016 onwards, OMEF 2226/2006 before.

Both endpoints are company-scoped (`X-Company`) and require the `series.view` permission.

## Get the decision as JSON

```http
GET /api/v1/document-series/numbering-decision?year=2026
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | integer | No | Year of the decision, 2000–2100; default the current year |
| `decisionNumber` | integer | No | Decision number; default `1` |
| `decisionDate` | string | No | `YYYY-MM-DD`; default 1 January of `year` |
| `responsible` | string | No | Person responsible for numbering (max 200 characters); default the company representative |
| `rangeSize` | integer | No | Numbers allocated per series, 1–9 999 999; default `9999` |

### Response

```json
{
  "year": 2026,
  "decisionNumber": 1,
  "decisionDate": "2026-01-01",
  "legalBasis": {
    "code": "OMFP 2634/2015",
    "title": "Ordinul ministrului finanțelor publice nr. 2634/2015 privind documentele financiar-contabile",
    "text": "În temeiul Legii contabilității nr. 82/1991, republicată, …"
  },
  "company": {
    "id": "c1b2…",
    "name": "Firma Exemplu SRL",
    "cif": "12345678",
    "vatCode": "RO12345678",
    "registrationNumber": "J40/1234/2020",
    "address": "Str. Exemplu nr. 1, București",
    "representative": "Nume Prenume",
    "representativeRole": "Administrator"
  },
  "responsible": "Nume Prenume",
  "rangeSize": 9999,
  "rows": [
    {
      "seriesId": "9f4a…",
      "type": "invoice",
      "typeLabel": "Factură",
      "prefix": "FAC",
      "firstNumber": 201,
      "lastNumber": 10199,
      "firstFormatted": "FAC0201",
      "lastFormatted": "FAC10199",
      "formatExample": "FAC0201",
      "issuedCount": 12,
      "isDefault": true,
      "active": true
    },
    {
      "seriesId": "9f4b…",
      "type": "receipt",
      "typeLabel": "Chitanță",
      "prefix": "CH",
      "firstNumber": 1,
      "lastNumber": 9999,
      "firstFormatted": "CH0001",
      "lastFormatted": "CH9999",
      "formatExample": "CH0001",
      "issuedCount": 0,
      "isDefault": false,
      "active": true
    }
  ],
  "warnings": [
    { "code": "NO_REGISTRATION_NUMBER", "message": "Numărul de înregistrare la Registrul Comerțului lipsește din datele companiei." }
  ]
}
```

Rows are ordered by document type (invoice, credit note, proforma, delivery note, receipt, voucher), default series first, then by prefix.

`warnings` lists missing prerequisites: `NO_SERIES` (no active series), `NO_RESPONSIBLE` (no representative set and no `responsible` given), `NO_REGISTRATION_NUMBER`.

## Download the PDF

```http
GET /api/v1/document-series/numbering-decision.pdf?year=2026&decisionNumber=1&decisionDate=2026-01-01&responsible=Nume%20Prenume&rangeSize=9999
```

Same parameters as the JSON endpoint, plus `download` (`true` by default; `false` serves the file inline). Returns `application/pdf`, file name `decizie-numerotare-{year}-nr-{decisionNumber}.pdf`.

The PDF (A4, Romanian) contains the company letterhead, the title "DECIZIA nr. … din …", the preamble naming the representative and the legal basis, the articles (numbering rule and the series table with first/last number and format, the responsible person, the non-carry-over of unused numbers, the communication of the decision) and the signature block for the representative and the responsible person.

```bash
curl 'https://api.storno.ro/api/v1/document-series/numbering-decision.pdf?year=2026' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -o decizie-numerotare-2026.pdf
```

## Errors

| Status | Description |
|--------|-------------|
| 400 | Invalid `year`, `decisionNumber`, `decisionDate`, `responsible` or `rangeSize` |
| 401 | Missing or invalid token |
| 403 | Missing `series.view` permission |
| 404 | Company not found or not owned by the caller's organization |
| 500 | PDF rendering failed |

## MCP

`document_series_numbering_decision` returns the JSON, or writes the PDF when `outFile` is given.

## Related

- [List document series](/api-reference/document-series/list)
- [Series and numbering](/concepts/series-numbering)
