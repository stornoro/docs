---
title: ANAF Integration
description: How Storno.ro integrates with Romania's ANAF e-Factura system for electronic invoicing.
---

# ANAF Integration

Storno.ro integrates with Romania's ANAF (Agenția Națională de Administrare Fiscală) e-Factura system for electronic invoice submission and retrieval.

## Overview

The e-Factura system requires all B2B invoices in Romania to be submitted electronically in UBL 2.1 XML format. Storno.ro handles:

1. **XML Generation** — Converts invoice data to UBL 2.1 compliant XML
2. **Submission** — Uploads XML to ANAF's SPV (Spațiul Privat Virtual) platform
3. **Status Tracking** — Monitors submission status (validated, rejected, etc.)
4. **Incoming Invoices** — Downloads and parses invoices received from suppliers
5. **Message Monitoring** — Tracks all e-Factura messages from ANAF

## Authentication with ANAF

ANAF uses OAuth 2.0 for API authentication. Storno.ro supports two methods for obtaining ANAF tokens:

### Accountant Method (Direct OAuth)

The user authenticates directly with ANAF through the OAuth flow:

1. Initiate the OAuth flow: `GET /api/connect/anaf`
2. User logs in on ANAF's website
3. ANAF redirects back with an authorization code
4. Storno.ro exchanges the code for an access token
5. Token is validated against all user's companies

### Device Method (Link-based)

For users who can't complete the OAuth flow on the same device (e.g., mobile users):

1. Create a token link: `POST /api/v1/anaf/token-links`
2. Share the link URL with the person who has ANAF access
3. They open the link, complete ANAF OAuth on their device
4. Read the result: `GET /api/v1/anaf/token-links/{linkToken}/result` (it names the token the link produced)
5. Once completed, the token is automatically associated with the user

```bash
# Create a token link
curl -X POST https://api.storno.ro/api/v1/anaf/token-links \
  -H "Authorization: Bearer {token}"

# Response
{
  "linkToken": "abc123...",
  "linkUrl": "https://app.storno.ro/anaf/link/abc123...",
  "companyId": null,
  "exclusive": false,
  "expiresAt": "2026-02-17T12:00:00Z"
}
```

### Which token serves which company

By default tokens are shared: any token of the organization can serve any of its companies, the ones already used for the CIF first. One certificate with SPV rights on every company covers the whole account, and a company added later works without a new authorization.

A link created with `exclusive: true` binds its token to one company instead. That company uses only its own token, the token serves no other company, and deleting it revokes that company alone. This is the mode for applications that invoice on behalf of many independent businesses. See [ANAF Token Links](/api-reference/anaf/token-links#shared-and-exclusive-tokens).

### Token Lifecycle

- Storno.ro tracks the expiry of every token and refreshes it on its own: a job runs every 12 hours and renews any token that expires within 5 days and has a refresh token. Tokens obtained through the OAuth flow or a token link have one; a token pasted by hand through `POST /api/v1/anaf/tokens` does not and is never renewed
- When the refresh fails (certificate expired, access withdrawn at ANAF) the owner of the token is notified and a new authorization is needed. The owner is also reminded 7 days before a token without a refresh token expires, and 2 days before a refreshable token that still could not be renewed
- `GET /api/v1/anaf/tokens` returns `expiresAt` and `isExpired` for each token

## Sync Process

### Automatic Sync

When sync is enabled for a company (`syncEnabled: true`), Storno.ro periodically:

1. Checks for new outgoing invoice statuses (validated/rejected)
2. Downloads new incoming invoices
3. Parses incoming XML to create invoice, client, and product records
4. Sends notifications for new invoices and status changes

### Manual Sync

Trigger a sync manually:

```bash
curl -X POST https://api.storno.ro/api/v1/sync/trigger \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

### Sync Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `syncEnabled` | Whether automatic sync is active | `false` |
| `syncDaysBack` | How many days back to sync on first run | `60` |
| `efacturaDelayHours` | Delay before auto-submitting issued invoices | `null` (immediate) |

## Invoice Submission Flow

```
Draft → Issue → (optional delay) → Submit to ANAF → ANAF Processing → Validated/Rejected
```

1. **Issue** (`POST /invoices/{uuid}/issue`) — Validates data, generates UBL XML, generates PDF
2. **Submit** (`POST /invoices/{uuid}/submit`) — Uploads XML to ANAF
3. **Status Update** — Sync process checks for ANAF response
4. **Validated** — ANAF accepted the invoice; it's now in the national e-Factura system
5. **Rejected** — ANAF found errors; invoice needs correction

### Delayed Submission

Companies can configure `efacturaDelayHours` to add a review window between issuing and ANAF submission. This allows catching errors before the invoice enters the national system.

## E-Factura Messages

ANAF sends various message types through the SPV platform:

```bash
curl https://api.storno.ro/api/v1/efactura-messages \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

Message types include:
- **FACTURA PRIMITA**: incoming invoice received
- **FACTURA TRIMISA**: outgoing invoice status update
- **ERORI FACTURA**: invoice validation errors

The `messageType` field and filter use these names exactly, spaces included. See [List e-Factura messages](/api-reference/efactura-messages/list).

## Received invoices: product matching and messages to the issuer

Every received e-Factura is turned into an incoming invoice with lines linked to products. Since 2026-09-14 the matching follows what the supplier prints on the line, in this order:

1. **Barcode** (BT-157 `StandardItemIdentification`) already seen from this supplier
2. **The supplier's own article code** (BT-155 `SellersItemIdentification`)
3. **The item description** as this supplier writes it (normalised: case and spaces)
4. **Our own code** (BT-156 `BuyersItemIdentification`, or the barcode) equal to a product `code`
5. Product name + unit, then a new product

Steps 1–3 read a per-supplier memory (`supplier_product_mapping`) that is written on every sync and, above all, when you change the product of a line on a received invoice (`PUT /invoices/{uuid}` with `productId`): that choice is marked as confirmed and is never overridden by a later import. The identifiers stay on the line (`productCode` = supplier code, `buyerItemIdentification`, `standardItemIdentification`).

Line VAT is recomputed from the net amount and the rate; when the sum differs from the issuer's `TaxSubtotal` by less than 3 (document currency) the difference is put on the largest line of that rate, so the lines add up to the declared VAT. Larger gaps are left as they are.

**Message to the issuer (SPV "RASP").** `POST /api/v1/invoices/{uuid}/efactura-message` with `{"message": "..."}` sends a plain-text message (max 4000 characters) to the seller through ANAF, attached to the invoice's upload index: a dispute, a request for a corrected invoice, "not ours". The invoice is not changed; the message is recorded as the `efactura_message_sent` event. See [Message the issuer](/api-reference/invoices/efactura-message).

## XML Validation

Before submission, invoices can be validated against ANAF's rules:

```bash
# Quick validation (structural), the default
curl -X POST https://api.storno.ro/api/v1/invoices/{uuid}/validate \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}" \
  -H "Content-Type: application/json" \
  -d '{"mode": "quick"}'

# Full validation (Schematron rules)
curl -X POST https://api.storno.ro/api/v1/invoices/{uuid}/validate \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}" \
  -H "Content-Type: application/json" \
  -d '{"mode": "full"}'
```

`mode` is read from the JSON body; without it the quick validation runs.

## Digital Signature Verification

Invoices validated by ANAF receive a digital signature. You can verify it:

```bash
curl -X POST https://api.storno.ro/api/v1/invoices/{uuid}/verify-signature \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

## Fiscal calendar

Storno derives the filing deadlines of a company instead of asking for them: the VAT return (D300) and D394 follow the VAT period set on the company (monthly or quarterly), D100 the income tax period, D112 exists only while the company has employees, D390 appears for a month with an intra-community counterparty on an invoice, D301 for a non-VAT payer with foreign supplier invoices, SAF-T (D406) follows the VAT period, and a person gets the Declarația unică (25 May) while a company gets the annual financial statements (last working day of May). A deadline that falls on a weekend or a Romanian legal holiday moves to the next working day. A deadline is `filed` when a submitted or accepted declaration of that type exists for the period, `overdue` when it has passed without one; members get one `fiscal.deadline` digest a day, 7, 3 and 1 days ahead, listing the unfiled deadlines of the next week across their companies; a company with no invoice in the period of a deadline is not reminded of it. See [Fiscal calendar](/api-reference/fiscal-calendar/overview).
