---
title: Changelog
description: API version history and breaking changes.
---

# Changelog

All notable changes to the Storno.ro API are documented here.

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
