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

Authenticated requests allow up to 50,000 requests with a refill rate of 500 per 2 minutes. Authentication endpoints have stricter limits (e.g., 5 login attempts per minute). See [Rate Limiting](/getting-started/rate-limiting).

### Can I use API keys instead of JWT tokens?

Yes. Create scoped API keys via [API Keys](/api-reference/api-keys/create) for programmatic access. API keys don't expire but can be revoked instantly. Include the key as a Bearer token: `Authorization: Bearer sk_...`

### How does pagination work?

List endpoints accept `page` and `limit` query parameters. Responses include `total`, `page`, `limit`, and `pages` metadata. See [Pagination](/getting-started/pagination).

---

## Self-Hosting

### Can I self-host Storno.ro?

Yes. Self-hosting requires a license key. Deploy with Docker Compose in minutes. See [Self-Hosting](/getting-started/self-hosting).

### What data is sent to Storno.ro from my self-hosted instance?

Nothing. License keys are signed JWTs validated offline — no network calls are made. No user data, invoices, or business information ever leaves your server.

### Does the license require internet connectivity?

No. License keys are signed JWTs validated entirely offline on your server. No network calls are made to the SaaS server. Your instance works fully offline, air-gapped, or behind a firewall.

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

Invoice lifecycle events (created, issued, submitted, validated, rejected, paid), payment events, client events, and more. See [List Webhook Event Types](/api-reference/webhooks/list-events) for the complete list.

### How are webhooks secured?

Each webhook endpoint has an HMAC-SHA256 signing secret. Verify the `X-Webhook-Signature` header on incoming requests to confirm authenticity. See [Webhooks & Events](/concepts/webhooks-events).

### What happens if my webhook endpoint is down?

Storno.ro retries failed deliveries up to 3 times with exponential backoff. You can inspect delivery history and payloads via [List Webhook Deliveries](/api-reference/webhooks/list-deliveries).
