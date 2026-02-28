---
title: Company
description: Company object representing a business entity in the system
---

# Company

The Company object represents a business entity within the system. Each organization can have multiple companies. Companies are the main entities that issue invoices and interact with e-invoice provider systems.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Unique identifier |
| name | string | Company legal name |
| cif | integer | CUI/CIF number (without country prefix) |
| registrationNumber | string | Company registration number (număr de înregistrare) |
| vatPayer | boolean | Whether the company is registered for VAT |
| vatCode | string | Full VAT code with country prefix (e.g., "RO12345678") |
| address | string | Street address |
| city | string | City name |
| state | string | County/state |
| country | string | Country code (e.g., "RO") |
| sector | string | Sector (for Bucharest) |
| phone | string | Phone number |
| email | string | Email address |
| bankName | string | Default bank name |
| bankAccount | string | Default bank account (IBAN) |
| bankBic | string | Bank BIC/SWIFT code |
| defaultCurrency | string | 3-letter default currency code (e.g., "RON") |
| archiveEnabled | boolean | Whether automatic archiving is enabled |
| archiveRetentionYears | integer | How many years to retain archived documents |
| syncEnabled | boolean | Whether e-invoice sync is enabled |
| lastSyncedAt | datetime | Last sync timestamp from e-invoice provider |
| syncDaysBack | integer | How many days back to sync from e-invoice provider |
| efacturaDelayHours | integer | Delay in hours before syncing from e-invoice provider |
| createdAt | datetime | Timestamp when created |
| updatedAt | datetime | Timestamp of last update |

## Example

```json
{
  "id": "a7b8c9d0-e1f2-3456-1234-567890123456",
  "name": "Example Tech SRL",
  "cif": 12345678,
  "registrationNumber": "J40/1234/2020",
  "vatPayer": true,
  "vatCode": "RO12345678",
  "address": "Strada Principală, nr. 42",
  "city": "Bucharest",
  "state": "Bucuresti",
  "country": "RO",
  "sector": "Sector 1",
  "phone": "+40 21 123 4567",
  "email": "contact@exampletech.ro",
  "bankName": "Banca Transilvania",
  "bankAccount": "RO49BTRL01234567890123",
  "bankBic": "BTRLRO22",
  "defaultCurrency": "RON",
  "archiveEnabled": true,
  "archiveRetentionYears": 10,
  "syncEnabled": true,
  "lastSyncedAt": "2024-02-16T08:00:00+02:00",
  "syncDaysBack": 30,
  "efacturaDelayHours": 2,
  "createdAt": "2024-01-01T10:00:00+02:00",
  "updatedAt": "2024-02-16T08:00:00+02:00"
}
```

## E-Invoice Sync Settings

- **syncEnabled**: Master switch for e-invoice provider synchronization
- **syncDaysBack**: Number of days to look back when syncing invoices
- **efacturaDelayHours**: Delay before syncing to allow for provider processing
- **lastSyncedAt**: Tracks when the last successful sync occurred

## Archive Settings

- **archiveEnabled**: Enables automatic document archiving
- **archiveRetentionYears**: How long to keep documents before deletion (typically 10 years for legal compliance)

## Notes

- Each company requires provider-specific credentials to use e-invoice sync (e.g., ANAF OAuth for Romania)
- The **cif** field stores the numeric CUI/CIF without country prefix
- The **vatCode** field includes the country prefix (e.g., "RO12345678")
- Companies belong to organizations and users access them through memberships
- Multiple users can have access to the same company with different permission levels
