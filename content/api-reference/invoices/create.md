---
title: Create invoice
description: Create a new draft invoice
---

# Create invoice

Creates a new draft invoice for the specified company.

```
POST /api/v1/invoices
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request. Optional only when the account has a single company |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `clientId` | string | No | Client UUID. Either `clientId` or `receiverName` should be provided. |
| `receiverName` | string | No | Receiver name (when no client entity exists). Either `clientId` or `receiverName` should be provided. |
| `receiverCif` | string | No | Receiver tax ID / CIF (used with `receiverName`) |
| `documentSeriesId` | string | No | Invoice series UUID (uses default if not provided) |
| `documentType` | string | No | `invoice` (default) or `credit_note` |
| `parentDocumentId` | string | No | UUID of the invoice this document refunds or credits. Ignored when the invoice does not exist or belongs to another company. When the document is issued, it gets status `refund` and the parent becomes `refunded` |
| `issueDate` | string | No | Invoice issue date (YYYY-MM-DD). Defaults to today. A future date is refused with `400` |
| `dueDate` | string | No | Payment due date (ISO 8601: YYYY-MM-DD) |
| `currency` | string | No | ISO 4217 currency code (default: RON) |
| `exchangeRate` | number | No | Exchange rate (no default) |
| `invoiceTypeCode` | string | No | One of `standard`, `reverse_charge`, `exempt_with_deduction`, `services_art_311`, `sales_art_312`, `non_taxable`, `special_regime_art_314_315`, `non_transfer`, `simplified`, `services_art_278`, `exempt_art_294_ab`, `exempt_art_294_cd`, `self_billing`. No default. Any other value is refused with `400` |
| `notes` | string | No | Public notes visible to client |
| `paymentTerms` | string | No | Payment terms description |
| `paymentMethod` | string | No | Payment method: `bank_transfer`, `cash`, `card`, `cheque`, `other`. Not validated and no default; when empty, `collect` records `bank_transfer` |
| `deliveryLocation` | string | No | Delivery address |
| `projectReference` | string | No | Project reference number |
| `orderNumber` | string | No | Purchase order number |
| `contractNumber` | string | No | Contract reference number |
| `issuerName` | string | No | Name of person issuing the invoice |
| `issuerId` | string | No | Issuer ID number |
| `mentions` | string | No | Additional legal mentions |
| `internalNote` | string | No | Internal note (not visible to client) |
| `salesAgent` | string | No | Sales agent name |
| `deputyName` | string | No | Deputy/representative name |
| `deputyIdentityCard` | string | No | Deputy ID card number |
| `deputyAuto` | string | No | Deputy vehicle registration |
| `language` | string | No | Document language for PDF generation: `ro`, `en`, `de`, `fr` (default: `ro`) |
| `tvaLaIncasare` | boolean | No | VAT on collection / TVA la încasare (default: false) |
| `platitorTva` | boolean | No | Whether sender is VAT payer (default: false) |
| `scheduledEmailAt` | string | No | ISO 8601 date and time at which the invoice is emailed to the client after it is issued |
| `plataOnline` | boolean | No | Enable online payment via Stripe (default: from company Stripe Connect settings) |
| `showClientBalance` | boolean | No | Show client balance on invoice (default: false) |
| `clientBalanceExisting` | string | No | Existing client balance amount |
| `clientBalanceOverdue` | string | No | Overdue client balance amount |
| `collect` | object | No | Create immediate payment on the invoice (see below) |
| `autoApplyVatRules` | boolean | No | Auto-apply EU VAT rules: reverse charge (0% VAT) for VIES-valid EU clients, OSS destination country VAT rate for non-VIES EU clients (default: false) |
| `vatIncluded` | boolean | No | When used with `autoApplyVatRules`, sets whether unit prices include VAT on all lines. This ensures correct totals after VAT rules change rates (e.g., reverse charge sets VAT to 0%). Without this, use per-line `vatIncluded` instead. |
| `idempotencyKey` | string | No | Stable key that lets you safely retry a failed request — see [Idempotency](#idempotency) |
| `ublExtensions` | object | No | UBL extension fields for advanced e-Factura compliance (see below) |
| `lines` | array | Yes | Array of invoice line items |

### Collect object

When provided, creates an immediate payment record on the invoice.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | number | No | Payment amount (defaults to invoice total) |
| `type` | string | No | Payment method: `bank_transfer`, `cash`, `card`, etc. Defaults to the invoice `paymentMethod`, then `bank_transfer` |
| `issueDate` | string | No | Payment date (ISO 8601: YYYY-MM-DD) |
| `documentNumber` | string | No | Payment reference/document number |
| `mentions` | string | No | Payment notes |

### Invoice line object

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `description` | string | Yes | Line item description |
| `quantity` | number | Yes | Quantity (must be positive, or non-zero for refunds) |
| `unitPrice` | number | Yes | Unit price (must be non-negative) |
| `vatRate` | number | No | VAT rate percentage. Default 21.00 when neither `vatRate` nor `vatRateId` is sent, whatever the VAT status of the company |
| `vatCategoryCode` | string | No | UBL VAT category code (default: `S`). Usually not needed — auto-determined from `vatRate`: 0% rate auto-corrects to `Z`, and zero-rate codes with rate > 0 auto-correct to `S`. Only set explicitly for special categories like `AE` (reverse charge), `E` (exempt), `K` (intra-community), `G` (export). |
| `vatRateId` | string | No | Id of one of the company's VAT rates (`GET /api/v1/vat-rates`). The line takes its percentage and category. Ignored when `vatRate` is sent; an error when it is not a rate of the company |
| `unitOfMeasure` | string | No | Unit of measure (e.g., "hours", "pcs", "kg") |
| `productId` | string | No | Product UUID (optional reference) |
| `discount` | number | No | Fixed discount amount |
| `discountPercent` | number | No | Discount percentage |
| `vatIncluded` | boolean | No | Whether price includes VAT (default: false) |
| `productCode` | string | No | Product code for reference |
| `ublExtensions` | object | No | Line-level UBL extensions (see below) |

> **VAT on a line.** Send `vatRate` (a percentage) or `vatRateId` (the id of one of the company's rates from `GET /api/v1/vat-rates`; the line takes that rate's percentage and category). When both are sent `vatRate` wins. When neither is sent the line gets **21%**, also when the issuing company is not a VAT payer. For a company that is not a VAT payer send `vatRate: "0.00"` on every line. A `vatRateId` that is not a rate of the company is refused with an error; it never falls back to 21%.

### e-Factura BT fields

These optional fields are used for advanced e-Factura (UBL) compliance:

| Name | Type | Description |
|------|------|-------------|
| `taxPointDate` | string | Tax point date (ISO 8601: YYYY-MM-DD) |
| `taxPointDateCode` | string | Tax point date code |
| `buyerReference` | string | Buyer reference |
| `receivingAdviceReference` | string | Receiving advice reference |
| `despatchAdviceReference` | string | Despatch advice reference |
| `tenderOrLotReference` | string | Tender or lot reference |
| `invoicedObjectIdentifier` | string | Invoiced object identifier |
| `buyerAccountingReference` | string | Buyer accounting reference |
| `businessProcessType` | string | Business process type |
| `payeeName` | string | Payee name (if different from seller) |
| `payeeIdentifier` | string | Payee identifier |
| `payeeLegalRegistrationIdentifier` | string | Payee legal registration identifier |
| `payeeBankAccount` | string | IBAN where payment should be sent — sourced from `PaymentMeans/PayeeFinancialAccount/ID` on synced e-Factura invoices, used by the quick-pay QR flow |
| `payeeBankName` | string | Bank name from `PaymentMeans/PayeeFinancialAccount/FinancialInstitutionBranch/Name` |

### UBL extensions (document-level)

The `ublExtensions` object supports UBL XML elements that don't have dedicated invoice fields. All sub-fields are optional. Unknown keys are silently stripped.

| Name | Type | Description |
|------|------|-------------|
| `invoicePeriod` | object | Billing period: `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD), `descriptionCode` (e.g., "35") |
| `delivery` | object | Delivery info: `actualDeliveryDate` (YYYY-MM-DD), `deliveryAddress` object with `streetName`, `cityName`, `countrySubentity`, `countryCode` |
| `allowanceCharges` | array | Document-level allowances/charges (max 20). Each: `chargeIndicator` (bool, false=discount), `amount` (numeric string), `taxCategoryCode` (S/Z/E/AE/K/G/O), `taxRate` (numeric string). Optional: `reasonCode`, `reason`, `baseAmount`, `multiplierFactorNumeric` |
| `prepaidAmount` | string | Prepaid amount (numeric string >= 0). Reduces PayableAmount in UBL XML |
| `additionalDocumentReferences` | array | Additional references (max 10). Each: `id` (required, max 200), optional `documentTypeCode`, `documentDescription` |

{% callout type="info" %}
Document-level `allowanceCharges` adjust TaxTotal and LegalMonetaryTotal in the generated UBL XML. The stored invoice subtotal/vatTotal/total remain unchanged — the adjustments are computed at XML generation time.
{% /callout %}

### UBL extensions (line-level)

Each line item can include a `ublExtensions` object:

| Name | Type | Description |
|------|------|-------------|
| `invoicePeriod` | object | Line billing period: `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD) |
| `allowanceCharges` | array | Line-level allowances/charges (max 10). Each: `chargeIndicator` (bool), `amount` (numeric string). Optional: `reasonCode`, `reason`, `baseAmount`, `multiplierFactorNumeric` |
| `additionalItemProperties` | array | Item properties (max 20). Each: `name` (max 50 chars), `value` (max 100 chars) |
| `originCountry` | string | Item origin country (ISO 3166-1 alpha-2, e.g., "DE") |

### Idempotency

Network failures, timeouts, and 5xx errors can leave a client unsure whether the invoice was actually created. Naive retry logic produces duplicate drafts. Storno offers two protections:

#### 1. Explicit idempotency key (recommended)

Include `idempotencyKey` in the request body. The same key sent in a future request returns the original invoice instead of creating a new one.

**The key must be:**
- **Stable per logical operation.** Same Stripe payment intent, same shopping-cart checkout, same external order ID → same key, every retry.
- **Unique within the company.** The key is scoped to the company in `X-Company`: the same key sent for another company creates that company's own invoice and never returns this one. Prefix with your service name to keep your own sources apart: `stripe:pi_3TNpEhHy...`, `paddle:txn_01H...`, `myapp:order_42`.
- **Up to 255 characters.** Use the underlying transaction ID and you'll be safe.

```json
{
  "clientId": "...",
  "currency": "USD",
  "lines": [...],
  "idempotencyKey": "stripe:pi_3TNpEhHyDIBD6PSZ1ZnXYN4I"
}
```

| Outcome | Status | Behaviour |
|---|---|---|
| First call | `201 Created` | Invoice created, key recorded |
| Retry with same key | `201 Created` | The original invoice is returned (same `id`, same invoice data); no new row is inserted. Detect a retry on your side by storing/comparing the returned `id` |
| Retry with different key | `201 Created` | A new invoice is created, unless the request also carries `total` and the fuzzy fallback below matches a recent draft. Keys must match across retries |
| Retry when the monthly invoice quota is already reached | `402 Payment Required` | The quota check runs before the key is looked up, so the retry gets `PLAN_LIMIT` instead of the original invoice |

A unique index on company and key backs this: one company cannot have two invoices with the same key.

**Retries and `collect`.** A retry returns the first invoice, so `collect` is applied only while the invoice has no payment. A retry after a lost response does not record the payment a second time, and a retry after a payment that failed still records it.

#### 2. Fuzzy fallback

When the key does not match an existing invoice and the request body contains `clientId`, `currency` and `total`, a draft of the same company with the same client, currency and total created in the **last hour** is returned instead of a new invoice. `total` is not a field the invoice needs (it is computed from the lines); it only has to be present, and it is compared with the stored total of the earlier draft. A request without `total` never matches. This catches retry storms from clients that don't yet support idempotency keys.

The fuzzy fallback only matches DRAFT invoices and only within a 60-minute window. It will not interfere with legitimate "create two similar drafts back-to-back" workflows once an hour has passed, and it never affects already-issued invoices.

#### Best practice

Always send an `idempotencyKey` — it's the safest, most explicit, and survives the 60-minute fuzzy window. Use the underlying business identifier (Stripe payment intent ID, your order ID) prefixed with your service name.

### Invoice type codes

See the `invoiceTypeCode` row above for the accepted values. The e-Factura `InvoiceTypeCode` element is derived from them (`380`, or `389` for `self_billing`); numeric codes are not accepted in the request.

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "issueDate": "2024-02-15",
    "dueDate": "2024-03-15",
    "currency": "RON",
    "notes": "Payment terms: 30 days net",
    "paymentTerms": "Net 30",
    "idempotencyKey": "myapp:order_42",
    "lines": [
      {
        "description": "Web Development Services",
        "quantity": 10,
        "unitPrice": 100.00,
        "unitOfMeasure": "hours",
        "vatIncluded": false
      }
    ]
  }'
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    issueDate: '2024-02-15',
    dueDate: '2024-03-15',
    currency: 'RON',
    notes: 'Payment terms: 30 days net',
    paymentTerms: 'Net 30',
    // Same key on every retry of this logical operation — see Idempotency section
    idempotencyKey: 'myapp:order_42',
    lines: [
      {
        description: 'Web Development Services',
        quantity: 10,
        unitPrice: 100.00,
        unitOfMeasure: 'hours',
        vatIncluded: false
      }
    ]
  })
});

const data = await response.json();
// data.invoice — the created invoice
// data.validation — UBL validation results
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the created invoice and the UBL validation result, with status `201 Created`. Decimal amounts are strings and dates are ISO 8601 date-times. `createdAt` and `updatedAt` are not part of the invoice object.

```json
{
  "invoice": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "number": "DRAFT-a1b2c3d4",
    "status": "draft",
    "direction": "outgoing",
    "documentType": "invoice",
    "currency": "RON",
    "exchangeRate": null,
    "issueDate": "2024-02-15T00:00:00+00:00",
    "dueDate": "2024-03-15T00:00:00+00:00",
    "subtotal": "1000.00",
    "vatTotal": "210.00",
    "total": "1210.00",
    "amountPaid": "0.00",
    "balance": "1210.00",
    "notes": "Payment terms: 30 days net",
    "paymentTerms": "Net 30",
    "client": {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "Acme Corporation SRL",
      "cui": "98765432"
    },
    "lines": [
      {
        "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        "description": "Web Development Services",
        "position": 1,
        "quantity": "10.0000",
        "unitPrice": "100.00",
        "unitOfMeasure": "hours",
        "vatRate": "21.00",
        "vatCategoryCode": "S",
        "vatAmount": "210.00",
        "lineTotal": "1000.00"
      }
    ],
    "documentSeries": {
      "id": "f8e7d6c5-b4a3-4c5d-9e8f-7a6b5c4d3e2f",
      "prefix": "FAC",
      "nextNumber": "FAC0002"
    }
  },
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "schematronAvailable": true
  }
}
```

## Error codes

Error bodies have the form `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `400` | Validation or data error: no lines, a line without `description`, a zero `quantity`, a negative `unitPrice`, a future `issueDate`, an invalid `invoiceTypeCode`, a client or a `vatRateId` that is not found for the company |
| `401` | Missing or invalid authentication token |
| `402` | Monthly invoice quota of the plan reached. Body: `{"error": "Monthly invoice limit reached.", "code": "PLAN_LIMIT", "limit": <number>}` |
| `403` | The user does not have the permission to create invoices |
| `404` | Company not found, or the token has no access to it (`Company not found.`) |
