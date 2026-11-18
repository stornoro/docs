---
title: FAQ
description: Frequently asked questions about the Storno.ro API and platform.
---

# FAQ

## General

### What is Storno.ro?

Storno.ro is an e-invoicing platform that integrates with e-invoice provider systems across the EU (Romania, Germany, Italy, Poland, France). It provides a REST API, web application, and mobile app for creating, managing, and submitting invoices electronically.

### What document types are supported?

- **Invoices** — Outgoing and incoming, with multi-country e-invoicing integration
- **Proforma invoices** — Quotations and advance billing
- **Credit notes** — Invoice corrections and refunds
- **Delivery notes** — Goods shipment documentation
- **Recurring invoices** — Scheduled automatic generation

### What is e-Factura?

e-Factura is Romania's mandatory electronic invoicing system operated by ANAF (the national tax authority). All B2B invoices in Romania must be submitted through the e-Factura SPV (Virtual Private Space). Storno.ro automates this process — generating UBL 2.1 XML, submitting to ANAF, and tracking validation status.

---

## API

### How do I authenticate?

Use email/password, Google OAuth, or passkeys to obtain a JWT token. Include it in the `Authorization: Bearer {token}` header. Most endpoints also require an `X-Company` header. See [Authentication](/getting-started/authentication).

### What format are API responses?

All responses use JSON. Dates use ISO 8601 (`YYYY-MM-DD`), timestamps include timezone (`YYYY-MM-DDTHH:mm:ssZ`), and all identifiers are UUIDs.

### What are the rate limits?

There is no general per-request limit today. Authentication endpoints, ANAF calls and a few other endpoints are limited (for example 5 login attempts per minute per IP address). Handle `429` responses and honor `Retry-After` when present. See [Rate Limiting](/getting-started/rate-limiting).

### Can I use API keys instead of JWT tokens?

Yes. Create scoped API keys via [API Keys](/api-reference/api-keys/create) for programmatic access. API keys can optionally have an expiration date and can be revoked instantly. Include the key directly in the `Authorization` header (without the `Bearer` prefix): `Authorization: af_...`

### How does pagination work?

List endpoints accept `page` and `limit` query parameters (default 10, maximum 20, larger values are clamped). Responses include `total`, `page`, and `limit`. See [Pagination](/getting-started/pagination).

---

## Self-Hosting

### Can I self-host Storno.ro?

Yes. Without a license key the instance runs as the Community edition, with the Starter plan limits. A license key unlocks the plan it was issued for. Deploy with Docker Compose in minutes. See [Self-Hosting](/getting-started/self-hosting).

### What data is sent to Storno.ro from my self-hosted instance?

It depends on the license key. A JWT license key is validated offline and sends nothing. A legacy non-JWT key is checked against the Storno.ro server every 6 hours. That request carries the key, the instance URL and four counters (organizations, active users, companies, invoices created this month). The instance also asks the Storno.ro server for the latest version, cached for 6 hours. Invoices, clients and other business data are never sent.

### Does the license require internet connectivity?

Not for a JWT license key, which is validated offline with a signature check. The instance then works air-gapped or behind a firewall, apart from the version check. A legacy non-JWT key needs to reach the Storno.ro server; the instance keeps working from its cached result for 7 days when it cannot.

### What are the minimum server requirements?

A small deployment (< 5 users) needs 2 vCPUs, 4 GB RAM, and 20 GB SSD. See [System Requirements](/getting-started/system-requirements) for detailed specifications.

### How do I upgrade my self-hosted instance?

```bash
docker compose pull
docker compose up -d
docker compose exec backend php bin/console doctrine:migrations:migrate --no-interaction
```

### How do I back up my data?

Database backups via `mysqldump` and volume backups for file storage. Per-company backup/restore is also available via the API. See the Backups section in [Self-Hosting](/getting-started/self-hosting).

---

## e-Factura

### How often does Storno.ro sync with ANAF?

Sync frequency depends on your plan. Freemium syncs once per day, Starter every 12 hours, Professional every 4 hours, and Business every hour. You can also trigger a manual sync via the API.

### What happens when ANAF rejects an invoice?

The invoice status changes to `rejected` and the ANAF error messages are stored. You can view the errors, fix the invoice, and resubmit.

### Can Storno.ro receive incoming invoices from ANAF?

Yes. The sync process automatically downloads incoming invoices from ANAF SPV, parses the UBL XML, and creates Invoice records with the associated client and line items.

### Does Storno.ro validate XML before submission?

Yes. Invoices are validated against the UBL 2.1 schema and ANAF Schematron rules before submission. The [Validate Invoice](/api-reference/invoices/validate) endpoint lets you check for errors without submitting.

---

## Security

### What authentication methods are supported?

Email/password, Google OAuth, WebAuthn passkeys, and scoped API keys. Two-factor authentication (TOTP) is available for email/password and Google OAuth logins. See [Security](/getting-started/security).

### How do I report a security vulnerability?

Email [security@storno.ro](mailto:security@storno.ro). Do not open a public issue. We acknowledge reports within 48 hours. See [Security](/getting-started/security).

### Are passkey logins affected by MFA?

No. Passkeys inherently satisfy multi-factor authentication (device possession + biometric/PIN), so no additional MFA challenge is required.

---

## Webhooks

### What events can I subscribe to?

Invoice events (created, issued, sent to the provider, validated, rejected), company events, ANAF sync events, `payment.received` and `anaf.token_created`. Webhooks need the Professional or Business plan. See [List Webhook Event Types](/api-reference/webhooks/list-events) for the complete list and the payload of each event.

### How are webhooks secured?

Each webhook endpoint has its own signing secret. The `X-Webhook-Signature` header holds the hexadecimal HMAC-SHA256 of the raw request body. Verify it on incoming requests to confirm authenticity. See [Webhooks & Events](/concepts/webhooks-events).

### What happens if my webhook endpoint is down?

Storno.ro makes up to 3 attempts per delivery: the first one immediately, the second after 1 minute and the third 5 minutes later. Each attempt times out after 10 seconds. You can inspect delivery history and payloads via [List Webhook Deliveries](/api-reference/webhooks/list-deliveries).
