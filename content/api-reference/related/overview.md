---
title: Related records
description: Everything in the company connected to one record (client, supplier, invoice, recurring invoice, declaration, SPV message or request, dosar), each item with the page it lives on
method: GET
endpoint: /api/v1/related/{type}/{id}
---

# Related records

Storno keeps one answer to "what else do we have about this?". A rental dosar is tied to the tenant's client record, so the client's invoices, recurring invoice and payments show up in the dosar and the dosar shows up on the client page; the declaration filed from a dosar and the ANAF message that answered it point back to it; an invoice knows the recurring invoice that issued it and the case file of its tenant.

The web app shows the same card ("Legături") on every detail page. The MCP tool is `related_get`.

## Request

```
GET /api/v1/related/{type}/{id}
GET /api/v1/related/types
```

`type` is one of `client`, `supplier`, `invoice`, `recurring_invoice`, `declaration`, `spv_document`, `spv_request`, `dosar`; `id` the record's UUID. Takes the company from `X-Company`; a record from another company is a `404`.

## Response

```json
{
  "source": { "type": "dosar", "id": "…", "title": "Contract de închiriere Str. Exemplu 1", "subtitle": "rental_contract", "status": "active", "date": "2026-10-01", "href": "/dosare/…" },
  "groups": {
    "clients": [ { "type": "client", "id": "…", "title": "Chiriaș SRL", "subtitle": "12345678", "status": null, "date": null, "href": "/clients/…" } ],
    "recurringInvoices": [ { "type": "recurring_invoice", "id": "…", "title": "Chirie hala", "subtitle": "monthly · 1 500.00 EUR", "status": "active", "date": "2026-10-15", "href": "/recurring-invoices/…" } ],
    "invoices": [ { "type": "invoice", "id": "…", "title": "WAS0037", "subtitle": "1 500.00 EUR · Chiriaș SRL", "status": "issued", "date": "2026-08-15", "href": "/invoices/…", "direction": "outgoing", "balance": 1500 } ],
    "declarations": [ { "type": "declaration", "id": "…", "title": "C168", "subtitle": "2026", "status": "accepted", "date": "2026-05-20", "href": "/declarations/…" } ],
    "spvDocuments": [ { "type": "spv_document", "id": "…", "title": "Recipisă C168", "subtitle": "recipisa", "status": "read", "date": "2026-05-21", "href": "/spv?document=…" } ]
  }
}
```

Only groups with items are returned, and only those the caller may view (`declaration.view` for dosare, declarations and SPV; `invoice.view` for invoices; `recurring_invoice.view`; `client.view` for clients and suppliers). Invoices are the ten most recent, cancelled ones left out, with the open `balance`.

| Source | Groups |
|---|---|
| `client` | its dosare, recurring invoices, recent invoices, the declarations and SPV messages of those dosare |
| `supplier` | its dosare, received invoices, the declarations of those dosare |
| `invoice` | client, supplier, the dosare of that party, the recurring invoice that issued it, sibling invoices |
| `recurring_invoice` | client, the client's dosare, recent invoices |
| `declaration` | its dosar and the dosar's client, the recipisa in the SPV inbox, the other declarations of the dosar |
| `spv_document` | the dosar it was linked to and its client, the SPV request it answered, the dosar's declarations |
| `spv_request` | its dosar, the answer document, the dosar's client |
| `dosar` | client, supplier, recurring invoices, invoices, declarations, SPV requests and messages |

## How the links are made

- A dosar's tenant (`subject.chiriasCif`) is matched to the client and the supplier with the same CUI or CNP when the dosar is created or edited; `PATCH /api/v1/dosare/{id}` with `clientId` / `supplierId` sets the link by hand, `null` removes it. The dosar carries `client` and `supplier` (`{id, name}`); `GET /api/v1/dosare?clientId=` filters by them.
- Declarations, SPV requests and SPV documents carry `dosarId` (set by `attach`, by the dosar builders or by the inbox sync).
- Invoices and recurring invoices are tied to the client; a recurring invoice remembers the last invoice it issued.
