---
title: Supplier
description: Supplier object for incoming invoices
---

# Supplier

The Supplier object represents companies that issue incoming invoices to your company. Suppliers are typically synced from e-invoice provider systems when incoming invoices are downloaded.

## Attributes

| Attribute | Type | In List | In Detail | Description |
|-----------|------|---------|-----------|-------------|
| id | UUID | ✓ | ✓ | Unique identifier |
| name | string | ✓ | ✓ | Supplier company name |
| cif | string | ✓ | ✓ | CUI/CIF (Cod Unic de Identificare) |
| vatCode | string | ✓ | ✓ | Full VAT code with country prefix (e.g., "RO12345678") |
| isVatPayer | boolean | ✓ | ✓ | Whether the supplier is registered for VAT |
| address | string | ✓ | ✓ | Street address |
| city | string | ✓ | ✓ | City name |
| email | string | ✓ | ✓ | Email address |
| registrationNumber | string | ✗ | ✓ | Company registration number (număr de înregistrare) |
| county | string | ✗ | ✓ | County/state |
| country | string | ✗ | ✓ | Country code (e.g., "RO", "DE") |
| postalCode | string | ✗ | ✓ | Postal/ZIP code |
| phone | string | ✗ | ✓ | Phone number |
| bankName | string | ✗ | ✓ | Bank name |
| bankAccount | string | ✗ | ✓ | Bank account number (IBAN) |
| notes | text | ✗ | ✓ | Internal notes about the supplier |
| source | string | ✗ | ✓ | Source: manual, anaf, import |
| lastSyncedAt | datetime | ✗ | ✓ | Last sync timestamp from e-invoice provider |
| createdAt | datetime | ✓ | ✓ | Timestamp when created |
| updatedAt | datetime | ✓ | ✓ | Timestamp of last update |
| deletedAt | datetime | ✓ | ✓ | Soft delete timestamp (null if not deleted) |

## Example

```json
{
  "id": "f6a7b8c9-d0e1-2345-f123-456789012345",
  "name": "Tech Supplies SRL",
  "cif": "98765432",
  "vatCode": "RO98765432",
  "isVatPayer": true,
  "address": "Calea Victoriei, nr. 123",
  "city": "Bucharest",
  "email": "office@techsupplies.ro",
  "registrationNumber": "J40/9876/2018",
  "county": "Bucuresti",
  "country": "RO",
  "postalCode": "010101",
  "phone": "+40 21 987 6543",
  "bankName": "BCR",
  "bankAccount": "RO49RNCB0082045678910123",
  "notes": "Preferred supplier for IT equipment",
  "source": "anaf",
  "lastSyncedAt": "2024-02-15T08:30:00+02:00",
  "createdAt": "2024-01-10T12:00:00+02:00",
  "updatedAt": "2024-02-15T08:30:00+02:00",
  "deletedAt": null
}
```

## Notes

- Suppliers are primarily used for incoming invoices
- Most suppliers are automatically created when downloading invoices from an e-invoice provider
- **source**:
  - `anaf` - Automatically created from e-invoice provider (ANAF in Romania)
  - `manual` - Manually created by user
  - `import` - Bulk imported
- **lastSyncedAt**: Updated when supplier data is refreshed from the e-invoice provider
- Supplier data is extracted from the invoice XML when syncing from the e-invoice provider
- Soft-deleted suppliers have `deletedAt` set but remain in database
