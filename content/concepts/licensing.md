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

When you deploy Storno.ro on your own infrastructure via Docker, a **license key** connects your instance to your SaaS subscription. The license key is a signed JWT that is validated entirely offline — no phone-home to the SaaS server is required.

- Requires `LICENSE_KEY` environment variable
- Validated offline via RSA signature verification (no network calls)
- Plan, features, and expiration are embedded in the JWT
- Billing (subscription changes, upgrades) redirects to the SaaS

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

The instance validates the JWT signature locally using the embedded public key — no network request is made. Validation runs on startup and periodically via `app:license:sync`.

### 4. Sync

On successful validation, the local organization's plan is updated to match the claims in the JWT. Features and limits are enforced locally.

### 5. Expire

License keys have an expiration date embedded in the JWT. When a key expires, the instance falls back to the Community (free) plan. The owner can generate a new key from the SaaS dashboard.

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

## Offline by Design

License keys are signed JWTs validated entirely on your server. **No network calls are made to the SaaS server for license validation.** Your self-hosted instance works fully offline, air-gapped, or behind a firewall.

| Scenario | Behavior |
|----------|----------|
| Valid JWT license | Plan and features applied from JWT claims |
| Expired JWT license | Falls back to Community (free) plan |
| Invalid or tampered JWT | Falls back to Community (free) plan |

## Data Privacy

**No data is transmitted to the SaaS server for license validation.** The JWT is verified locally using cryptographic signature verification. Your data stays entirely on your self-hosted infrastructure.

## API Reference

- [Validate License](/api-reference/licensing/validate) — Self-hosted validation endpoint (no auth)
- [Create License Key](/api-reference/licensing/create-key) — Generate a new key (owner only)
- [List License Keys](/api-reference/licensing/list-keys) — View all keys for your organization
- [Revoke License Key](/api-reference/licensing/revoke-key) — Deactivate a key
