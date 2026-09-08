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
| `GET` / `POST` | `/api/v1/dosare/{id}/document/{type}` | prefilled fields, then the PDF: `conventie_incetare_inchiriere`, `declaratie_incetare_contract`, `act_aditional_inchiriere`, `notificare_incetare_inchiriere` (`?format=pdf` streams it) |
| `POST` | `/api/v1/dosare/{id}/files` | multipart `file` + `kind` (`contract`, `act_aditional`, `incetare`, `declaratie`, `altele`); PDF, JPG, PNG, TIFF, 10 MB |
| `GET` / `DELETE` | `/api/v1/dosare/{id}/files/{fileId}/download`, `/api/v1/dosare/{id}/files/{fileId}` | download or remove a file |
| `GET` | `/api/v1/dosare/{id}/c168-prefill?actiune=` | the C168 input built from the dosar and the company, with the rule issues and the files available as attachment |
| `POST` | `/api/v1/dosare/{id}/c168` | `{actiune, input, fileIds[], attachments[]}` → the C168 declaration in the dosar (422 with `issues` when the rules fail, `ATTACHMENT_REQUIRED` without a file) |
| `GET` | `/api/v1/dosare/stats?format=csv` | the portfolio as CSV |
| `GET` | `/api/v1/dosare/{id}/billing` | the tenant's invoices: recurring invoice, issued invoices with payment state, received invoices, compensation balance |
| `GET` / `POST` | `/api/v1/dosare/registry-proposals` | contracts in ANAF's registry extract (newest one in the SPV inbox, `?documentId=`, or multipart `file`) with state and the matching dosar |
| `POST` | `/api/v1/dosare/registry-import` | `{contracts: [...]}` from the proposals → rental dosare (terminated → closed, expired without termination → attention) |

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

## Billing with the tenant

`GET /api/v1/dosare/{id}/billing` matches the tenant's CUI/CNP (`subject.chiriasCif`) against the company's clients and suppliers and returns: `recurring[]` (the recurring invoice: total, frequency, day, next issuance, last invoice), `issued[]` (invoices issued to the tenant, each with `paymentState` paid / partial / unpaid / overdue and `daysOverdue`), `totals` per currency (invoiced, paid, unpaid, overdue), `received[]` (invoices the tenant issued to the landlord, for example works) and, when the subject carries an `investitie` clause (`estimata`, `plafon`, `moneda`, `compensareDeLa`), a `compensation` block with the works invoiced by the tenant against the rent invoiced since the compensation started. Company landlords see "expected vs invoiced" in the portfolio (`invoicedByYear`, `landlordIsCompany`) instead of "expected vs declared"; the expected rent follows `chirieDeLa` (when the rent becomes due) and `chirieMajorata` from `majorareDeLa`.

## Declarația unică from the contracts

`POST /api/v1/dosare/annual-return` creates the `Declarația unică <an>` dosar with the 25 May deadline; the daily job `app:dosare:remind` does it automatically for every company that has rental-contract dosare and sends deadline reminders 30, 7 and 1 days before and on the day (`dosar.deadline` notifications, per the user's notification preferences).

`GET …/d212-prefill` builds the [D212 rent-scenario input](/api-reference/public/declaration-forms) from the rental dosare: one entry per contract active in the income year, period clipped to the year, gross rent = monthly rent × months for RON contracts. Rents in other currencies come back as `0` with a note: they must be converted at the BNR rate of each payment. `POST …/d212` creates the D212 draft in the dosar (type `d212`, `data.input`), which then follows the normal declaration flow: validate (ANAF DUKIntegrator), prepare (PDF), sign and file through the [Storno Agent](/agent), recipisa linked back into the dosar.

## Documents from a dosar

`GET /api/v1/dosare/{id}/document/conventie_incetare_inchiriere` returns the fields of the [legal document generator](/api-reference/public/legal-documents) prefilled from the dosar and the company (landlord, tenant, contract, property, termination date) plus the `required` list; `POST` with the reviewed fields as overrides renders the PDF. The same for `declaratie_incetare_contract`, the landlord's sworn statement attached to a C168 termination. Generating either sets the dosar's next step to signing and filing the C168 termination within 30 days.

## Files in a dosar

The scanned contract, the addendum, the termination document or the signed sworn statement live in the dosar (`POST …/files`). They are what the C168 needs as its zip attachment, so filing from the dosar picks them by id.

## C168 built from the dosar

`GET …/c168-prefill?actiune=inregistrare|modificare|incetare` assembles the [C168 input](/api-reference/public/declaration-forms) from the dosar and the company: the company as designated landlord, the contract, the property, the tenant, and for a termination or an amendment the corresponding block from the subject (`dataIncetare`, `incetareNumar`, `incetareMotiv`; `dataModificare`, `modificareChirie`, `modificarePanaLa`). ANAF wants coded addresses; they are kept in the subject as `adresaCod` (property), `chiriasAdresaCod` (tenant) and `locatorAdresaCod` (landlord), each `{judet, localitate, localitateNume, strada, stradaNume, numar, detalii, codPostal}` with codes from the [nomenclator](/api-reference/public/anaf-nomenclator). The response carries Storno's rule `issues` so the missing pieces are explicit.

`POST …/c168` with the reviewed input and the attachment (dosar `fileIds` and/or inline `attachments`) creates the C168 declaration in the dosar, remembers the reviewed addresses and dates in the subject, and sets the next step. The declaration then follows the normal flow: validate, prepare, sign and file through the agent. Prepare refuses a C168 while another one of the company is still in processing (`409 C168_IN_PROCESSING`), because ANAF rejects the second one (R_MULTI_C168).

## Dosare from ANAF's registry

The answer to the C168 SPV request is the "Registrul contractelor de locațiune", a table with one row per filing. Storno reads it (`GET /api/v1/dosare/registry-proposals` takes the newest one archived in the inbox; `POST` with multipart `file` takes a PDF downloaded by hand), reconstructs every contract with its state after all filings (`activ`, `expirat` without a termination filing, `incetat` with the termination date), and matches each one against the existing rental dosare by contract number and date or by tenant and start date. `POST …/registry-import` with the ticked contracts creates the dosare, keeping the ANAF upload index and registration date in the subject; a contract that expired without a termination is flagged for attention because ANAF still considers it running.

## C168 filed from Storno

Declarations of type `c168` can be created like any other (`POST /api/v1/declarations` with `type: "c168"`, `year`, `month: 12`) and take the [C168 form input](/api-reference/public/declaration-forms) in `data.input` plus the scanned contract or termination document in `data.attachments[]` (`{name, contentBase64}`); the prepare step validates, builds the zip and the PDF, and the agent files it. One C168 per landlord and period can be in processing at a time.
