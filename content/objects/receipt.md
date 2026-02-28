---
title: Receipt
description: Receipt (Bon Fiscal) object for cash register fiscal documentation
---

# Receipt

The Receipt object represents a fiscal receipt (bon fiscal) issued from a cash register. Receipts document point-of-sale transactions and can optionally be converted into invoices when the customer requires a formal tax document.

## Attributes

| Attribute | Type | In List | In Detail | Description |
|-----------|------|---------|-----------|-------------|
| id | UUID | ✓ | ✓ | Unique identifier |
| number | string | ✓ | ✓ | Receipt number (e.g., "BON-2024-001") |
| status | ReceiptStatus | ✓ | ✓ | Status: draft, issued, invoiced, cancelled |
| currency | string | ✓ | ✓ | 3-letter currency code (e.g., "RON", "EUR") |
| issueDate | date | ✓ | ✓ | Date the receipt was issued (YYYY-MM-DD) |
| subtotal | decimal | ✓ | ✓ | Subtotal before VAT |
| vatTotal | decimal | ✓ | ✓ | Total VAT amount |
| total | decimal | ✓ | ✓ | Total amount including VAT |
| paymentMethod | string | ✓ | ✓ | Payment method: cash, card, mixed, other |
| cashPayment | decimal | ✓ | ✓ | Amount paid in cash |
| cardPayment | decimal | ✓ | ✓ | Amount paid by card |
| otherPayment | decimal | ✓ | ✓ | Amount paid by other method |
| cashRegisterName | string | ✓ | ✓ | Name or identifier of the cash register |
| fiscalNumber | string | ✓ | ✓ | Fiscal serial number of the cash register |
| customerName | string | ✓ | ✓ | Customer name (optional, for B2B receipts) |
| customerCif | string | ✓ | ✓ | Customer CIF/CUI (optional, for B2B receipts) |
| clientName | string | ✓ | ✓ | Virtual field: name of the linked client (if any) |
| client | Client | ✗ | ✓ | Full Client object (if linked) |
| documentSeriesId | UUID | ✗ | ✓ | UUID of the assigned document series. Auto-assigned from the default `receipt` series if not specified at creation |
| documentSeries | string | ✗ | ✓ | Document series prefix |
| notes | text | ✗ | ✓ | Notes about the receipt |
| internalNote | text | ✗ | ✓ | Internal notes (not visible to customer) |
| convertedInvoice | object | ✗ | ✓ | Reference to converted invoice (if status is invoiced) |
| issuedAt | datetime | ✗ | ✓ | Timestamp when issued |
| cancelledAt | datetime | ✗ | ✓ | Timestamp when cancelled |
| lines | array | ✗ | ✓ | Array of ReceiptLine objects |
| createdAt | datetime | ✓ | ✓ | Timestamp when created |
| updatedAt | datetime | ✓ | ✓ | Timestamp of last update |
| deletedAt | datetime | ✓ | ✓ | Soft delete timestamp (null if not deleted) |

## Example

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "BON-2024-001",
  "status": "issued",
  "currency": "RON",
  "issueDate": "2024-02-18",
  "subtotal": 210.92,
  "vatTotal": 40.08,
  "total": 251.00,
  "paymentMethod": "mixed",
  "cashPayment": 100.00,
  "cardPayment": 151.00,
  "otherPayment": 0.00,
  "cashRegisterName": "Casa 1 - Front Desk",
  "fiscalNumber": "AAAA123456",
  "customerName": "Acme SRL",
  "customerCif": "RO12345678",
  "clientName": "Acme SRL",
  "client": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "type": "company",
    "name": "Acme SRL",
    "cui": "12345678",
    "vatCode": "RO12345678",
    "isVatPayer": true,
    "address": "Strada Principala, nr. 10",
    "city": "Cluj-Napoca",
    "email": "office@acme.ro"
  },
  "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
  "documentSeries": "BON",
  "notes": "Thank you for your purchase!",
  "internalNote": "Loyalty card customer",
  "convertedInvoice": null,
  "issuedAt": "2024-02-18T10:15:00+02:00",
  "cancelledAt": null,
  "lines": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "position": 1,
      "description": "Coffee - Espresso",
      "quantity": 2.0,
      "unitOfMeasure": "pcs",
      "unitPrice": 12.61,
      "vatRate": 9.00,
      "vatAmount": 2.27,
      "lineTotal": 27.49,
      "discount": 0.00,
      "productCode": "COF-ESP"
    },
    {
      "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
      "position": 2,
      "description": "Sandwich - Club",
      "quantity": 3.0,
      "unitOfMeasure": "pcs",
      "unitPrice": 29.41,
      "vatRate": 9.00,
      "vatAmount": 7.94,
      "lineTotal": 96.17,
      "discount": 0.00,
      "productCode": "SAN-CLB"
    },
    {
      "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
      "position": 3,
      "description": "Mineral Water 0.5L",
      "quantity": 5.0,
      "unitOfMeasure": "pcs",
      "unitPrice": 5.04,
      "vatRate": 9.00,
      "vatAmount": 2.27,
      "lineTotal": 27.47,
      "discount": 0.00,
      "productCode": "WAT-MIN-05"
    },
    {
      "id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
      "position": 4,
      "description": "Notebook A5",
      "quantity": 2.0,
      "unitOfMeasure": "pcs",
      "unitPrice": 41.18,
      "vatRate": 19.00,
      "vatAmount": 15.65,
      "lineTotal": 97.01,
      "discount": 0.00,
      "productCode": "NOTE-A5"
    }
  ],
  "createdAt": "2024-02-18T10:14:00+02:00",
  "updatedAt": "2024-02-18T10:15:00+02:00",
  "deletedAt": null
}
```

## Workflow

1. **Draft**: Receipt is prepared with line items before printing
2. **Issued**: Receipt is printed and handed to the customer
3. **Invoiced**: Customer requested a formal invoice; receipt was converted to an invoice
4. **Cancelled**: Receipt was voided (requires a cancellation receipt to be issued on the cash register)

## Payment Method Breakdown

The receipt tracks how the customer paid:

| paymentMethod | cashPayment | cardPayment | otherPayment | Description |
|---------------|-------------|-------------|--------------|-------------|
| `cash` | = total | 0 | 0 | Paid entirely in cash |
| `card` | 0 | = total | 0 | Paid entirely by card |
| `other` | 0 | 0 | = total | Voucher, meal ticket, crypto, etc. |
| `mixed` | partial | partial | partial | Combination of payment types |

The sum of `cashPayment + cardPayment + otherPayment` must always equal `total`.

## Notes

- Receipts are issued from a physical or virtual fiscal cash register registered with ANAF
- `fiscalNumber` is the unique serial number assigned to the cash register by the manufacturer
- `cashRegisterName` is a user-defined label to identify which register issued the receipt
- For B2B transactions where the business customer needs a formal invoice, use the convert endpoint
- `customerName` and `customerCif` can be populated for B2B receipts even without linking to a Client object
- Cancelled receipts must have a corresponding cancellation receipt printed on the fiscal device
- PDFs are generated using the company's [PDF template configuration](/objects/pdf-template-config)
