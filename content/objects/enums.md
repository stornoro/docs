---
title: Enums
description: Enumeration types used throughout the API
---

# Enums

This document lists all enumeration types used in the Storno.ro API.

## DocumentStatus

Status values for invoices and other documents:

| Value | Description |
|-------|-------------|
| draft | Document is in draft state, not yet finalized |
| synced | Document synced from e-invoice provider but not yet issued |
| issued | Document has been issued to the client |
| sent_to_provider | Document has been sent to e-invoice provider |
| validated | Document validated by e-invoice provider |
| rejected | Document rejected by e-invoice provider |
| cancelled | Document has been cancelled |
| paid | Invoice fully paid |
| partially_paid | Invoice partially paid |
| overdue | Invoice past due date and not fully paid |
| converted | Document converted to another type (e.g., proforma → invoice) |

## EInvoiceSubmissionStatus

Status of an e-invoice submission to a provider (ANAF, SDI, KSeF, etc.):

| Value | Description |
|-------|-------------|
| pending | Submission is queued and waiting to be sent |
| submitted | Successfully submitted to the provider, awaiting response |
| accepted | Provider accepted the e-invoice |
| rejected | Provider rejected the e-invoice |
| error | An error occurred during submission |

## DocumentType

Types of documents:

| Value | Description |
|-------|-------------|
| invoice | Regular invoice |
| credit_note | Credit note (invoice correction) |

## InvoiceDirection

Direction of invoice:

| Value | Description |
|-------|-------------|
| incoming | Incoming invoice (received from supplier) |
| outgoing | Outgoing invoice (issued to client) |

## ProformaStatus

Status values specific to proforma invoices:

| Value | Description |
|-------|-------------|
| draft | Proforma in draft state |
| sent | Proforma sent to client |
| accepted | Proforma accepted by client |
| rejected | Proforma rejected by client |
| converted | Proforma converted to invoice |
| cancelled | Proforma cancelled |

## DeliveryNoteStatus

Status values for delivery notes:

| Value | Description |
|-------|-------------|
| draft | Delivery note in draft state |
| issued | Delivery note issued and sent with goods |
| converted | Delivery note converted to invoice |
| cancelled | Delivery note cancelled |

## OrganizationRole

User roles within an organization:

| Value | Description | Typical Permissions |
|-------|-------------|---------------------|
| owner | Organization owner | Full access to everything |
| admin | Administrator | Can manage users, settings, documents |
| accountant | Accountant | Can view/manage financial documents, limited settings access |
| employee | Employee | Limited access based on assigned permissions |

## InvoiceTypeCode

Invoice type codes for e-invoice submission:

| Value | Description (English) | Description (Romanian) |
|-------|----------------------|------------------------|
| standard | Standard invoice | Factură standard |
| reverse_charge | Reverse charge | Taxare inversă |
| exempt_with_deduction | Exempt with deduction right | Scutit cu drept de deducere |
| services_art_311 | Services Art. 311 | Servicii Art. 311 |
| sales_art_312 | Sales Art. 312 | Vânzări Art. 312 |
| non_taxable | Non-taxable | Neimpozabil |
| special_regime_art_314_315 | Special regime Art. 314/315 | Regim special Art. 314/315 |
| non_transfer | Non-transfer | Netransfer |
| simplified | Simplified invoice | Factură simplificată |
| services_art_278 | Services Art. 278 | Servicii Art. 278 |
| exempt_art_294_ab | Exempt Art. 294 (a-b) | Scutit Art. 294 (a-b) |
| exempt_art_294_cd | Exempt Art. 294 (c-d) | Scutit Art. 294 (c-d) |
| self_billing | Self-billing | Autofacturare |

## EmailStatus

Status of sent emails:

| Value | Description |
|-------|-------------|
| sent | Email successfully sent |
| delivered | Email delivered to recipient |
| bounced | Email bounced (invalid address) |
| failed | Email failed to send |

## RecurringFrequency

Frequency options for recurring invoices:

| Value | Description |
|-------|-------------|
| monthly | Every month |
| quarterly | Every 3 months |
| yearly | Once per year |

## DueDateType

How to calculate due date for recurring invoices:

| Value | Description |
|-------|-------------|
| days_after | X days after issue date |
| fixed_day | Fixed day of the month |

## PriceRule

Dynamic pricing rules for recurring invoice lines:

| Value | Description |
|-------|-------------|
| fixed | Use the template price (no changes) |
| latest_product_price | Use current product price at generation time |
| apply_exchange_rate | Convert from reference currency using latest rate |

## ClientType

Type of client:

| Value | Description |
|-------|-------------|
| company | Legal entity (company) |
| individual | Natural person (individual) |

## Source

Data source for imported/synced entities:

| Value | Description |
|-------|-------------|
| manual | Manually created by user |
| anaf | Synced from e-invoice provider (ANAF in Romania) |
| import | Bulk imported (CSV, etc.) |

## PaymentMethod

Payment methods for tracking invoice payments:

| Value | Description |
|-------|-------------|
| bank_transfer | Bank transfer (Ordin de plată) |
| cash | Cash payment (Numerar) |
| card | Card payment (Card) |
| check | Check (Cec) |
| paypal | PayPal |
| stripe | Stripe |
| mobilpay | MobilPay |
| netopia | Netopia Payments |
| other | Other method |

## Notes

- All enum values are **lowercase with underscores** (snake_case)
- Frontend applications should map these to user-friendly labels
- Romanian translations are provided in the i18n files (`ro.ts`)
- Some enums have specific e-invoice provider requirements (InvoiceTypeCode, DocumentStatus)
- Enum values are case-sensitive in API requests
