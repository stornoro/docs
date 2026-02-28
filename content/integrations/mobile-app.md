---
title: Mobile App
description: Manage invoices, clients, and e-invoice submissions on the go with the Storno.ro mobile app for iOS and Android.
---

# Mobile App

The Storno.ro mobile app gives you full access to your invoicing workflow from your phone. Available for iOS and Android.

## Features

- **Invoice management** — create, view, edit, issue, and email invoices
- **Proforma invoices** — create quotes and convert to invoices
- **Delivery notes** — manage shipping documents
- **Receipts** — track bonuri fiscale (Romanian fiscal receipts)
- **Recurring invoices** — set up automated invoice schedules
- **Client and supplier management** — full CRUD with search
- **Product catalog** — manage your products and services
- **Real-time sync** — live updates via WebSocket (Centrifugo)
- **Push notifications** — get notified about e-invoice validation, payments, and more
- **Multi-company support** — switch between companies instantly
- **Biometric authentication** — Face ID on iOS, fingerprint on Android
- **Offline support** — cached data available without network

## Authentication

The app supports multiple login methods:

| Method | Description |
|--------|-------------|
| Email + password | Standard authentication |
| Google Sign-In | OAuth via Google account |
| Passkeys | WebAuthn-based passwordless login |
| Biometric | Face ID / fingerprint unlock after initial login |
| MFA | Optional TOTP-based two-factor authentication with backup codes |

After initial login, you can enable biometric unlock so subsequent app opens only require a fingerprint or face scan.

## Dashboard

The home screen shows:

- **Revenue statistics** — totals and trends
- **Recent invoices** — quick access to latest activity
- **E-invoice sync status** — current sync state and last sync time
- **Company selector** — switch between companies from the header

## Invoice Workflow

### Creating an invoice

1. Tap **+** from the invoices tab
2. Select a client (search by name or CIF)
3. Add line items from your product catalog or create custom ones
4. Set dates, currency, payment terms, and series
5. Save as draft or issue immediately

### Issuing and submitting

- **Issue** — finalizes the invoice, generates UBL XML and PDF
- **Submit to provider** — sends the XML to e-invoice provider (requires valid provider token)
- **Email** — send the invoice to your client with PDF/XML attachments

### Status tracking

The app displays the full invoice lifecycle with status badges:

| Status | Description |
|--------|-------------|
| `draft` | Editable, not yet finalized |
| `issued` | Finalized with XML and PDF generated |
| `sent_to_provider` | Submitted to e-invoice provider |
| `validated` | Provider accepted the invoice |
| `rejected` | Provider rejected -- tap to see errors |
| `cancelled` | Cancelled with reason |

## Real-Time Updates

The app connects to Centrifugo WebSocket for live updates:

- New invoices appear instantly when synced from e-invoice provider
- Status changes (validated, rejected) update in real-time
- Payment recordings reflect immediately
- Company data changes sync across devices

## Push Notifications

Register your device to receive push notifications for:

- **Invoice validated** — e-invoice provider accepted your invoice
- **Invoice rejected** — e-invoice provider rejected your invoice (with error details)
- **Invoice overdue** — past due date
- **Payment received** — payment recorded on an invoice
- **Invoice issued** — new invoice finalized

Notification preferences are configurable per channel (push, email, in-app) from the settings screen.

## E-Invoice Provider Integration

The app provides full e-invoice provider integration:

- View provider token status and expiry
- Trigger manual sync with the e-invoice provider
- Monitor sync progress
- View e-invoice messages
- Submit invoices to the provider
- Track validation and rejection statuses

## Company Registry Lookup

Look up Romanian companies by CIF directly from the app. The registry lookup returns:

- Company name and legal form
- Registered address
- VAT registration status
- ANAF fiscal attributes

This is useful when adding new clients — enter their CIF and the app auto-fills their details.

## Tech Stack

Built with React Native and Expo for cross-platform compatibility:

- **React Native 0.81** with React 19
- **Expo 54** with file-based routing (Expo Router)
- **React Query** for data fetching and caching
- **Zustand** for state management
- **Sentry** for error tracking
- **i18next** for internationalization
