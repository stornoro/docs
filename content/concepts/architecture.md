---
title: Architecture
description: System architecture, service topology, and data flow in Storno.ro.
---

# Architecture

Storno.ro is a multi-repo platform with several applications and supporting infrastructure services. This page describes how the components fit together.

---

## Service Topology

```
                    ┌──────────────────────────────┐
                    │       Nginx (reverse proxy)   │
                    │  app.storno.ro  api.storno.ro │
                    └──────┬───────────────┬────────┘
                           │               │
                    ┌──────▼──────┐  ┌─────▼──────┐
                    │  Frontend   │  │  Backend    │
                    │  Nuxt 4     │  │ Symfony 7.4 │
                    │  :3000      │  │  :8000      │
                    └──────┬──────┘  └──┬──┬──┬────┘
                           │            │  │  │
              ┌────────────┘     ┌──────┘  │  └──────┐
              │                  │         │         │
        ┌─────▼─────┐    ┌──────▼──┐  ┌───▼───┐  ┌──▼────────┐
        │  Mobile    │    │ MySQL   │  │ Redis │  │ Centrifugo │
        │ React      │    │ 8.0     │  │ 7     │  │ v5         │
        │ Native     │    └─────────┘  └───────┘  └────────────┘
        └────────────┘
```

| Service | Repository | Technology | Role |
|---------|-----------|-----------|------|
| **Backend** | [stornoro/storno](https://github.com/stornoro/storno) | PHP 8.2 + Symfony 7.4 + Nginx | REST API, business logic, async workers |
| **Frontend** | [stornoro/storno](https://github.com/stornoro/storno) | Nuxt 4 (Vue 3, SSR) | Web application with server-side rendering |
| **Mobile** | [stornoro/storno-mobile-app](https://github.com/stornoro/storno-mobile-app) | React Native + Expo | iOS and Android mobile app |
| **Docs** | [stornoro/docs](https://github.com/stornoro/docs) | Next.js + Markdoc | API documentation |
| **CLI** | [stornoro/storno-cli](https://github.com/stornoro/storno-cli) | TypeScript (MCP) | CLI tool for AI assistants |
| **MySQL** | — | 8.0 | Primary database (57 entities) |
| **Redis** | — | 7.x | Cache, message queue, rate limiting, locks |
| **Centrifugo** | — | v5 | WebSocket server for real-time updates |

The backend container bundles PHP-FPM, Nginx, Supervisor (worker management), and a Java 17 runtime for UBL XML validation and digital signature verification.

---

## Backend Structure

The Symfony backend is organized into domain-oriented controllers, entities, and services:

| Layer | Count | Examples |
|-------|-------|---------|
| Controllers | 68 | Invoices, Auth, E-Invoice, Webhooks, Admin |
| Entities | 57 | Invoice, Client, Payment, Company, User |
| Services | 95 | PDF generation, e-Factura sync, email, import |
| Message handlers | 17 | Async PDF, ANAF submission, webhook dispatch |
| Console commands | 21 | Cron jobs, maintenance, data migration |

### Key Service Domains

- **Anaf/** (11 services) — UBL XML generation, ANAF SPV communication, XML parsing, validation
- **Import/** (22 services) — Data migration from 12 invoicing systems (SmartBill, Ciel, eMag, etc.)
- **Storage/** (5 services) — Multi-backend file storage with encryption (S3, local)
- **Export/** (3 services) — CSV, Saga XML, ZIP archive exports
- **Backup/** (3 services) — Company-level backup and restore

---

## Data Flow

### Invoice Lifecycle

```
Draft → Issued → Sent to ANAF → Validated/Rejected
  │        │          │                │
  │        │          │                └─ Centrifugo → real-time UI update
  │        │          └─ Async: SubmitToAnafMessage (Redis queue)
  │        └─ Async: GeneratePdfMessage (Redis queue)
  └─ Sync: Validate + persist to MySQL
```

1. **Create draft** — User creates invoice via API. Data validated and persisted to MySQL.
2. **Issue** — Generates UBL 2.1 XML, stores to S3, dispatches async PDF generation.
3. **Submit to provider** — Async worker uploads XML to e-invoice provider. Status set to `sent_to_provider`.
4. **Provider sync** — Cron job polls provider for status updates. Invoice marked `validated` or `rejected`.
5. **Real-time update** — Each status change publishes to Centrifugo. Connected clients update instantly.

### e-Factura Sync

A cron job runs every 15 minutes to synchronize with ANAF:

```
Cron → EFacturaSyncService
  ├─ Check outgoing invoice statuses (validated / rejected)
  ├─ Download incoming invoices (auto-create Invoice + Client + Products)
  ├─ Create EFacturaMessage audit records
  └─ Publish real-time notifications via Centrifugo
```

Incoming invoices from suppliers are automatically parsed from UBL XML into full Invoice entities with line items.

### PDF Generation

PDF generation uses a dual strategy for reliability:

1. **Primary**: HTTP request to Java service (~100ms) — UBL XML → PDF
2. **Fallback**: wkhtmltopdf shell command (~2–4s) — HTML template → PDF

Both paths store the resulting PDF in S3 via Flysystem.

---

## Real-Time Updates

Centrifugo provides WebSocket-based real-time updates to all connected clients.

### Channel Structure

| Channel | Purpose | Features |
|---------|---------|----------|
| `invoices:{company}` | Invoice status changes | History (20 messages, 2 min TTL) |
| `notifications:{user}` | User notifications | Presence, history (50 messages, 1 hour TTL), recovery |
| `dashboard:{company}` | Dashboard stats | Presence tracking |
| `user:{user}` | User-specific events | History (10 messages, 1 min TTL) |

### Publishing Flow

The backend queues messages during request processing and flushes them at the end of the request lifecycle:

```
Controller / Message Handler
  ↓
CentrifugoService.queue(channel, data)    ← buffer messages
  ↓
CentrifugoFlushSubscriber (kernel.terminate / console.terminate)
  ↓
CentrifugoService.flush()                 ← batch HTTP POST to Centrifugo
  ↓
Centrifugo broadcasts to subscribed clients
```

This batching approach minimizes HTTP calls to Centrifugo — a single request can carry updates for multiple channels.

---

## Async Job Processing

Background jobs are processed via Symfony Messenger with Redis as the transport:

| Message | Purpose |
|---------|---------|
| `SubmitToAnafMessage` | Upload invoice XML to ANAF |
| `CheckAnafStatusMessage` | Poll ANAF for submission status |
| `SyncCompanyMessage` | Full e-Factura sync for a company |
| `GeneratePdfMessage` | Generate invoice PDF |
| `GenerateZipExportMessage` | Create ZIP archive of invoices |
| `SendExternalNotificationMessage` | Send push notifications |
| `SendPushNotificationMessage` | Firebase push to mobile devices |
| `ProcessImportMessage` | Import data from external systems |
| `DispatchWebhookMessage` | Deliver webhook payloads |
| `DeleteUserAccountMessage` | GDPR account deletion |
| `DeleteCompanyDataMessage` | Company data removal |
| `ResetCompanyDataMessage` | Company data reset |
| `SendInvitationEmailMessage` | Organization invitations |
| `SendEmailConfirmationMessage` | Email verification |

Supervisor runs the Messenger worker process, which continuously polls the Redis queue and processes messages.

---

## Multi-Tenancy

```
Organization (root tenant)
├─ User[] (members with roles)
└─ Company[] (business entities)
   ├─ Invoice[], ProformaInvoice[], DeliveryNote[]
   ├─ Client[], Supplier[], Product[]
   ├─ Payment[], BankAccount[]
   ├─ DocumentSeries[], VatRate[]
   ├─ WebhookEndpoint[]
   ├─ EmailTemplate[]
   └─ AnafToken (e-Factura credentials)
```

- **Organization** is the billing and membership boundary
- **Company** is the data isolation boundary — all API requests require an `X-Company` header
- Users can belong to one organization with access to multiple companies
- RBAC with 5 roles (Owner, Admin, Accountant, Member, Viewer) and 40+ granular permissions

See [Multi-Tenancy](/concepts/multi-tenancy) for details.

---

## Authentication

Multiple authentication methods feed into a unified JWT token flow:

```
Email/Password ──┐
Google OAuth ────┤──→ [MFA Challenge?] ──→ JWT Token ──→ API Access
Passkeys ────────┤         │
API Keys ────────┘         └─ TOTP or Backup Code
```

- Email/password and Google OAuth trigger MFA if enabled
- Passkeys skip MFA (inherently multi-factor)
- API keys bypass MFA (scoped programmatic access)
- JWT tokens are RSA-signed (RS256) with 1-hour expiry and 30-day refresh tokens

See [Authentication](/getting-started/authentication) for details.

---

## Deployment

### Docker (Recommended)

Five containers managed via Docker Compose:

```bash
docker compose up -d    # backend, frontend, db, redis, centrifugo
```

### Kubernetes

Helm chart available with configurable resource limits, persistent volumes, and ingress rules. See [System Requirements](/getting-started/system-requirements) for resource allocation.

### CI/CD

Each repository has its own GitHub Actions workflow that builds Docker images and deploys via SSH with a blue-green strategy:

1. Build and push images to GHCR
2. Start new containers on alternate ports
3. Run health checks
4. Swap traffic if healthy, rollback if not

Backend and frontend are deployed from the monorepo (`stornoro/storno`). Docs and other services deploy independently from their own repositories.
