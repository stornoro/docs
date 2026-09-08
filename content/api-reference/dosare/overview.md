---
title: Dosare (case files)
description: Group declarations, SPV requests and ANAF messages around a rental contract, a year's Declarația unică or the company's fiscal standing, with deadlines, the portfolio view and documents generated from the case file
method: GET
endpoint: /api/v1/dosare
---

# Dosare

A *dosar* is the real-world object a person deals with ANAF about: a rental contract, one filing year of the Declarația unică, the periodic VAT returns, the company's fiscal standing. It groups the declarations filed for it, the SPV requests, the ANAF messages the inbox sync links to them, the next step and the deadline. Declarations, requests and messages keep existing on their own; a dosar only groups them, and deleting it ungroups them.

| Type | Subject fields | Deadline set automatically |
|---|---|---|
| `rental_contract` | `numar`, `data`, `adresa`, `chirias`, `chiriasCif`, `chirie`, `moneda`, `deLa`, `panaLa`, `dataIncetare?`, `dataModificare?` | C168: 30 days from the contract date, the addendum or the termination |
| `annual_return` | `an` (filing year) | D212: 25 May of the filing year |
| `periodic`, `fiscal_status`, `generic` | free | none (set `deadlineAt` + `deadlineLabel` yourself) |

## Automatic linking

The SPV inbox sync links every new message to what it answers:

- a **RECIPISA** carries `INTERNT-<index>-<year>`; the declaration with that upload index receives the recipisa in its dosar and records when it arrived (`metadata.recipisaAt`);
- a **RASPUNS SOLICITARE** carries `id_solicitare`; the request it answers (already linked by the sync) passes its dosar to the message.

Attaching a declaration to a dosar later brings its archived recipisas along; attaching a request brings its answer.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/dosare?type=&status=` | list with per-dosar counts (declarations, requests, documents) |
| `GET` | `/api/v1/dosare/actions` | `todo`, `inProgress`, `answers` (see below) |
| `GET` | `/api/v1/dosare/stats` | rental portfolio (see below) |
| `POST` | `/api/v1/dosare` | create; `title` is derived from the subject when omitted |
| `POST` | `/api/v1/dosare/annual-return` | ensure the `Declarația unică <an>` dosar (`{"an": 2026}`; default: the year whose 25 May is next) |
| `GET` | `/api/v1/dosare/{id}` | `dosar`, `counts`, `declarations[]`, `requests[]`, `documents[]`, `timeline[]` |
| `PATCH` | `/api/v1/dosare/{id}` | `title`, `subject` (merged), `status` (`active`, `attention`, `closed`), `nextStep`, `deadlineAt`, `deadlineLabel`, `notes` |
| `DELETE` | `/api/v1/dosare/{id}` | delete; children are unlinked |
| `POST` | `/api/v1/dosare/{id}/attach` / `/detach` | `{declarationId}` or `{requestId}` or `{documentId}` |
| `GET` | `/api/v1/dosare/{id}/d212-prefill` | D212 rent-scenario input built from the rental dosare for the income year |
| `POST` | `/api/v1/dosare/{id}/d212` | create the D212 draft in the dosar (`{input}` optional, else the prefill) |
| `GET` / `POST` | `/api/v1/dosare/{id}/document/{type}` | prefilled fields, then the PDF: `conventie_incetare_inchiriere`, `declaratie_incetare_contract` (`?format=pdf` streams it) |

Permissions: reading needs `declaration.view`, writing `declaration.submit`. All routes take the company from `X-Company`.

## Actions feed

```json
{
  "todo": [
    { "kind": "deadline", "id": "…", "title": "Contract de închiriere Bld. Iuliu Maniu 7", "subtitle": "C168 înregistrare: 30 de zile de la semnarea contractului — în 10 zile", "dosarId": "…", "dosarTitle": "…", "date": "2026-09-18T00:00:00+00:00", "severity": "high" },
    { "kind": "declaration", "id": "…", "title": "C168 2026 — respinsă", "subtitle": "R_MULTI_C168: …", "severity": "high" },
    { "kind": "expiry", "id": "…", "title": "Garsonieră Cluj", "subtitle": "Contractul expiră în 45 zile: prelungire sau încetare?", "severity": "normal" }
  ],
  "inProgress": [ { "kind": "declaration", "title": "D300 07.2026", "subtitle": "În prelucrare la ANAF · index 1216…" } ],
  "answers": [ { "kind": "document", "title": "RECIPISA", "subtitle": "…" } ]
}
```

`todo` holds rejected or errored filings with the reason, requests in error, dosare in status `attention`, deadlines within 14 days (or passed), rental contracts expiring within 60 days, and unread somații, decizii and risk reports. `inProgress` holds filings ANAF is processing and requests without an answer (flagged after 3 days). `answers` holds recipisas, answers, certificates and registry extracts of the last 14 days.

## Rental portfolio

`GET /api/v1/dosare/stats` returns every property (`properties[]`: address, tenant, rent, currency, period, `active`, `expiresInDays`, linked declarations), `activeContracts`, `expiringWithin60Days`, `monthlyRent` by currency, `expectedGrossByYear` (rent × months from the contract terms, per income year and currency) and `declaredByIncomeYear` (the gross rent the D212s declared per income year with the declaration status). A year with expected rent and no D212 is what the assistant or the dashboard should point at.

## Declarația unică from the contracts

`POST /api/v1/dosare/annual-return` creates the `Declarația unică <an>` dosar with the 25 May deadline; the daily job `app:dosare:remind` does it automatically for every company that has rental-contract dosare and sends deadline reminders 30, 7 and 1 days before and on the day (`dosar.deadline` notifications, per the user's notification preferences).

`GET …/d212-prefill` builds the [D212 rent-scenario input](/api-reference/public/declaration-forms) from the rental dosare: one entry per contract active in the income year, period clipped to the year, gross rent = monthly rent × months for RON contracts. Rents in other currencies come back as `0` with a note: they must be converted at the BNR rate of each payment. `POST …/d212` creates the D212 draft in the dosar (type `d212`, `data.input`), which then follows the normal declaration flow: validate (ANAF DUKIntegrator), prepare (PDF), sign and file through the [Storno Agent](/agent), recipisa linked back into the dosar.

## Documents from a dosar

`GET /api/v1/dosare/{id}/document/conventie_incetare_inchiriere` returns the fields of the [legal document generator](/api-reference/public/legal-documents) prefilled from the dosar and the company (landlord, tenant, contract, property, termination date) plus the `required` list; `POST` with the reviewed fields as overrides renders the PDF. The same for `declaratie_incetare_contract`, the landlord's sworn statement attached to a C168 termination. Generating either sets the dosar's next step to signing and filing the C168 termination within 30 days.

## C168 filed from Storno

Declarations of type `c168` can be created like any other (`POST /api/v1/declarations` with `type: "c168"`, `year`, `month: 12`) and take the [C168 form input](/api-reference/public/declaration-forms) in `data.input` plus the scanned contract or termination document in `data.attachments[]` (`{name, contentBase64}`); the prepare step validates, builds the zip and the PDF, and the agent files it. One C168 per landlord and period can be in processing at a time.
