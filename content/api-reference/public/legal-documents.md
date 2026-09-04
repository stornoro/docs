---
title: Legal documents
description: Generate standard Romanian rental documents (termination agreement, sworn statement for C168) as PDF from structured fields
method: POST
endpoint: /api/v1/public/documents/{type}
---

# Legal documents

Public generator of standard documents, rendered server-side to PDF (and HTML). Nothing is stored; rate limited per IP.

| Type | Document | Required fields |
|---|---|---|
| `conventie_incetare_inchiriere` | Convenție de încetare a contractului de închiriere, signed by locator and locatar | `locator.nume`, `locator.adresa`, `locatar.nume`, `locatar.adresa`, `contract.numar`, `contract.data`, `contract.adresa_imobil`, `data_incetare` |
| `declaratie_incetare_contract` | Declarație pe propria răspundere a locatorului că un contract de închiriere a încetat (the mandatory attachment of a C168 termination filing) | `locator.nume`, `locator.adresa`, `locatar.nume`, `contract.numar`, `contract.data`, `contract.adresa_imobil`, `contract.data_inceput`, `contract.data_sfarsit`, `data_incetare` |

Optional fields: `locator.cnp`, `locator.ci_serie`, `locator.ci_numar` (same for `locatar`), `contract.numar_inregistrare_anaf`, `contract.data_inregistrare_anaf`, `contract.chirie`, `contract.valuta`, `garantie.suma`, `garantie.valuta`, `garantie.termen_zile`, `termen_utilitati_zile`, `motiv`, `motiv_detalii`, `organ_fiscal`, `data_conventie`, `data_declaratie`. Dates are `dd.mm.yyyy`.

`GET /api/v1/public/documents` lists the types with their required fields.

```bash {% title="cURL" %}
curl -X POST "https://api.storno.ro/api/v1/public/documents/conventie_incetare_inchiriere?format=pdf" \
  -H "Content-Type: application/json" -o conventie.pdf \
  -d '{"locator":{"nume":"EXEMPLU PROPRIETAR","adresa":"Mun. București, Str. Exemplu nr. 1, Sector 1"},
       "locatar":{"nume":"EXEMPLU CHIRIAȘ","adresa":"Mun. București, Str. Model nr. 2, Sector 2"},
       "contract":{"numar":"7","data":"01.03.2025","adresa_imobil":"Str. Exemplu nr. 1, ap. 3","numar_inregistrare_anaf":"INTERNT-100000123-2025","data_inregistrare_anaf":"05.03.2025"},
       "data_incetare":"31.08.2026","garantie":{"suma":"500","valuta":"EUR","termen_zile":10}}'
```

Without `?format=pdf` the answer is JSON: `{"title", "html", "pdfBase64"}`. Sign the PDF by hand or with the local agent (`agent_sign_pdf` in the MCP server), then attach it to the C168 filing.
