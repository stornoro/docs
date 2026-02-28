---
title: Storno.ro API Documentation
description: Complete API reference for the Storno.ro multi-country e-invoicing platform.
---

# Storno.ro API

Storno.ro is an e-invoicing platform that integrates with e-invoice provider systems across the EU (Romania, Germany, Italy, Poland, France). This API allows you to manage companies, create and send invoices, track payments, and automate your invoicing workflow.

## Base URL

```
https://api.storno.ro
```

## Key Features

- **Multi-Country E-Invoicing** — Integration with e-invoice provider systems (ANAF, XRechnung, SDI, KSeF, Factur-X)
- **Multi-Company Support** — Manage multiple companies under one organization
- **Full Invoice Lifecycle** — Create, issue, submit to provider, track payments
- **Document Types** — Invoices, proforma invoices, credit notes, delivery notes, receipts (bonuri fiscale)
- **Recurring Invoices** — Schedule automatic invoice generation
- **PDF & XML Generation** — Generate UBL-compliant XML and professional PDFs with customizable templates
- **Multi-Language PDFs** — Generate documents in Romanian, English, German, or French
- **Real-time Updates** — WebSocket support via Centrifugo

## LLMs

Machine-readable documentation files for AI assistants and LLMs:

- [llms.txt](/llms.txt) — Lightweight index with links and descriptions
- [llms-full.txt](/llms-full.txt) — Full content of all documentation pages

## Quick Links

- [Authentication](/getting-started/authentication) — JWT tokens, refresh flow, OAuth
- [Quickstart](/getting-started/quickstart) — Make your first API call
- [Self-Hosting](/getting-started/self-hosting) — Deploy on your own infrastructure with Docker
- [Error Handling](/getting-started/errors) — Error codes and formats
- [Multi-Tenancy](/concepts/multi-tenancy) — How organizations and companies work
- [Licensing](/concepts/licensing) — SaaS vs self-hosted licensing model

## Integrations

- [CLI / MCP Server](/integrations/cli) — Manage invoices through AI assistants (Claude, Cursor, Windsurf)
- [Stripe App](/integrations/stripe-app) — Create e-Facturi automatically from Stripe payments
- [Mobile App](/integrations/mobile-app) — iOS and Android app for invoicing on the go

## Contributing

- [Contributing Guide](/contributing-guide) — Overview of contributing to Storno
- [Mobile App Setup](/contributing-guide/mobile-app/setup-guide) — Set up the React Native development environment
- [Mobile App Architecture](/contributing-guide/mobile-app/architecture) — Understand the codebase
- [Common Errors](/contributing-guide/mobile-app/common-errors) — Troubleshooting development issues
- [Translation Guidelines](/contributing-guide/mobile-app/translation-guidelines) — Adding or updating translations

## Authentication

All API requests require a Bearer token in the `Authorization` header. Most endpoints also require an `X-Company` header to specify the company context.

```bash
curl https://api.storno.ro/api/v1/invoices \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

See [Authentication](/getting-started/authentication) for details on obtaining tokens.

## API Conventions

- All requests and responses use JSON (`Content-Type: application/json`)
- UUIDs are used as resource identifiers
- Dates use ISO 8601 format (`YYYY-MM-DD`)
- Timestamps use ISO 8601 with timezone (`YYYY-MM-DDTHH:mm:ssZ`)
- Monetary amounts are numeric (not string-encoded)
- Pagination uses `page` and `limit` query parameters
- List responses include `total`, `page`, `limit`, and `pages` metadata
- Soft-deleted resources are excluded from list endpoints by default

## HTTP Methods

| Method | Usage |
|--------|-------|
| GET    | Retrieve resources |
| POST   | Create resources or trigger actions |
| PUT    | Full resource update |
| PATCH  | Partial resource update |
| DELETE | Delete resources |

## Rate Limiting

API requests are subject to rate limiting. Authentication endpoints have stricter limits to prevent abuse. See the [Rate Limiting](/getting-started/rate-limiting) guide for full details on limits per endpoint.

## Versioning

The API is versioned via the URL path. The current version is `v1`:

```
/api/v1/invoices
```
