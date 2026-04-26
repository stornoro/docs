---
title: Changelog
description: API version history and breaking changes.
---

# Changelog

All notable changes to the Storno.ro API are documented here.

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
