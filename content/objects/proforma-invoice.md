---
title: Proforma Invoice
description: Proforma invoice object for quotations and advance billing
---

# Proforma Invoice

The ProformaInvoice object represents proforma invoices (quotations) that can be sent to clients before issuing a final invoice. Proforma invoices can be accepted, rejected, or converted into regular invoices.

## Attributes

| Attribute | Type | In List | In Detail | Description |
|-----------|------|---------|-----------|-------------|
| id | UUID | ✓ | ✓ | Unique identifier |
| number | string | ✓ | ✓ | Proforma number (e.g., "PRO-2024-001") |
| status | ProformaStatus | ✓ | ✓ | Status: draft, sent, accepted, rejected, converted, cancelled |
| currency | string | ✓ | ✓ | 3-letter currency code (e.g., "RON", "EUR") |
| language | string | ✗ | ✓ | Document language for PDF generation: `ro`, `en`, `de`, `fr` (default: `ro`) |
| issueDate | date | ✓ | ✓ | Date the proforma was issued (YYYY-MM-DD) |
| dueDate | date | ✓ | ✓ | Payment due date (YYYY-MM-DD) |
| subtotal | decimal | ✓ | ✓ | Subtotal before VAT |
| vatTotal | decimal | ✓ | ✓ | Total VAT amount |
| total | decimal | ✓ | ✓ | Total amount including VAT |
| clientName | string | ✓ | ✓ | Virtual field: name of the client |
| client | Client | ✗ | ✓ | Full Client object |
| documentSeries | string | ✗ | ✓ | Document series prefix |
| validUntil | date | ✗ | ✓ | Date until which the proforma is valid |
| discount | decimal | ✗ | ✓ | Total discount amount |
| notes | text | ✗ | ✓ | Public notes visible to client |
| paymentTerms | text | ✗ | ✓ | Payment terms description |
| invoiceTypeCode | InvoiceTypeCode | ✗ | ✓ | Type code (standard, reverse_charge, etc.) |
| deliveryLocation | string | ✗ | ✓ | Delivery address |
| projectReference | string | ✗ | ✓ | Project or reference number |
| orderNumber | string | ✗ | ✓ | Purchase order number |
| contractNumber | string | ✗ | ✓ | Contract reference number |
| issuerName | string | ✗ | ✓ | Name of the person issuing the proforma |
| issuerId | string | ✗ | ✓ | ID/CNP of the issuer |
| mentions | text | ✗ | ✓ | Additional mentions on proforma |
| internalNote | text | ✗ | ✓ | Internal notes (not visible to client) |
| salesAgent | string | ✗ | ✓ | Sales agent name |
| exchangeRate | decimal | ✗ | ✓ | Exchange rate used (for foreign currencies) |
| convertedInvoice | object | ✗ | ✓ | Reference to converted invoice (if status is converted) |
| sentAt | datetime | ✗ | ✓ | Timestamp when sent to client |
| acceptedAt | datetime | ✗ | ✓ | Timestamp when accepted by client |
| rejectedAt | datetime | ✗ | ✓ | Timestamp when rejected by client |
| cancelledAt | datetime | ✗ | ✓ | Timestamp when cancelled |
| lines | array | ✗ | ✓ | Array of ProformaInvoiceLine objects |
| createdAt | datetime | ✓ | ✓ | Timestamp when created |
| updatedAt | datetime | ✓ | ✓ | Timestamp of last update |
| deletedAt | datetime | ✓ | ✓ | Soft delete timestamp (null if not deleted) |

## Example

```json
{
  "id": "e5f6a7b8-c9d0-1234-ef12-345678901234",
  "number": "PRO-2024-001",
  "status": "sent",
  "currency": "RON",
  "issueDate": "2024-02-15",
  "dueDate": "2024-03-15",
  "subtotal": 2500.00,
  "vatTotal": 475.00,
  "total": 2975.00,
  "clientName": "Tech Solutions SRL",
  "client": {
    "id": "f6a7b8c9-d0e1-2345-f123-456789012345",
    "type": "company",
    "name": "Tech Solutions SRL",
    "cui": "23456789",
    "vatCode": "RO23456789",
    "isVatPayer": true,
    "address": "Bulevardul Unirii, nr. 25",
    "city": "Cluj-Napoca",
    "email": "office@techsolutions.ro"
  },
  "documentSeries": "PRO",
  "validUntil": "2024-03-31",
  "discount": 0.00,
  "notes": "Valid for 45 days. Payment within 30 days after acceptance.",
  "paymentTerms": "30 days from acceptance",
  "invoiceTypeCode": "standard",
  "deliveryLocation": "Bulevardul Unirii, nr. 25, Cluj-Napoca",
  "projectReference": "PROJ-2024-005",
  "exchangeRate": 1.0000,
  "convertedInvoice": null,
  "sentAt": "2024-02-15T11:00:00+02:00",
  "acceptedAt": null,
  "rejectedAt": null,
  "cancelledAt": null,
  "lines": [
    {
      "id": "a7b8c9d0-e1f2-3456-1234-567890123456",
      "position": 1,
      "description": "Custom Software Development",
      "quantity": 100.0,
      "unitOfMeasure": "hour",
      "unitPrice": 25.00,
      "vatRate": 19.00,
      "vatAmount": 475.00,
      "lineTotal": 2975.00,
      "discount": 0.00
    }
  ],
  "createdAt": "2024-02-15T10:00:00+02:00",
  "updatedAt": "2024-02-15T11:00:00+02:00",
  "deletedAt": null
}
```
