---
title: Credit Note
description: Credit note object for invoice corrections and refunds
---

# Credit Note

Credit notes are represented using the Invoice entity with `isCreditNote: true` and `direction: outgoing`. They are used to correct or cancel previously issued invoices, providing a mechanism for refunds, corrections, or cancellations while maintaining audit compliance.

Credit notes reference their parent invoice through the `parentDocument` field and are synced to the e-invoice provider like regular invoices.

## Attributes

Credit notes use the same attributes as the [Invoice object](/objects/invoice), with these specific characteristics:

- **isCreditNote**: Always `true`
- **direction**: Always `outgoing` (even if correcting an incoming invoice)
- **parentDocument**: Reference to the original invoice being credited
- **total**: Typically negative or zero (representing the refund amount)
- **lines**: Line items typically have negative quantities or prices

All other attributes (status, currency, dates, client, e-invoice sync fields, etc.) function identically to regular invoices.

## Workflow

1. **Creation**: Credit note is created referencing a parent invoice
2. **Validation**: Lines and amounts are validated against parent invoice
3. **Sync**: Credit note is synced to the e-invoice provider like a regular invoice
4. **Application**: The credit amount is applied to the parent invoice balance

## Example

```json
{
  "id": "b8c9d0e1-f2a3-4567-2345-678901234567",
  "number": "CN-2024-001",
  "status": "validated",
  "direction": "outgoing",
  "currency": "RON",
  "issueDate": "2024-02-20",
  "dueDate": "2024-02-20",
  "subtotal": -500.00,
  "vatTotal": -95.00,
  "total": -595.00,
  "clientName": "Acme Corporation SRL",
  "amountPaid": 0.00,
  "balance": -595.00,
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
  "documentSeries": "CN",
  "isCreditNote": true,
  "isIncoming": false,
  "parentDocument": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "number": "INV-2024-001",
    "total": 1190.00
  },
  "notes": "Credit note for partial return of goods - Invoice INV-2024-001",
  "invoiceTypeCode": "standard",
  "anafUploadId": "4567890124",
  "anafUploadDate": "2024-02-20T14:00:00+02:00",
  "anafState": "validated",
  "pdfPath": "/storage/credit-notes/2024/02/CN-2024-001.pdf",
  "lines": [
    {
      "id": "c9d0e1f2-a3b4-5678-3456-789012345678",
      "position": 1,
      "description": "Web Development Services (partial credit)",
      "quantity": -20.0,
      "unitOfMeasure": "hour",
      "unitPrice": 25.00,
      "vatRate": 19.00,
      "vatAmount": -95.00,
      "lineTotal": -595.00,
      "discount": 0.00
    }
  ],
  "createdAt": "2024-02-20T13:00:00+02:00",
  "updatedAt": "2024-02-20T14:00:00+02:00",
  "deletedAt": null
}
```

## Notes

- Credit notes must reference a valid parent invoice
- The total is typically negative, reducing the parent invoice balance
- Credit notes follow the same e-invoice sync workflow as invoices
- Status progression: draft → synced → issued → sent_to_provider → validated
- Credit notes appear in the same invoice list with `isCreditNote: true` filter
