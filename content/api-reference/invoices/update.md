---
title: Update invoice
description: Update an existing editable invoice
---

# Update invoice

Updates an existing invoice. Invoices can be updated as long as they are editable — this includes `draft` invoices, `rejected` invoices (so you can fix and resubmit), and issued invoices that have not yet been submitted to ANAF. Invoices with status `cancelled` or `sent_to_provider`, or that have already been uploaded to ANAF, cannot be updated.

```
PUT /api/v1/invoices/{uuid}
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not used on this route: the invoice is found by its UUID |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Request body

All fields are optional — only include the fields you want to update.

| Name | Type | Description |
|------|------|-------------|
| `clientId` | string | Client UUID |
| `receiverName` | string | Receiver name (when no client entity selected) |
| `receiverCif` | string | Receiver tax ID / CIF (used with `receiverName`) |
| `documentSeriesId` | string | Invoice series UUID (only changeable on draft invoices) |
| `documentType` | string | `invoice` or `credit_note` |
| `issueDate` | string | Invoice issue date (ISO 8601: YYYY-MM-DD) |
| `dueDate` | string | Payment due date (ISO 8601: YYYY-MM-DD) |
| `currency` | string | ISO 4217 currency code |
| `exchangeRate` | number | Exchange rate |
| `scheduledEmailAt` | string | ISO 8601 date and time to email the invoice after issue, or `null` to cancel |
| `invoiceTypeCode` | string | One of the values listed in [Create invoice](/api-reference/invoices/create), or `null` to clear |
| `notes` | string | Public notes visible to client |
| `paymentTerms` | string | Payment terms description |
| `paymentMethod` | string | Payment method: `bank_transfer`, `cash`, `card`, `cheque`, `other` |
| `deliveryLocation` | string | Delivery address |
| `projectReference` | string | Project reference number |
| `orderNumber` | string | Purchase order number |
| `contractNumber` | string | Contract reference number |
| `issuerName` | string | Name of person issuing the invoice |
| `issuerId` | string | Issuer ID number |
| `mentions` | string | Additional legal mentions |
| `internalNote` | string | Internal note (not visible to client) |
| `salesAgent` | string | Sales agent name |
| `deputyName` | string | Deputy/representative name |
| `deputyIdentityCard` | string | Deputy ID card number |
| `deputyAuto` | string | Deputy vehicle registration |
| `language` | string | Document language for PDF generation: `ro`, `en`, `de`, `fr` |
| `tvaLaIncasare` | boolean | VAT on collection (TVA la încasare) |
| `platitorTva` | boolean | Whether sender is VAT payer |
| `plataOnline` | boolean | Enable online payment via Stripe |
| `showClientBalance` | boolean | Show client balance on invoice |
| `clientBalanceExisting` | string | Existing client balance amount |
| `clientBalanceOverdue` | string | Overdue client balance amount |
| `autoApplyVatRules` | boolean | Auto-apply EU VAT rules: reverse charge (0% VAT) for VIES-valid EU clients, OSS destination country VAT rate for non-VIES EU clients (default: false) |
| `vatIncluded` | boolean | When used with `autoApplyVatRules`, sets whether unit prices include VAT on all lines. This ensures correct totals after VAT rules change rates (e.g., reverse charge sets VAT to 0%). Without this, use per-line `vatIncluded` instead. |
| `ublExtensions` | object | UBL extension fields for advanced e-Factura compliance (see below). Pass `null` to clear. |
| `lines` | array | Array of invoice line items (replaces all lines) |

### Invoice line object

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `description` | string | Yes | Line item description |
| `quantity` | number | Yes | Quantity |
| `unitPrice` | number | Yes | Unit price |
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
| `payeeBankAccount` | string | IBAN where payment should be sent — used by the quick-pay QR flow |
| `payeeBankName` | string | Bank name corresponding to `payeeBankAccount` |

### UBL extensions (document-level)

The `ublExtensions` object supports UBL XML elements that don't have dedicated invoice fields. All sub-fields are optional. Unknown keys are silently stripped. Pass `null` to clear all extensions.

| Name | Type | Description |
|------|------|-------------|
| `invoicePeriod` | object | Billing period: `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD), `descriptionCode` (e.g., "35") |
| `delivery` | object | Delivery info: `actualDeliveryDate` (YYYY-MM-DD), `deliveryAddress` object with `streetName`, `cityName`, `countrySubentity`, `countryCode` |
| `allowanceCharges` | array | Document-level allowances/charges (max 20). Each: `chargeIndicator` (bool, false=discount), `amount` (numeric string), `taxCategoryCode` (S/Z/E/AE/K/G/O), `taxRate` (numeric string). Optional: `reasonCode`, `reason`, `baseAmount`, `multiplierFactorNumeric` |
| `prepaidAmount` | string | Prepaid amount (numeric string >= 0). Reduces PayableAmount in UBL XML |
| `additionalDocumentReferences` | array | Additional references (max 10). Each: `id` (required, max 200), optional `documentTypeCode`, `documentDescription` |

### UBL extensions (line-level)

Each line item can include a `ublExtensions` object:

| Name | Type | Description |
|------|------|-------------|
| `invoicePeriod` | object | Line billing period: `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD) |
| `allowanceCharges` | array | Line-level allowances/charges (max 10). Each: `chargeIndicator` (bool), `amount` (numeric string). Optional: `reasonCode`, `reason`, `baseAmount`, `multiplierFactorNumeric` |
| `additionalItemProperties` | array | Item properties (max 20). Each: `name` (max 50 chars), `value` (max 100 chars) |
| `originCountry` | string | Item origin country (ISO 3166-1 alpha-2, e.g., "DE") |

{% callout type="warning" %}
When updating `lines`, the entire array is replaced. Include all line items you want to keep, not just the ones you're changing.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X PUT https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "dueDate": "2024-03-30",
    "notes": "Payment terms: 45 days net",
    "lines": [
      {
        "description": "Web Development Services - Updated",
        "quantity": 15,
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
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    dueDate: '2024-03-30',
    notes: 'Payment terms: 45 days net',
    lines: [
      {
        description: 'Web Development Services - Updated',
        quantity: 15,
        unitPrice: 100.00,
        unitOfMeasure: 'hours',
        vatIncluded: false
      }
    ]
  })
});

const data = await response.json();
// data.invoice: the updated invoice
// data.validation — UBL validation results
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the updated invoice and the UBL validation result. The invoice object has the shape described in [Get invoice details](/api-reference/invoices/get): decimal amounts are strings, dates are ISO 8601 date-times, and `updatedAt` is not included.

```json
{
  "invoice": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "number": "DRAFT-a1b2c3d4",
    "status": "draft",
    "direction": "outgoing",
    "currency": "RON",
    "issueDate": "2024-02-15T00:00:00+00:00",
    "dueDate": "2024-03-30T00:00:00+00:00",
    "subtotal": "1500.00",
    "vatTotal": "315.00",
    "total": "1815.00",
    "amountPaid": "0.00",
    "balance": "1815.00",
    "notes": "Payment terms: 45 days net",
    "lines": [
      {
        "id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
        "position": 1,
        "description": "Web Development Services - Updated",
        "quantity": "15.0000",
        "unitPrice": "100.00",
        "unitOfMeasure": "hours",
        "vatRate": "21.00",
        "vatCategoryCode": "S",
        "vatAmount": "315.00",
        "lineTotal": "1500.00"
      }
    ]
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
| `401` | Missing or invalid authentication token |
| `403` | The invoice belongs to another organization, or the user cannot edit invoices |
| `404` | Invoice not found |
| `422` | Invoice is not editable (cancelled, sent to provider, or already uploaded to ANAF), or a client or `vatRateId` is not found for the company |
