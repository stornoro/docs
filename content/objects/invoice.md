---
title: Invoice
description: Invoice object representing both incoming and outgoing invoices
---

# Invoice

The Invoice object represents both outgoing (issued by the company) and incoming (received from suppliers) invoices. Invoices can be synced with e-invoice provider systems and support multiple currencies, payment tracking, and credit notes.

## Attributes

| Attribute | Type | In List | In Detail | Description |
|-----------|------|---------|-----------|-------------|
| id | UUID | ✓ | ✓ | Unique identifier |
| number | string | ✓ | ✓ | Invoice number (e.g., "INV-2024-001") |
| status | DocumentStatus | ✓ | ✓ | Current status (draft, issued, validated, paid, etc.) |
| direction | InvoiceDirection | ✓ | ✓ | Direction: incoming or outgoing |
| currency | string | ✓ | ✓ | 3-letter currency code (e.g., "RON", "EUR") |
| language | string | ✗ | ✓ | Document language for PDF generation: `ro`, `en`, `de`, `fr` (default: `ro`) |
| issueDate | date | ✓ | ✓ | Date the invoice was issued (YYYY-MM-DD) |
| dueDate | date | ✓ | ✓ | Payment due date (YYYY-MM-DD) |
| subtotal | decimal | ✓ | ✓ | Subtotal before VAT |
| vatTotal | decimal | ✓ | ✓ | Total VAT amount |
| total | decimal | ✓ | ✓ | Total amount including VAT |
| clientName | string | ✓ | ✓ | Virtual field: name of the client |
| amountPaid | decimal | ✓ | ✓ | Total amount paid to date |
| balance | decimal | ✓ | ✓ | Virtual field: remaining balance (total - amountPaid) |
| supplier | object | ✓ | ✓ | Supplier relation with id, name, cif (for incoming invoices) |
| client | Client | ✗ | ✓ | Full Client object |
| documentSeries | string | ✗ | ✓ | Document series prefix |
| discount | decimal | ✗ | ✓ | Total discount amount |
| notes | text | ✗ | ✓ | Public notes visible to client |
| paymentTerms | text | ✗ | ✓ | Payment terms description |
| invoiceTypeCode | InvoiceTypeCode | ✗ | ✓ | Type code for e-invoice submission (standard, reverse_charge, etc.) |
| deliveryLocation | string | ✗ | ✓ | Delivery address |
| projectReference | string | ✗ | ✓ | Project or reference number |
| exchangeRate | decimal | ✗ | ✓ | Exchange rate used (for foreign currencies) |
| anafUploadId | string | ✗ | ✓ | ANAF upload ID after submission (Romania only) |
| anafUploadDate | datetime | ✗ | ✓ | Date/time uploaded to ANAF (Romania only) |
| anafState | string | ✗ | ✓ | Current state in ANAF system (Romania only) |
| anafDownloadId | string | ✗ | ✓ | ANAF download ID for incoming invoices (Romania only) |
| anafXmlUrl | string | ✗ | ✓ | URL to the ANAF XML file (Romania only) |
| pdfPath | string | ✗ | ✓ | Path to generated PDF file |
| isIncoming | boolean | ✗ | ✓ | True if incoming invoice |
| isCreditNote | boolean | ✗ | ✓ | True if this is a credit note |
| collect | boolean | ✗ | ✓ | Collection flag |
| parentDocument | object | ✗ | ✓ | Reference to parent invoice (for credit notes) |
| orderNumber | string | ✗ | ✓ | Purchase order number |
| contractNumber | string | ✗ | ✓ | Contract reference number |
| issuerName | string | ✗ | ✓ | Name of the person issuing the invoice |
| issuerId | string | ✗ | ✓ | ID/CNP of the issuer |
| mentions | text | ✗ | ✓ | Additional mentions on invoice |
| internalNote | text | ✗ | ✓ | Internal notes (not visible to client) |
| salesAgent | string | ✗ | ✓ | Sales agent name |
| deputyName | string | ✗ | ✓ | Deputy/representative name |
| deputyIdentityCard | string | ✗ | ✓ | Deputy ID card number |
| deputyAuto | string | ✗ | ✓ | Deputy vehicle registration |
| penaltyEnabled | boolean | ✗ | ✓ | Whether late payment penalties are enabled |
| penaltyPercentPerDay | decimal | ✗ | ✓ | Daily penalty percentage |
| penaltyGraceDays | integer | ✗ | ✓ | Grace period before penalties apply |
| lines | array | ✗ | ✓ | Array of InvoiceLine objects |
| events | array | ✗ | ✓ | Array of DocumentEvent objects (audit trail) |
| attachments | array | ✗ | ✓ | Array of file attachments |
| payments | array | ✗ | ✓ | Array of Payment objects |
| createdAt | datetime | ✓ | ✓ | Timestamp when created |
| updatedAt | datetime | ✓ | ✓ | Timestamp of last update |
| deletedAt | datetime | ✓ | ✓ | Soft delete timestamp (null if not deleted) |

## Example

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "INV-2024-001",
  "status": "validated",
  "direction": "outgoing",
  "currency": "RON",
  "issueDate": "2024-02-15",
  "dueDate": "2024-03-15",
  "subtotal": 1000.00,
  "vatTotal": 190.00,
  "total": 1190.00,
  "clientName": "Acme Corporation SRL",
  "amountPaid": 500.00,
  "balance": 690.00,
  "client": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "type": "company",
    "name": "Acme Corporation SRL",
    "cui": "12345678",
    "vatCode": "RO12345678",
    "isVatPayer": true,
    "address": "Strada Exemplu, nr. 10",
    "city": "Bucharest",
    "email": "contact@acme.ro"
  },
  "documentSeries": "INV",
  "discount": 0.00,
  "notes": "Payment by bank transfer within 30 days",
  "paymentTerms": "30 days",
  "invoiceTypeCode": "standard",
  "deliveryLocation": "Strada Exemplu, nr. 10, Bucharest",
  "exchangeRate": 1.0000,
  "anafUploadId": "4567890123",
  "anafUploadDate": "2024-02-15T10:30:00+02:00",
  "anafState": "validated",
  "pdfPath": "/storage/invoices/2024/02/INV-2024-001.pdf",
  "isIncoming": false,
  "isCreditNote": false,
  "lines": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "position": 1,
      "description": "Web Development Services",
      "quantity": 40.0,
      "unitOfMeasure": "hour",
      "unitPrice": 25.00,
      "vatRate": 19.00,
      "vatAmount": 190.00,
      "lineTotal": 1190.00,
      "discount": 0.00
    }
  ],
  "payments": [
    {
      "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
      "amount": 500.00,
      "currency": "RON",
      "paymentDate": "2024-02-20",
      "paymentMethod": "bank_transfer",
      "reference": "Transfer #12345"
    }
  ],
  "createdAt": "2024-02-15T09:00:00+02:00",
  "updatedAt": "2024-02-20T14:30:00+02:00",
  "deletedAt": null
}
```
