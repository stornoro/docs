---
title: Environment Variables
description: Complete reference for all backend environment variables used in Storno.ro deployments.
---

# Environment Variables

Complete reference for configuring a Storno.ro deployment. All variables are set in `.env.local` (development) or passed as environment variables (Docker / production).

---

## Core

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_SECRET` | Yes | — | Symfony application secret. Use a random 32+ character string. |
| `APP_ENV` | No | `dev` | Environment: `dev`, `prod`, or `test` |
| `DATABASE_URL` | Yes | — | MySQL connection string, e.g. `mysql://user:pass@127.0.0.1:3306/storno` |
| `FRONTEND_URL` | Yes | — | Frontend URL for CORS origins and email links, e.g. `https://app.storno.ro` |

## Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_PASSPHRASE` | Yes | — | Passphrase for JWT RSA key pair |
| `REGISTRATION_ENABLED` | No | `1` | Set to `0` to disable public registration |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth client ID for Google Sign-In. In Docker Compose, this single value is mapped to `OAUTH_GOOGLE_CLIENT_ID` (backend) and `NUXT_PUBLIC_GOOGLE_CLIENT_ID` (frontend) automatically. |
| `GOOGLE_CLIENT_SECRET` | No | — | Google OAuth client secret. Mapped to `OAUTH_GOOGLE_CLIENT_SECRET` (backend) in Docker Compose. |
| `TURNSTILE_SECRET_KEY` | No | — | Cloudflare Turnstile secret key for bot protection on login/register |

## ANAF / e-Factura

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OAUTH_ANAF_CLIENT_ID` | No | — | ANAF OAuth client ID for e-Factura API access |
| `OAUTH_ANAF_CLIENT_SECRET` | No | — | ANAF OAuth client secret |
| `OAUTH_ANAF_CLIENT_REDIRECT_URI` | No | — | OAuth callback URL registered with ANAF |
| `REDIRECT_AFTER_OAUTH` | No | — | Frontend URL to redirect to after ANAF OAuth flow |

## Email

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MAILER_DSN` | Yes | — | Mail transport DSN, e.g. `ses+smtp://KEY:SECRET@email.eu-west-1.amazonaws.com` |
| `MAIL_FROM` | No | `noreply@storno.ro` | Default sender email address |

## Storage (S3)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_S3_BUCKET` | Yes | — | S3 bucket name for file storage (PDFs, XMLs, attachments) |
| `AWS_DEFAULT_REGION` | No | `us-east-1` | AWS region for S3 |
| `AWS_ACCESS_KEY_ID` | Yes | — | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | — | AWS IAM secret key |
| `STORAGE_ENCRYPTION_KEY` | No | — | Encryption key for user-provided storage credentials |

## Queue & Cache

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URL. Used for cache and message queue in production. |

{% callout type="note" %}
In development, the message queue and cache use the filesystem/database automatically. Redis is only required in production.
{% /callout %}

## Real-time (Centrifugo)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CENTRIFUGO_API_URL` | No | — | Centrifugo HTTP API URL, e.g. `http://centrifugo:8000/api` |
| `CENTRIFUGO_API_KEY` | No | — | Centrifugo API key for server-to-server calls |
| `CENTRIFUGO_TOKEN_HMAC_SECRET` | No | — | HMAC secret for generating client connection tokens |

## Stripe (Payments)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | No | — | Stripe API secret key |
| `STRIPE_PUBLISHABLE_KEY` | No | — | Stripe publishable key (exposed to frontend) |
| `STRIPE_WEBHOOK_SECRET` | No | — | Signing secret for Stripe webhook verification |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | No | — | Signing secret for Stripe Connect webhooks |
| `STRIPE_PLATFORM_FEE_PERCENT` | No | `2.0` | Platform fee percentage for Stripe Connect payments |

## PDF & Validation

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WKHTMLTOPDF_PATH` | No | `/usr/local/bin/wkhtmltopdf` | Path to wkhtmltopdf binary for PDF generation |
| `JAVA_SERVICE_URL` | No | `http://127.0.0.1:8082` | Java service URL for UBL XML validation and digital signatures |

## Self-Hosted

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LICENSE_KEY` | Yes | — | License key for self-hosted instances. Obtain from [Licensing](/concepts/licensing). |
| `LICENSE_SERVER_URL` | No | `https://api.storno.ro` | License validation server URL |

---

## Minimal Configuration

For a minimal self-hosted deployment, these variables are required:

```bash
APP_SECRET=your-random-secret-string-here
APP_ENV=prod
DATABASE_URL=mysql://storno:password@db:3306/storno
JWT_PASSPHRASE=your-jwt-passphrase
FRONTEND_URL=https://your-domain.com
MAILER_DSN=smtp://user:pass@smtp.example.com:587
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret
LICENSE_KEY=your-license-key
```

Generate the JWT key pair after setting the passphrase:

```bash
php bin/console lexik:jwt:generate-keypair
```
