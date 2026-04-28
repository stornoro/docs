---
title: Stripe App
description: Automatically create e-invoices from Stripe payments using the Storno.ro Stripe marketplace app.
---

# Stripe App

The Storno.ro Stripe app brings e-invoicing directly into your Stripe dashboard. Primarily designed for Romanian e-Factura compliance, it automatically creates e-invoices from Stripe payments and submits them to the e-invoice provider, eliminating manual data entry.

Available on the [Stripe App Marketplace](https://marketplace.stripe.com/).

## Features

- **Automatic e-invoice creation** from Stripe invoices, payments, and subscriptions
- **Credit note creation** from Stripe refunds
- **Customer matching** — links Stripe customers to Storno.ro clients by CIF, email, or name
- **Provider submission** — submit invoices to the e-invoice provider directly from the Stripe dashboard
- **Status tracking** — monitor invoice lifecycle (draft, issued, sent to provider, validated, rejected)
- **Error recovery** — retry rejected invoices with one click
- **Auto mode** — fully automated invoice creation and provider submission

## Dashboard Views

### Home Overview

The main dashboard shows your invoice pipeline at a glance:

- Status counts: validated, in progress, rejected, issued, draft
- Auto mode toggle
- Tabbed filtering: All, Pending, Errors
- Recent invoices with amounts and status

### Customer Detail

When viewing a Stripe customer, the app shows:

- Matched Storno.ro client details (name, CIF, email, address)
- Customer's invoice history from Storno.ro
- Matching is automatic based on Romanian tax IDs (CIF), EU VAT numbers, email, or name

### Payment Detail

When viewing a Stripe payment, the app shows:

- Payment amount and status
- Linked e-invoices with status visualization
- **Create e-invoice** button if no invoice exists yet
- **Retry at provider** button for rejected invoices
- Provider error details for failed submissions

### Stripe Invoice Detail

When viewing a Stripe invoice, the app shows:

- Invoice amount and status
- Linked Storno.ro e-invoice with full status pipeline visualization (Draft → Issued → Sent to provider → Validated)
- **Create e-invoice** button if no linked Storno.ro invoice exists yet
- **Retry at provider** button for rejected invoices

### Refund Detail

When viewing a Stripe refund, the app shows:

- Refund amount, currency, status, and reason
- Linked Storno.ro credit note (factura de storno) with status
- **Create credit note** button if no linked credit note exists yet
- If the original payment has no parent e-invoice in Storno.ro, the app explains why the credit note cannot be created

### Subscription Detail

When viewing a Stripe subscription, the app shows:

- Subscription plan, amount, interval, and status
- A list of all billing cycles (Stripe invoices), each showing the period, amount, Stripe invoice status, and linked Storno.ro invoice status
- **Create e-invoice** button per cycle for cycles that have not yet been invoiced

## Settings

The settings panel shows:

- Connection status badge (connected / disconnected)
- Connected company name and CIF
- User who authorized the connection and when
- Auto mode toggle
- Disconnect button with confirmation step

## Setup

### 1. Install the app

Install the Storno.ro app from the Stripe App Marketplace.

### 2. Connect your account

1. Open the app settings in your Stripe dashboard
2. Click **Connect Storno.ro** — the app initiates an OAuth 2.0 device authorization flow and opens a Storno.ro consent page in a new tab
3. Sign in to Storno.ro if needed and click **Authorize**
4. The app polls Storno.ro and finishes the connection automatically — no codes to type by hand
5. Authentication tokens are stored securely in Stripe's per-user secret store

### 3. Select a company

During the consent step you choose which Storno.ro company to authorize. The dropdown shows every company accessible to you under the active organization. The authorization is scoped to that single company — to switch to a different company, disconnect and reconnect from the Stripe extension settings.

### 4. Enable auto mode (optional)

Toggle auto mode to automatically create e-invoices and submit them to the e-invoice provider whenever a Stripe payment is completed. When disabled, you can create invoices manually from the payment detail view.

## How It Works

### Customer Matching

The app matches Stripe customers to Storno.ro clients using:

1. **Romanian tax IDs** — extracts CIF from Stripe's `tax_ids` field (types: `ro_tin`, `eu_vat` with RO prefix)
2. **Email address** — matches by customer email
3. **Name** — falls back to name matching

When a match is found, the app displays the full client details and invoice history. If no match is found, you can create the client in Storno.ro first.

### Invoice Creation Flow

1. Stripe payment is completed
2. If auto mode is on, the app automatically:
   - Finds the matching Storno.ro client
   - Creates a draft invoice with the line items from Stripe
   - Issues the invoice (generates XML and PDF)
   - Submits to the e-invoice provider
3. If auto mode is off, you can trigger this manually from the payment detail view, the Stripe invoice detail view, or per billing cycle in the subscription detail view

### Credit Note Flow

When a Stripe refund exists for a payment that has a linked Storno.ro invoice, the app can create a credit note (factura de storno):

1. Open the refund in your Stripe dashboard
2. The app checks whether a linked credit note already exists in Storno.ro
3. If not, click **Create credit note** — the app resolves the refund → charge → Stripe invoice → parent Storno.ro invoice chain and creates a credit note
4. The credit note is then submitted to the e-invoice provider following the same status pipeline as regular invoices

### Status Pipeline

Invoices and credit notes progress through these statuses:

```
Draft → Issued → Sent to provider → Validated
                                 → Rejected (retry available)
```

The app shows the current status with color-coded badges and provides retry functionality for rejected invoices.

## Authentication

The app uses the OAuth 2.0 Device Authorization Grant ([RFC 8628](https://datatracker.ietf.org/doc/html/rfc8628)):

1. The app calls `POST /api/v1/stripe-app/oauth/device` to receive a `device_code` (long, opaque, polled by the app) and a `user_code` (short, displayed only as a fallback)
2. The app opens `https://app.storno.ro/stripe-link?code={user_code}` in a new tab
3. The user signs in to Storno.ro, selects which company to authorize, and approves the request via `POST /api/v1/stripe-app/oauth/approve` (body: `user_code`, `company_id`, `approve: true`). The server verifies that the user has access to the requested company before recording the grant.
4. The app polls `POST /api/v1/stripe-app/token` with `grant_type=device_code` until it receives access and refresh tokens
5. Tokens are stored in Stripe's encrypted secret store (scoped per user)
6. Tokens auto-refresh on expiration
7. On 401 responses, the app automatically clears tokens and prompts re-authentication

### Stripe Permissions

The app requires these Stripe permissions:

| Permission | Purpose |
|------------|---------|
| `customer_read` | Match Stripe customers with Storno.ro clients |
| `charge_read` | View charges for invoice linking and credit note creation |
| `payment_intent_read` | Display payment statuses |
| `invoice_read` | Create e-invoices from Stripe invoices |
| `subscription_read` | View subscription billing cycles |
| `refund_read` | View refunds for credit note creation |
| `secret_write` | Securely store authentication tokens |

## Disconnecting

To disconnect your Storno.ro account, go to the app settings and click **Disconnect**. You will be asked to confirm before the action is taken. This revokes the authentication tokens and clears all stored credentials from Stripe's secret store.
