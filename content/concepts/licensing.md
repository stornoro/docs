---
title: Licensing
description: How Storno.ro licensing works for SaaS and self-hosted deployments.
---

# Licensing

Storno.ro supports two deployment models: **SaaS** (hosted at app.storno.ro) and **self-hosted** (Docker on your own infrastructure). The licensing system bridges both models, ensuring self-hosted instances receive the correct plan and features based on the owner's subscription.

## Deployment Modes

### SaaS Mode

When you use Storno.ro at `app.storno.ro`, billing and plan management happen directly through Stripe. Your organization's subscription status is updated in real-time via webhooks.

- Subscription managed via Stripe Checkout and Customer Portal
- Plan changes take effect immediately
- No license key needed

### Self-Hosted Mode

When you deploy Storno.ro on your own infrastructure via Docker, the instance runs without a license key as the **Community edition**. Community has the Starter plan limits (3 companies, 3 users, 500 invoices per month) and no time limit. It supports a single organization.

A **license key** connects your instance to your SaaS subscription and unlocks the plan it was issued for. A key issued from the SaaS dashboard is a signed JWT that the instance validates offline.

- Set the key in the `LICENSE_KEY` environment variable
- A JWT key is validated with an RSA signature check and needs no network call
- Plan, features, and expiration are embedded in the JWT
- Billing (subscription changes, upgrades) redirects to the SaaS
- Creating license keys requires a plan with the self-hosting license (Business)

## License Key Lifecycle

```
┌─────────────────┐     Generate Key      ┌──────────────────┐
│   SaaS Account   │ ─────────────────────▶ │   License Key     │
│   (Owner)        │                        │   (Signed JWT)    │
└─────────────────┘                        └──────────────────┘
                                                    │
                                             Configure in
                                             Docker .env
                                                    │
                                                    ▼
                                           ┌──────────────────┐
                                           │  Self-Hosted      │
                                           │  Instance         │
                                           │  (offline         │
                                           │   validation)     │
                                           └──────────────────┘
```

### 1. Generate

The organization owner generates license keys from the SaaS dashboard (**Settings → Licensing**) or via the API (`POST /api/v1/licensing/keys`). Each key is a signed JWT containing the plan, features, and expiration.

### 2. Configure

The key is placed in the self-hosted instance's `.env` file:

```bash
LICENSE_KEY=eyJhbGciOiJSUzI1NiI...your-jwt-key
```

### 3. Validate

The instance validates the JWT signature locally using the embedded public key. No network request is made for a JWT key. The `app:license:sync` command applies the result to the local organization and runs every 6 hours.

### 4. Sync

On successful validation, the local organization's plan is updated to match the claims in the JWT. Features and limits are enforced locally.

### 5. Expire

License keys have an expiration date embedded in the JWT. When a key expires or is invalid, the instance falls back to the Starter plan limits, the same as Community. The owner can generate a new key from the SaaS dashboard.

## Plans & Features

Storno.ro offers four plan tiers. Each tier includes everything from the tier below, plus additional features.

### Freemium (Free)

Available to all users with no time limit.

| Feature | Limit |
|---------|-------|
| e-Factura sync | Every 24 hours |
| PDF generation | Yes |
| Email sending | Yes |
| Email templates | Yes |
| Reports | Yes |
| Exchange rates | Yes |
| Companies | 1 |
| Users per organization | 3 |
| Invoices per month | 100 |

### Starter (19 RON/month)

Everything in Freemium, plus:

| Feature | Limit |
|---------|-------|
| e-Factura sync | Every 12 hours |
| Payment links | Yes |
| Mobile app | Yes |
| Import / Export | Yes |
| Companies | 3 |
| Invoices per month | 500 |

### Professional (39 RON/month)

Everything in Starter, plus:

| Feature | Limit |
|---------|-------|
| e-Factura sync | Every 4 hours |
| Invoices per month | Unlimited |
| Recurring invoices | Yes |
| Backup & restore | Yes |
| Bank statements | Yes |
| Webhooks | Yes |
| Companies | 10 |
| Users per organization | 10 |

### Business (69 RON/month)

Everything in Professional, plus:

| Feature | Limit |
|---------|-------|
| e-Factura sync | Every hour |
| Companies | Unlimited |
| Users per organization | Unlimited |
| Realtime notifications | Yes |
| White-label branding | Yes |
| Self-hosting license | Yes |
| Priority support | Yes |

### Feature Enforcement

All plan limits are enforced at the API level. When a request requires a feature not available on the current plan, the API returns a `402 Payment Required` response with a `PLAN_LIMIT` error code:

```json
{
  "error": "Recurring invoices are not available on your plan.",
  "code": "PLAN_LIMIT"
}
```

Limits apply equally to web, mobile, and API key authenticated requests.

## What a license key sends

| Key type | Network use |
|----------|-------------|
| JWT license key | None for validation. The signature is checked locally. |
| Legacy non-JWT key | `POST /api/v1/licensing/validate` on the SaaS server every 6 hours. The request carries the key, the instance URL and four counters: organizations, active users, companies and invoices created this month. |

If the SaaS server cannot be reached, an instance with a legacy key keeps its last result for 7 days. After that its features are limited until it reconnects.

Independently of the license, the instance asks the SaaS server for the latest version (`GET /api/v1/version`) and caches the answer for 6 hours.

| Scenario | Behavior |
|----------|----------|
| Valid JWT license | Plan and features applied from JWT claims |
| Expired JWT license | Starter plan limits |
| Invalid or tampered JWT | Starter plan limits |
| No license key | Community edition, Starter plan limits |

Invoices, clients and other business data are never sent to the SaaS server.

## API Reference

- [Validate License](/api-reference/licensing/validate) — Self-hosted validation endpoint (no auth)
- [Create License Key](/api-reference/licensing/create-key) — Generate a new key (owner only)
- [List License Keys](/api-reference/licensing/list-keys) — View all keys for your organization
- [Revoke License Key](/api-reference/licensing/revoke-key) — Deactivate a key
