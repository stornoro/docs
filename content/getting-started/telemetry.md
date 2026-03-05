---
title: Telemetry
description: What telemetry data Storno.ro collects, how it is used, and how to opt out.
---

# Telemetry

Storno.ro collects anonymous usage telemetry from mobile clients to improve the product. Telemetry is **opt-out** and **never includes** customer financial data, invoice contents, client details, or any personally identifiable information (PII).

---

## What Data Is Collected

Each telemetry event contains:

| Field | Description | Example |
|-------|-------------|---------|
| `event` | Action name (dot-separated) | `invoice.created` |
| `properties` | Optional metadata about the action | `{ "method": "email" }`, `{ "refund": true }` |
| `platform` | Client platform identifier | `mobile`, `web` |
| `app_version` | App version string | `1.4.2` |
| `timestamp` | ISO 8601 timestamp of the event | `2026-03-05T14:30:00Z` |
| `user_id` | Internal user UUID | — |
| `company_id` | Active company UUID (from `X-Company` header) | — |

### Events Tracked

**Invoicing**

| Event | Properties | Triggered When |
|-------|-----------|---------------|
| `invoice.created` | `refund` (boolean) | A new invoice is created |
| `invoice.issued` | — | An invoice is finalized |
| `invoice.sent_email` | — | An invoice is emailed to a client |
| `invoice.payment_recorded` | — | A payment is recorded on an invoice |
| `invoice.exported_pdf` | — | An invoice PDF is downloaded |
| `invoice.deleted` | — | An invoice is deleted |

**Clients**

| Event | Properties | Triggered When |
|-------|-----------|---------------|
| `client.created` | `fromRegistry` (boolean) | A new client is created |
| `client.updated` | — | A client is updated |
| `client.deleted` | — | A client is deleted |

**e-Factura**

| Event | Properties | Triggered When |
|-------|-----------|---------------|
| `efactura.submitted` | — | An invoice is submitted to ANAF |
| `efactura.token_connected` | — | ANAF OAuth token is connected |
| `efactura.sync_triggered` | — | e-Factura sync is manually triggered |

**Documents**

| Event | Properties | Triggered When |
|-------|-----------|---------------|
| `document.proforma_created` | — | A proforma invoice is created |
| `document.receipt_created` | — | A receipt is created |
| `document.delivery_note_created` | — | A delivery note is created |

**Account**

| Event | Properties | Triggered When |
|-------|-----------|---------------|
| `account.logged_in` | `method` (`email`, `google`, `passkey`) | User logs in |
| `account.registered` | — | New account is created |
| `account.company_switched` | — | User switches active company |
| `account.language_changed` | — | User changes language |
| `account.push_enabled` | — | Push notifications are enabled |

---

## What Is NOT Collected

- Invoice amounts, line items, or totals
- Client names, addresses, CUI/CIF, or bank accounts
- Product names or prices
- Email addresses or phone numbers
- File contents (PDFs, XMLs)
- IP addresses or geolocation
- Device identifiers or advertising IDs

---

## How Data Is Sent

Events are batched on the client and sent to `POST /api/v1/telemetry` in groups of up to 100 events. The mobile app flushes events every 30 seconds or when the batch reaches 10 events, whichever comes first.

Telemetry requests are fire-and-forget — failures are silently ignored and never block the user interface.

---

## How Data Is Used

Telemetry helps us:

- **Identify popular features** — prioritize improvements for the most-used workflows
- **Detect underused features** — investigate whether features need better discoverability or UX
- **Monitor adoption** — track platform usage (mobile vs. web) and app version distribution
- **Improve reliability** — spot patterns in user workflows that may reveal edge cases

Telemetry data is only accessible to Storno.ro platform administrators via the admin dashboard.

---

## Opting Out

### Self-hosted instances

Telemetry is collected by the SaaS platform. Self-hosted instances do not send telemetry to Storno.ro — all data stays on your infrastructure.

If you run a self-hosted instance and want to disable telemetry collection entirely, set the environment variable:

```bash
TELEMETRY_ENABLED=false
```

This disables the `POST /api/v1/telemetry` endpoint. Events sent by clients will be silently discarded.

### SaaS

Telemetry collection on the SaaS platform is enabled by default. If you would like your data excluded, contact [support@storno.ro](mailto:support@storno.ro).
