---
title: Bank Account
description: Bank account object for payment tracking
---

# Bank Account

The BankAccount object represents a bank account associated with a company. Companies can have multiple bank accounts, with one marked as default for invoices.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Unique identifier |
| iban | string | International Bank Account Number |
| bankName | string | Name of the bank |
| currency | string | 3-letter currency code (e.g., "RON", "EUR", "USD") |
| isDefault | boolean | Whether this is the default account for invoices |
| source | string | Source: manual, anaf, import |
| createdAt | datetime | Timestamp when created |
| updatedAt | datetime | Timestamp of last update |
| deletedAt | datetime | Soft delete timestamp (null if not deleted) |

## Example

```json
{
  "id": "e1f2a3b4-c5d6-7890-5678-901234567890",
  "iban": "RO49BTRL01234567890123",
  "bankName": "Banca Transilvania",
  "currency": "RON",
  "isDefault": true,
  "source": "manual",
  "createdAt": "2024-01-05T10:00:00+02:00",
  "updatedAt": "2024-01-05T10:00:00+02:00",
  "deletedAt": null
}
```

## Multiple Accounts Example

```json
[
  {
    "id": "e1f2a3b4-c5d6-7890-5678-901234567890",
    "iban": "RO49BTRL01234567890123",
    "bankName": "Banca Transilvania",
    "currency": "RON",
    "isDefault": true,
    "source": "manual"
  },
  {
    "id": "f2a3b4c5-d6e7-8901-6789-012345678901",
    "iban": "RO49BTRL09876543210987",
    "bankName": "Banca Transilvania",
    "currency": "EUR",
    "isDefault": false,
    "source": "manual"
  },
  {
    "id": "a3b4c5d6-e7f8-9012-7890-123456789012",
    "iban": "RO49RNCB00820456789101",
    "bankName": "BCR",
    "currency": "RON",
    "isDefault": false,
    "source": "manual"
  }
]
```

## Notes

- Only one bank account per currency can be marked as `isDefault: true`
- The default account is automatically selected when creating invoices
- **iban**: Must be a valid IBAN format
- **currency**: Typically matches the company's `defaultCurrency`, but multi-currency accounts are supported
- **source**:
  - `manual` - Created by user
  - `anaf` - Imported from ANAF data
  - `import` - Bulk imported
- Bank accounts can be soft-deleted (marked with `deletedAt`) but remain in database
- When generating invoices, the system selects the appropriate bank account based on invoice currency
