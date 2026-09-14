---
title: Customer statement (situație clienți)
description: Unpaid invoices per client with aging bands, as JSON or PDF, e-mailed to one or all clients with a balance
---

# Customer statement (situație clienți)

A customer statement lists the **unpaid outgoing invoices** of a client as of a reference date, with the amount still due per invoice, the days overdue, the client's balance and the outstanding amount split into **aging bands**. It can be read as JSON, downloaded as a PDF, or e-mailed to the client (with the PDF attached) — for one client or for every client that owes money.

Rules:

- Only outgoing invoices that are issued (not draft, cancelled or converted), not deleted, issued on or before `asOf` and with something still open (`total ≠ amountPaid`) are included. Paid amounts come from the invoice's recorded payments.
- Days overdue are counted from the due date (or the issue date when there is no due date) up to `asOf`. Invoices not yet due are in the `current` band.
- Storno / credit documents with a negative balance are listed as **credits**: they reduce the balance and do not enter the aging bands.
- The statement is expressed in the company's default currency. Invoices in other currencies are listed with their own currency and summarised in `otherCurrencies`, but they are not part of `balance` or `aging`.

## Aging bands

| Key | Days overdue |
|-----|--------------|
| `current` | not yet due (0 or less) |
| `days1_30` | 1–30 |
| `days31_60` | 31–60 |
| `days61_90` | 61–90 |
| `days91_120` | 91–120 |
| `days121_180` | 121–180 |
| `over180` | more than 180 |

The bands add up to `totals.outstanding`; `balance = totals.outstanding + totals.credits`.

## Get a client's statement

```http
GET /api/v1/clients/{uuid}/statement?asOf=2026-09-14
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | Client UUID (path) |
| `asOf` | string | No | Reference date `YYYY-MM-DD`; default today |

Requires `CLIENT_VIEW`.

### Response

```json
{
  "client": { "id": "9f4a1c2e-...", "name": "Client Exemplu SRL", "type": "company", "cui": "RO00000000", "email": "office@example.com", "city": "București", "country": "RO" },
  "company": { "id": "c1b2...", "name": "Firma Mea SRL" },
  "asOf": "2026-09-14",
  "currency": "RON",
  "invoices": [
    { "id": "…", "number": "FCT-0001", "status": "issued", "issueDate": "2026-07-01", "dueDate": "2026-07-31", "currency": "RON", "total": "1000.00", "paid": "200.00", "outstanding": "800.00", "daysOverdue": 45, "band": "days31_60" },
    { "id": "…", "number": "FCT-0002", "status": "issued", "issueDate": "2026-09-10", "dueDate": "2026-10-10", "currency": "RON", "total": "500.00", "paid": "0.00", "outstanding": "500.00", "daysOverdue": 0, "band": "current" }
  ],
  "totals": { "count": 2, "invoiced": "1500.00", "paid": "200.00", "outstanding": "1300.00", "overdue": "800.00", "credits": "0.00", "balance": "1300.00" },
  "aging": {
    "current": { "amount": "500.00", "count": 1 },
    "days1_30": { "amount": "0.00", "count": 0 },
    "days31_60": { "amount": "800.00", "count": 1 },
    "days61_90": { "amount": "0.00", "count": 0 },
    "days91_120": { "amount": "0.00", "count": 0 },
    "days121_180": { "amount": "0.00", "count": 0 },
    "over180": { "amount": "0.00", "count": 0 }
  },
  "balance": "1300.00",
  "otherCurrencies": {},
  "bankAccounts": [ { "iban": "RO00XXXX0000000000000000", "bankName": "Banca Exemplu", "currency": "RON", "isDefault": true } ]
}
```

## Download the statement as PDF

```http
GET /api/v1/clients/{uuid}/statement.pdf?asOf=2026-09-14&download=true
```

Returns `application/pdf` (`Content-Disposition: attachment; filename="situatie-facturi-<client>-<asOf>.pdf"`; pass `download=false` for `inline`). The PDF uses the company's PDF template colour and shows the invoice list, the aging table, the totals and the company bank accounts. Requires `CLIENT_VIEW`.

## E-mail the statement to a client

```http
POST /api/v1/clients/{uuid}/statement/email
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `asOf` | string | No | Reference date `YYYY-MM-DD`; default today |
| `to` | string | No | Recipient override. Defaults to the client's e-mail. Like invoice e-mails, the address must belong to one of your clients (or be your own company/user address). |
| `message` | string | No | Optional plain-text message (max 2000 characters) appended to the standard body |

Requires `INVOICE_SEND` and a plan with e-mail sending. The e-mail follows the invoice e-mail conventions (platform sender with the company as display name, reply-to the company address, unsubscribe link, the same outbound guard and plan limits as [invoice e-mails](/api-reference/invoices/email)) and is recorded as an `EmailLog` with category `statement`.

Subject: `Facturi neachitate {companyName}`. Body (plain text + HTML):

```
Bună ziua,

Vă informăm că, la data 14.09.2026, în evidențele noastre figurează următoarele facturi neachitate:

- Factura FCT-0001 din 01.07.2026, scadentă la 31.07.2026: total 1.000,00 RON, rest de plată 800,00 RON (45 zile întârziere)
- Factura FCT-0002 din 10.09.2026, scadentă la 10.10.2026: total 500,00 RON, rest de plată 500,00 RON

Total de achitat: 1.300,00 RON

Plata se poate efectua în contul:
RO00XXXX0000000000000000 - Banca Exemplu (RON)

{message}

Dacă plata a fost efectuată între timp, vă rugăm să nu luați în considerare acest mesaj.

Cu stimă,
Firma Mea SRL
```

The statement PDF is attached. An [e-mail template](/api-reference/email-templates/list) with category `statement` marked as default replaces the subject/body; the placeholders `[[client_name]]`, `[[company_name]]`, `[[as_of]]`, `[[total]]`, `[[currency]]`, `[[invoice_count]]`, `[[invoice_list]]` and `[[bank_accounts]]` are substituted.

### Response

The created e-mail log (`id`, `toEmail`, `subject`, `status`, `category: "statement"`, `sentAt`, …).

### Errors

| Status | Code | Description |
|--------|------|-------------|
| `400` | — | Invalid `asOf`, invalid `to`, or the client has no e-mail (`NO_EMAIL`) |
| `402` | `PLAN_LIMIT` | E-mail sending is not available on the plan |
| `403` | — | Missing `INVOICE_SEND` |
| `404` | — | Client not found (or not in your organization) |
| `422` | `NO_BALANCE` | The client has nothing to pay |
| `422` | `EMAIL_RECIPIENT_NOT_CLIENT` | `to` is not an address of one of your clients |
| `429` | `EMAIL_RATE_LIMIT` / `EMAIL_DAILY_LIMIT` | Plan e-mail limits reached (`Retry-After` header) |

## All clients with a balance

```http
GET /api/v1/clients/statements?asOf=2026-09-14
```

One statement per client with a **positive balance**, sorted by balance descending (without `bankAccounts`), plus company-wide totals and aging. Requires `CLIENT_VIEW`.

```json
{
  "company": { "id": "…", "name": "Firma Mea SRL" },
  "asOf": "2026-09-14",
  "currency": "RON",
  "clientCount": 2,
  "totals": { "invoiced": "…", "paid": "…", "outstanding": "…", "credits": "…", "balance": "…", "count": 5 },
  "aging": { "current": { "amount": "…", "count": 2 }, "days1_30": { "…": "…" }, "…": "…" },
  "statements": [ { "client": { "…": "…" }, "balance": "1300.00", "aging": { "…": "…" }, "invoices": [ "…" ] } ]
}
```

## E-mail every client with a balance

```http
POST /api/v1/clients/statements/email
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `asOf` | string | No | Reference date; default today |
| `minBalance` | number | No | Minimum balance a client must owe to receive the statement; default `0.01` |
| `message` | string | No | Optional message appended to every e-mail |
| `dryRun` | boolean | No | `true` returns who would receive the statement and who is skipped, without sending |

Requires `INVOICE_SEND` (and, unless `dryRun`, a plan with e-mail sending). Clients are skipped when their balance is below `minBalance` (`below_min_balance`), they have no valid e-mail (`no_email`) or they unsubscribed from the company's e-mails (`unsubscribed`). The run stops at the plan's daily / burst e-mail limit; the remaining clients are reported as skipped with the limit code in `stoppedReason`.

```json
{
  "asOf": "2026-09-14",
  "dryRun": false,
  "minBalance": "0.01",
  "clientsWithBalance": 3,
  "sent": 2,
  "skipped": 1,
  "failed": 0,
  "stoppedReason": null,
  "results": [
    { "clientId": "…", "clientName": "Client Exemplu SRL", "email": "office@example.com", "balance": "1300.00", "currency": "RON", "status": "sent", "reason": null, "emailLogId": "…" },
    { "clientId": "…", "clientName": "Alt Client SRL", "email": null, "balance": "250.00", "currency": "RON", "status": "skipped", "reason": "no_email" }
  ]
}
```

## MCP tools

`client_statement`, `client_statements` and `client_statement_email` (one or all clients, with `dryRun`) in [storno-cli](/integrations/cli).

## Related Endpoints

- [Get client](/api-reference/clients/get)
- [Send invoice by e-mail](/api-reference/invoices/email)
- [Email templates](/api-reference/email-templates/list)
