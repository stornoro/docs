---
title: Stripe App
description: Automatically create e-invoices from Stripe payments using the Storno.ro Stripe marketplace app.
---

# Stripe App

The Storno.ro Stripe app brings e-invoicing directly into your Stripe dashboard. Primarily designed for Romanian e-Factura compliance, it automatically creates e-invoices from Stripe payments and submits them to the e-invoice provider, eliminating manual data entry.

Available on the [Stripe App Marketplace](https://marketplace.stripe.com/).

## Features

- **Automatic e-invoice creation** from Stripe invoices and payments
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

## Setup

### 1. Install the app

Install the Storno.ro app from the Stripe App Marketplace.

### 2. Connect your account

1. Open the app settings in your Stripe dashboard
2. Click the link to open Storno.ro and get a 6-character linking code
3. Enter the code in the app
4. The app exchanges the code for authentication tokens stored securely in Stripe's secret store

### 3. Select a company

After connecting, choose which Storno.ro company to use for invoice creation. The dropdown shows all your companies with their CIF numbers.

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
3. If auto mode is off, you can trigger this manually from the payment detail view

### Status Pipeline

Invoices progress through these statuses:

```
Draft → Issued → Sent to provider → Validated
                                → Rejected (retry available)
```

The app shows the current status with color-coded badges and provides retry functionality for rejected invoices.

## Authentication

The app uses a secure linking code flow:

1. The app generates a temporary 6-character code through Storno.ro
2. You enter the code in the Stripe app settings
3. The code is exchanged for JWT tokens
4. Tokens are stored in Stripe's encrypted secret store (scoped per user)
5. Tokens auto-refresh on expiration
6. On 401 responses, the app automatically clears tokens and prompts re-authentication

### Stripe Permissions

The app requires these Stripe permissions:

| Permission | Purpose |
|------------|---------|
| `customer_read` | Match Stripe customers with Storno.ro clients |
| `charge_read` | View charges for invoice linking |
| `payment_intent_read` | Display payment statuses |
| `invoice_read` | Create e-invoices from Stripe invoices |
| `secret_write` | Securely store authentication tokens |

## Disconnecting

To disconnect your Storno.ro account, go to the app settings and click **Disconnect**. This revokes the authentication tokens and clears all stored credentials from Stripe's secret store.
