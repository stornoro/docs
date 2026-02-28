---
title: Client
description: Client object representing companies and individuals
---

# Client

The Client object represents customers who receive invoices and other documents. Clients can be companies (legal entities) or individuals, and can be synced from e-invoice provider systems.

## Attributes

| Attribute | Type | In List | In Detail | Description |
|-----------|------|---------|-----------|-------------|
| id | UUID | ✓ | ✓ | Unique identifier |
| type | string | ✓ | ✓ | Client type: company or individual |
| name | string | ✓ | ✓ | Company name or individual full name |
| cui | string | ✓ | ✓ | CUI (Cod Unic de Identificare) for companies |
| cnp | string | ✓ | ✓ | CNP (Cod Numeric Personal) for individuals |
| vatCode | string | ✓ | ✓ | Full VAT code with country prefix (e.g., "RO12345678") |
| isVatPayer | boolean | ✓ | ✓ | Whether the client is registered for VAT |
| address | string | ✓ | ✓ | Street address |
| city | string | ✓ | ✓ | City name |
| email | string | ✓ | ✓ | Email address for invoices and communications |
| contactPerson | string | ✓ | ✓ | Contact person name |
| clientCode | string | ✓ | ✓ | Custom client code/reference |
| registrationNumber | string | ✗ | ✓ | Company registration number (număr de înregistrare) |
| county | string | ✗ | ✓ | County/state |
| country | string | ✗ | ✓ | Country code (e.g., "RO", "DE") |
| postalCode | string | ✗ | ✓ | Postal/ZIP code |
| phone | string | ✗ | ✓ | Phone number |
| bankName | string | ✗ | ✓ | Bank name for payments |
| bankAccount | string | ✗ | ✓ | Bank account number (IBAN) |
| defaultPaymentTermDays | integer | ✗ | ✓ | Default payment term in days |
| notes | text | ✗ | ✓ | Internal notes about the client |
| source | string | ✗ | ✓ | Source: manual, anaf, import |
| lastSyncedAt | datetime | ✗ | ✓ | Last sync timestamp from e-invoice provider |
| createdAt | datetime | ✓ | ✓ | Timestamp when created |
| updatedAt | datetime | ✓ | ✓ | Timestamp of last update |
| deletedAt | datetime | ✓ | ✓ | Soft delete timestamp (null if not deleted) |

## Example - Company Client

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "type": "company",
  "name": "Acme Corporation SRL",
  "cui": "12345678",
  "cnp": null,
  "vatCode": "RO12345678",
  "isVatPayer": true,
  "address": "Strada Exemplu, nr. 10",
  "city": "Bucharest",
  "email": "billing@acme.ro",
  "contactPerson": "Ion Popescu",
  "clientCode": "ACME-001",
  "registrationNumber": "J40/1234/2020",
  "county": "Bucuresti",
  "country": "RO",
  "postalCode": "010101",
  "phone": "+40 21 123 4567",
  "bankName": "Banca Transilvania",
  "bankAccount": "RO49AAAA1B31007593840000",
  "defaultPaymentTermDays": 30,
  "notes": "VIP client - priority support",
  "source": "manual",
  "lastSyncedAt": null,
  "createdAt": "2024-01-15T10:00:00+02:00",
  "updatedAt": "2024-02-10T14:30:00+02:00",
  "deletedAt": null
}
```

## Example - Individual Client

```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "type": "individual",
  "name": "Maria Ionescu",
  "cui": null,
  "cnp": "2850123456789",
  "vatCode": null,
  "isVatPayer": false,
  "address": "Bulevardul Libertății, nr. 5, Ap. 12",
  "city": "Brașov",
  "email": "maria.ionescu@email.ro",
  "contactPerson": null,
  "clientCode": "IND-042",
  "registrationNumber": null,
  "county": "Brașov",
  "country": "RO",
  "postalCode": "500123",
  "phone": "+40 744 123 456",
  "bankName": null,
  "bankAccount": null,
  "defaultPaymentTermDays": 15,
  "notes": "Individual client - cash payments preferred",
  "source": "manual",
  "lastSyncedAt": null,
  "createdAt": "2024-02-01T11:00:00+02:00",
  "updatedAt": "2024-02-01T11:00:00+02:00",
  "deletedAt": null
}
```

## Notes

- **type**: Use `company` for legal entities, `individual` for natural persons
- **cui** vs **cnp**: Companies use CUI, individuals use CNP
- **vatCode**: Full VAT code with country prefix (RO prefix for Romania)
- **isVatPayer**: Determines whether VAT is applied on invoices
- **source**: `manual` (user-created), `anaf` (synced from e-invoice provider), `import` (bulk import)
- Clients synced from an e-invoice provider have `lastSyncedAt` timestamp
- Soft-deleted clients have `deletedAt` set but remain in database
