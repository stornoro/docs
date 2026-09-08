---
title: Changelog
description: API version history and breaking changes.
---

# Changelog

All notable changes to the Storno.ro API are documented here.

## 2026-09-08 — dosare (case files), D212 from Storno, deadline reminders

### Added

- **Natural persons as companies** — `POST /api/v1/companies` with `type: "individual"`, `cnp`, `name`, `city`, `state` adds a persoană fizică (CNP checked, nothing fetched from ANAF, never a VAT payer); `type` / `isIndividual` on every company response, `refresh-anaf` refused with `400 INDIVIDUAL`, a CNP given as `cif` refused with `422 CNP_NOT_CIF`. The D212 prefill of a person carries their CNP; the rental portfolio reports `landlordIsCompany` from the company type. `company.cif` is now BIGINT. Web and mobile: *Firmă (CUI) / Persoană fizică (CNP)* when adding a company. MCP: `companies_create` with `type`, `cnp`, `name`, `address`, `city`, `state`. See [create company](/api-reference/companies/create).
- **Drag and drop imports** — the bank statements, borderou and marketplace pages take files dropped anywhere on the page: the import opens with the file attached and the bank account preselected (the only one, or the one used last time); several files dropped together are imported one after another with the same settings.
- **A natural person's dashboard and pages** — for a company of type `individual`, `GET /api/v1/dashboard/widgets/catalog` and `/config` return only the widgets about them (`dosare-actions` first, sync state, amounts to pay, expenses, activity, recent invoices; `audience: individual`), `PUT /config` refuses the others; new widget `dosare-actions` (what to do with ANAF) for every company, hidden by default for companies. Web and mobile hide the selling pages for a person (recurring/proforma invoices, delivery notes, receipts, products, sales and VAT reports, series, categories, VAT rates, PDF and email templates, POS) and the onboarding checklist becomes company → ANAF → first dosar → SPV sync.
- **SPV requests for a CNP** — `GET /api/v1/spv/requests/types` returns the list the SPV form offers the company's identifier (a CNP sees the person types: D212, `Duplicat declaratie unica`, `Adeverinte Venit`, `Istoric declaratii PF`, `Venituri Formular Banca`, `Detalii neconcordante D112 REVISAL`, C168, fișa rol…; a CUI the company ones), with `audience` per type and `?all=1` for the whole catalog; `prepare` refuses a type outside that list and applies the form's period rules for website-form types. MCP: `spv_request_types` takes `companyId` / `all`. See [SPV requests](/api-reference/spv/requests).
- **CNP wherever the company is a natural person** — the web app, the mobile app and the PDF documents (invoice, storno, proforma, aviz, bon fiscal) label the company's identifier `CNP` instead of `CIF`/`CUI` when the company has `type: individual`; a 13-digit party identifier on an invoice reads `CNP` too.
- **Expired e-Factura messages** — ANAF stops serving a message's file 60 days after publishing it and answers the download with a plain-text refusal; the sync now records such messages with status `expired` (plain-language explanation in `errorMessage`, `expired` count in the sync result) instead of logging an error on every run. Typical on the first sync of a person's SPV with a long window.
- **Mobile: dosare and links** — the app gets the case files (actions feed, rental portfolio, list with deadlines, detail with the linked client, billing with the tenant and timeline) and the *Legături* card on client, supplier, invoice, recurring invoice and SPV message screens; filing stays on the web, where the certificate is.
- **Related records** — `GET /api/v1/related/{type}/{id}` for `client`, `supplier`, `invoice`, `recurring_invoice`, `declaration`, `spv_document`, `spv_request`, `dosar`: everything in the company connected to that record, grouped, each item with its status, date and page. Dosare now carry `client` / `supplier` (`{id, name}`), linked by the tenant's CUI or CNP on create and edit or set with `PATCH` `clientId` / `supplierId` (null unlinks), and `GET /api/v1/dosare?clientId=&supplierId=` filters by them; tenant matching also accepts a client's CNP. The web app shows a *Legături* card on the client, supplier, invoice, recurring invoice, declaration, SPV message and dosar pages, and the dosar links to its client (pick or unlink from the page). MCP: `related_get`. See [related records](/api-reference/related/overview).

- **Storno Agent 1.7.8 — remembered PIN** — `POST /pin`, `GET/DELETE /pin/{certificateId}` on the local agent keep the certificate PIN in the OS secure store (Keychain, DPAPI, libsecret) after checking it on the token; `GET /certificates` reports `pinStored` and `secretStore`. Requests to `/proxy`, `/batch`, `/sign`, `/sign-and-submit`, `/batch-sign-and-submit`, `/spv-web-request` and monitor enrollment may omit `pin` when it is remembered. Web app: *Company → ANAF → Agent → Salvează preferința* remembers it permanently (badge + *Uită PIN-ul*). MCP: `agent_sign_pdf`, `agent_submit_declaration_pdf`, `declarations_file_via_agent` work without `pin`/`STORNO_AGENT_PIN` when the agent remembers it. The SPV monitor waits a minute after the computer wakes from sleep and retries "token not ready" errors (`pkcs11 engine::object not found`) before recording a failure.

- **Dosare** — `GET/POST /api/v1/dosare`, `GET …/actions`, `GET …/stats`, `GET/PATCH/DELETE …/{id}`, `POST …/{id}/attach|detach`, `POST …/annual-return`, `GET …/{id}/d212-prefill`, `POST …/{id}/d212`, `GET/POST …/{id}/document/{type}`: case files grouping declarations, SPV requests and ANAF messages around a rental contract, a filing year of the Declarația unică, the periodic returns or the fiscal standing; automatic linking of recipisas (by upload index) and answers (by `id_solicitare`) by the inbox sync; the "needs attention / at ANAF / new answers" feed; the rental portfolio with expected vs declared rent; the termination agreement and the sworn statement prefilled from the dosar. `dosarId` on declarations, SPV requests and SPV documents. MCP: `dosare_*` (12 tools). See [dosare](/api-reference/dosare/overview).
- **D212 and C168 filed from Storno** — declaration types `d212` and `c168` take the form input (`data.input`, schema from the public form spec) and, for C168, the attachments (`data.attachments`); prepare builds the XML with Storno's rules, validates with DUKIntegrator, renders the PDF with the zip and the agent files it. The D212 rent scenario is prefilled from the rental dosare. MCP: `declarations_create` (with `data`, `dosarId`), `declarations_update`, `declarations_file_via_agent` (prepare, sign, upload, record the index in one call).
- **Dosar files and C168 from the dosar** — `POST /api/v1/dosare/{id}/files` (contract scan, addendum, termination document), `GET …/c168-prefill`, `POST …/c168` (the C168 built from the dosar with the files as attachment, coded addresses remembered), `409 C168_IN_PROCESSING` on prepare while another C168 is at ANAF, `GET /api/v1/dosare/stats?format=csv`; two more documents from the dosar: `act_aditional_inchiriere` and `notificare_incetare_inchiriere`. MCP: `dosare_files_upload/download`, `dosare_c168_prefill/create`, `dosare_stats` with `csvOutFile`.
- **Dosare from ANAF's registry** — `GET/POST /api/v1/dosare/registry-proposals` reads the "Registrul contractelor de locațiune" extract (SPV answer or uploaded PDF), reconstructs each contract's state and matches it to existing dosare; `POST /api/v1/dosare/registry-import` creates the missing ones. MCP: `dosare_registry_proposals`, `dosare_registry_import`.
- **Manual filing** — `GET /api/v1/declarations/{uuid}/pdf` now produces the ANAF PDF on demand for drafts (`?inline=1` to view, `?refresh=1` to regenerate), so a person without the agent uploads it in SPV themselves; MCP `declarations_download_pdf`. See [download the ANAF PDF](/api-reference/declarations/download-pdf).
- **Billing with the tenant** — `GET /api/v1/dosare/{id}/billing` links a rental dosar to the tenant's client and supplier records by CUI: recurring invoice, issued invoices with paid / unpaid / overdue state, received invoices, investment compensation balance; the portfolio shows expected vs invoiced for company landlords and honours the rent start date and contractual increases. MCP `dosare_billing`.
- **Deadline reminders** — daily `app:dosare:remind` creates the yearly Declarația unică dosar for taxpayers with rental contracts and notifies 30, 7 and 1 days before a dosar deadline and on the day (`dosar.deadline` notifications). The C168 30-day deadline is set when a rental dosar is created.

## 2026-09-05 — declarations with your own AI, SPV requests, PDF signing

### Added

- **Public declaration tools** (no account, nothing stored): `POST /api/v1/public/declarations/validate` validates any ANAF declaration XML with ANAF's own DUKIntegrator validators, `GET /api/v1/public/declarations/status/{index}/{cui}` reads the processing state from StareD112, `GET /api/v1/public/anaf/nomenclator/*` serves county, locality and street codes from a local mirror. Designed for AI assistants working through the MCP server: the assistant reads the user's documents locally and only asks Storno to validate, look up codes and check status.
- **Declaration forms for AI assistants** — `GET /api/v1/public/declarations/forms`, `GET …/forms/{type}` (specification: input schema, XSD attributes, ANAF rules, example; `?xsd=1`), `POST …/forms/{type}/build` (XML + Storno rules + DUKIntegrator + ANAF's online validator) and `POST /api/v1/public/declarations/pdf` (DUK PDF with the attachment zip embedded). Forms: C168 rental contracts and D212 Declarația unică (rent-income scenario with tax and CASS computed like ANAF's web form). MCP tools `declaration_forms`, `declaration_form_spec`, `declaration_build`, `declaration_pdf`.
- **Legal documents** — `GET /api/v1/public/documents` and `POST /api/v1/public/documents/{type}` generate a rental termination agreement (`conventie_incetare_inchiriere`) or the landlord's sworn statement for C168 (`declaratie_incetare_contract`) as PDF + HTML from structured fields.
- **SPV requests** — `GET /api/v1/spv/requests/types`, `POST /api/v1/spv/requests/prepare`, `POST /api/v1/spv/requests/{uuid}/agent-result`, `GET /api/v1/spv/requests`, `DELETE /api/v1/spv/requests/{uuid}`: file requests to ANAF (fiscal record, registry extracts, C168 register, account statements …) through the agent. Types the web service does not accept (for example C168) go through ANAF's website form automatically.
- **SPV summaries** — every SPV document now carries `summary` (Romanian) and `summaryEn`, a plain-language explanation of what the document is and what to do; `GET /spv/documents/stats` returns `lastSyncedAt`.
- **Storno Agent 1.7.6** — unattended SPV monitoring with the PIN in the OS secure store, `POST /sign` for signing PDFs one by one or in bulk (optional visible signature box), `POST /sign-and-submit` to the e-guvernare portal, batch PDF downloads. MCP tools `agent_sign_pdf`, `agent_submit_declaration_pdf`, `document_generate`, `anaf_declaration_status`, `anaf_nomenclator_*`, `spv_request_*` in `storno-cli` 1.0.25.

### Changed

- **Certificate operations require the PIN** — SPV sync, SPV requests, declaration uploads and monitoring refuse to run without it (`PIN_REQUIRED`); the PIN is never sent to Storno.
- **OAuth-based declaration status sync** is retired: `POST /declarations/sync` without the agent returns `409 AGENT_REQUIRED`.
- SPV message dates (`data_creare`, day-first `DDMMYYYYHHMMSS`) are parsed correctly; existing rows were repaired.

## 2026-09-04 — security hardening

### Changed

- **Document emails** — `POST /invoices|delivery-notes|receipts/{uuid}/email` now require every recipient (`to`, `cc`, `bcc`) to be a client of the company (or the company's / sender's own address), cap recipients at 5, apply per-user burst and per-organization daily limits, and reject phishing-style content. New error codes: `EMAIL_RECIPIENT_NOT_CLIENT`, `EMAIL_TOO_MANY_RECIPIENTS`, `EMAIL_RATE_LIMIT`, `EMAIL_DAILY_LIMIT`, `EMAIL_CONTENT_BLOCKED`.
- **Company scoping** — `X-Company` / `?company` must reference a company of the caller's organization; other ids return `404`. Every uuid-addressed document, supplier, and email template route returns `404` for entities outside the organization. `clientId`, `productId`, and `templateId` in request bodies must belong to the same company.
- **Monthly invoice limit** — enforced on every invoice creation path (conversions, recurring, storno) per organization, not only on `POST /invoices`.
- **Plan gates** — `402 PLAN_LIMIT` is now returned consistently for PDF on all document types, bank statements (borderou), payment links (Stripe Connect and share-link `pay`), recurring invoices, webhooks (update/test/retry), email templates, import follow-up steps, backup download, member reactivation, company restore, and realtime tokens.
- **Rate limits** — invitations (10 pending per organization, 10 sends per hour), password reset and confirmation resend (3 per email per hour), share links (30 per 10 minutes per token), storage and webhook tests (10 per 10 minutes), ANAF/VIES lookups (30 per minute), and a per-organization ANAF budget (60 per minute).
- **Outbound URLs** — webhook URLs must be public HTTPS on port 443; storage endpoints, SMTP hosts, and SDI endpoints must resolve to public addresses.
- **Realtime** — `POST /centrifugo/subscription-token` only issues tokens for the caller's own user channel and companies.
- **PDF templates** — `customCss` is validated (no `<`, `url()`, `@import`, escapes); `fontFamily` must match a simple font-name pattern. Company logos accept PNG, JPG, and WEBP only.
- **Registration** — email is validated, names are limited to 60 characters and may not contain links, line breaks, or email addresses.
- **CSV exports** — cells starting with `=`, `+`, `-`, `@` are prefixed with `'` to neutralize spreadsheet formulas.

## 2026-06-02

### Changed

- **Stripe App refunds** — refunding a Stripe payment now issues a storno reversal of the original e-invoice (negated quantities, inheriting the original series, document type, and per-line VAT rates) instead of a synthetic single-line credit note. A full refund reverses the whole invoice; a partial refund reverses proportionally. Surfaced in the app's **Payment Detail → Refunds** section.

## 2026-04-26 — v2.7.0

### Added

- **Refund receipts** — `POST /receipts/{uuid}/refund` issues a counter-receipt that mirrors lines as negative and inverts payment amounts. Supports full or partial refunds via the `lineSelections` body field; multiple partial refunds against the same parent are allowed until the per-line quantity pool is exhausted. Cancelling a refund releases its quantities back to the pool.
- **Receipt linkage fields** — `Receipt.refundOf` (slim `{id, number}` reference to the parent receipt) and `Receipt.refundedBy` (array of slim refs to active refund receipts; cancelled refunds are excluded).
- **Idempotency keys for receipts** — `Receipt.idempotencyKey` (unique varchar 255) accepted via the `Idempotency-Key` HTTP header (preferred) or the `idempotencyKey` body field. Repeat submissions with the same key return the originally-created receipt instead of duplicating. Used by mobile POS for safe offline retries and ambiguous-timeout recovery.
- **Product categories** — new `ProductCategory` entity with `name`, `color`, `sortOrder`. Full CRUD under `/product-categories`. Optional FK on `Product.category` with `ON DELETE SET NULL`. Used as fallback swatch and grid grouping on the POS.
- **Product fields** — `Product.color` (optional hex swatch shown on the POS product grid; mobile clients fall back to a deterministic palette derived from the product UUID when null) and `Product.sgrAmount` (Romanian SGR / Sistem Garantie-Returnare deposit per unit, e.g. `"0.50"` for plastic beverage bottles; the deposit is VAT-exempt and appears as a separate auto-managed line on POS receipts).
- **Cash register endpoints** — `GET /cash-register/balance`, `GET /cash-register/ledger`, and full CRUD on `/cash-register/movements` (deposits, withdrawals, miscellaneous adjustments). Bank accounts gain `type=cash` with `openingBalance` + `openingBalanceDate` to back the till.

### Changed

- `Idempotency-Key` HTTP header now takes precedence over the body `idempotencyKey` field when both are sent (fixes inverted precedence in earlier preview).
- Refund receipts inherit `internalNote`, `cashRegisterName`, `fiscalNumber`, and customer fiscal data from the parent receipt.
- Receipt detail PDFs render `BON DE RAMBURSARE` instead of `BON FISCAL` for refund receipts (ro/en/fr/de translations included).

## 2026-02-16

### Documentation

- Published comprehensive API documentation covering all endpoints
- Added object reference for all entity types
- Added concept guides for multi-tenancy, ANAF integration, document lifecycle, series numbering, and recurring invoices

## v1 (Current)

### Features

- **Authentication** — JWT tokens, refresh tokens, Google OAuth, WebAuthn passkeys
- **User Management** — Registration, password reset, email confirmation, profile management, account deletion
- **Organizations** — Multi-tenant with role-based memberships (Owner, Admin, Accountant, Employee)
- **Companies** — Multi-company support with ANAF CIF validation
- **Invoices** — Full lifecycle: create, issue, submit to ANAF, cancel, restore
- **Proforma Invoices** — Create, send, accept/reject, convert to invoice
- **Delivery Notes** — Create, issue, cancel, convert to invoice
- **Credit Notes** — Create and submit as corrective invoices
- **Recurring Invoices** — Scheduled automatic invoice generation with flexible frequencies
- **Payments** — Record, track, and manage payments per invoice
- **ANAF Integration** — OAuth token management, e-Factura sync, XML validation, digital signature verification
- **PDF Generation** — Professional PDF invoices from UBL XML
- **Email** — Send invoices with PDF/XML attachments, customizable templates
- **Export** — CSV and ZIP export of invoices
- **Reports** — VAT reports by period
- **Notifications** — In-app, email, and push notifications with preferences
- **Real-time** — WebSocket updates via Centrifugo
- **Exchange Rates** — BNR exchange rates with currency conversion
- **Admin** — Super admin platform management endpoints

### API Conventions

- All endpoints under `/api/v1/`
- JWT Bearer authentication
- Multi-company context via `X-Company` header
- JSON request/response bodies
- UUID resource identifiers
- Paginated list responses with `page`, `limit`, `total`, `pages`
