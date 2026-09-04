---
title: Changelog
description: API version history and breaking changes.
---

# Changelog

All notable changes to the Storno.ro API are documented here.

## 2026-09-05 — declarations with your own AI, SPV requests, PDF signing

### Added

- **Public declaration tools** (no account, nothing stored): `POST /api/v1/public/declarations/validate` validates any ANAF declaration XML with ANAF's own DUKIntegrator validators, `GET /api/v1/public/declarations/status/{index}/{cui}` reads the processing state from StareD112, `GET /api/v1/public/anaf/nomenclator/*` serves county, locality and street codes from a local mirror. Designed for AI assistants working through the MCP server: the assistant reads the user's documents locally and only asks Storno to validate, look up codes and check status.
- **Declaration forms for AI assistants** — `GET /api/v1/public/declarations/forms`, `GET …/forms/{type}` (specification: input schema, XSD attributes, ANAF rules, example; `?xsd=1`), `POST …/forms/{type}/build` (XML + Storno rules + DUKIntegrator + ANAF's online validator) and `POST /api/v1/public/declarations/pdf` (DUK PDF with the attachment zip embedded). First form: C168 rental contracts. MCP tools `declaration_forms`, `declaration_form_spec`, `declaration_build`, `declaration_pdf`.
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
