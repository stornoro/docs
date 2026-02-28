---
title: Recurring Invoice
description: Recurring invoice template for automated invoice generation
---

# Recurring Invoice

The RecurringInvoice object represents templates for automatically generating invoices on a recurring schedule (monthly, quarterly, yearly). The system automatically creates invoices based on the frequency settings and optionally sends them via email.

## Attributes

| Attribute | Type | In List | In Detail | Description |
|-----------|------|---------|-----------|-------------|
| id | UUID | ✓ | ✓ | Unique identifier |
| reference | string | ✓ | ✓ | Reference name for this recurring invoice |
| isActive | boolean | ✓ | ✓ | Whether automatic generation is active |
| documentType | DocumentType | ✓ | ✓ | Type: invoice or credit_note |
| currency | string | ✓ | ✓ | 3-letter currency code (e.g., "RON", "EUR") |
| frequency | string | ✓ | ✓ | Frequency: monthly, quarterly, yearly |
| frequencyDay | integer | ✓ | ✓ | Day of month to generate invoice (1-31) |
| nextIssuanceDate | date | ✓ | ✓ | Next scheduled generation date (YYYY-MM-DD) |
| lastIssuedAt | datetime | ✓ | ✓ | When the last invoice was generated |
| lastInvoiceNumber | string | ✓ | ✓ | Number of the last generated invoice |
| clientName | string | ✓ | ✓ | Virtual field: name of the client |
| subtotal | decimal | ✓ | ✓ | Template subtotal before VAT |
| vatTotal | decimal | ✓ | ✓ | Template total VAT amount |
| total | decimal | ✓ | ✓ | Template total amount including VAT |
| client | Client | ✗ | ✓ | Full Client object |
| documentSeries | string | ✗ | ✓ | Document series to use for generated invoices |
| invoiceTypeCode | InvoiceTypeCode | ✗ | ✓ | Type code for generated invoices |
| autoEmailEnabled | boolean | ✗ | ✓ | Automatically email the generated invoice |
| autoEmailTime | time | ✗ | ✓ | Time of day to send email (HH:MM) |
| autoEmailDayOffset | integer | ✗ | ✓ | Days after generation to send email |
| penaltyEnabled | boolean | ✗ | ✓ | Enable late payment penalties on generated invoices |
| penaltyPercentPerDay | decimal | ✗ | ✓ | Daily penalty percentage |
| penaltyGraceDays | integer | ✗ | ✓ | Grace period before penalties apply |
| dueDateType | string | ✗ | ✓ | How to calculate due date: days_after, fixed_day |
| dueDateDays | integer | ✗ | ✓ | Days after issue date (if dueDateType is days_after) |
| dueDateFixedDay | integer | ✗ | ✓ | Fixed day of month (if dueDateType is fixed_day) |
| frequencyMonth | integer | ✗ | ✓ | Month for yearly frequency (1-12) |
| stopDate | date | ✗ | ✓ | Date to stop generating invoices (null = indefinite) |
| notes | text | ✗ | ✓ | Notes to include on generated invoices |
| paymentTerms | text | ✗ | ✓ | Payment terms for generated invoices |
| lines | array | ✗ | ✓ | Array of RecurringInvoiceLine objects |
| createdAt | datetime | ✓ | ✓ | Timestamp when created |
| updatedAt | datetime | ✓ | ✓ | Timestamp of last update |
| deletedAt | datetime | ✓ | ✓ | Soft delete timestamp (null if not deleted) |

## Recurring Invoice Line

RecurringInvoiceLine extends the standard line with additional fields for dynamic pricing:

| Attribute | Type | Description |
|-----------|------|-------------|
| referenceCurrency | string | Currency for reference price tracking |
| markupPercent | decimal | Markup percentage to apply |
| priceRule | string | Dynamic pricing rule (e.g., "latest_product_price", "apply_exchange_rate") |

All standard line fields (description, quantity, unitOfMeasure, unitPrice, vatRate, etc.) are also available.

## Example

```json
{
  "id": "a3b4c5d6-e7f8-9012-7890-123456789012",
  "reference": "Monthly Hosting - Acme Corp",
  "isActive": true,
  "documentType": "invoice",
  "currency": "RON",
  "frequency": "monthly",
  "frequencyDay": 1,
  "nextIssuanceDate": "2024-03-01",
  "lastIssuedAt": "2024-02-01T08:00:00+02:00",
  "lastInvoiceNumber": "INV-2024-045",
  "clientName": "Acme Corporation SRL",
  "subtotal": 500.00,
  "vatTotal": 95.00,
  "total": 595.00,
  "client": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "type": "company",
    "name": "Acme Corporation SRL",
    "cui": "12345678",
    "vatCode": "RO12345678",
    "isVatPayer": true,
    "email": "billing@acme.ro"
  },
  "documentSeries": "INV",
  "invoiceTypeCode": "standard",
  "autoEmailEnabled": true,
  "autoEmailTime": "09:00",
  "autoEmailDayOffset": 0,
  "penaltyEnabled": true,
  "penaltyPercentPerDay": 0.05,
  "penaltyGraceDays": 5,
  "dueDateType": "days_after",
  "dueDateDays": 30,
  "dueDateFixedDay": null,
  "frequencyMonth": null,
  "stopDate": null,
  "notes": "Monthly hosting service subscription",
  "paymentTerms": "Payment due within 30 days",
  "lines": [
    {
      "id": "b4c5d6e7-f8a9-0123-8901-234567890123",
      "position": 1,
      "description": "Web Hosting Service - Premium Plan",
      "quantity": 1.0,
      "unitOfMeasure": "month",
      "unitPrice": 500.00,
      "vatRate": 19.00,
      "vatAmount": 95.00,
      "lineTotal": 595.00,
      "productCode": "HOST-PREMIUM",
      "referenceCurrency": "EUR",
      "markupPercent": 0.00,
      "priceRule": "latest_product_price"
    }
  ],
  "createdAt": "2024-01-01T10:00:00+02:00",
  "updatedAt": "2024-02-01T08:00:00+02:00",
  "deletedAt": null
}
```

## Frequency Options

- **monthly**: Generated on `frequencyDay` of each month
- **quarterly**: Generated every 3 months on `frequencyDay`
- **yearly**: Generated once per year on `frequencyDay` of month `frequencyMonth`

## Dynamic Pricing Rules

- **latest_product_price**: Use the current product price at generation time
- **apply_exchange_rate**: Convert from `referenceCurrency` using latest exchange rate
- **fixed**: Use the template price (default)

## Notes

- The system automatically generates invoices based on `nextIssuanceDate`
- After generation, `nextIssuanceDate` is advanced based on frequency
- If `autoEmailEnabled`, the invoice is sent to client's email
- Recurring invoices can be paused by setting `isActive: false`
- They automatically stop generating after `stopDate` (if set)
