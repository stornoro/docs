---
title: Document Series
description: Document series object for sequential numbering
---

# Document Series

The DocumentSeries object represents a numbering series for documents (invoices, proformas, credit notes, delivery notes). Each series has a prefix and maintains a sequential counter.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Unique identifier |
| prefix | string | Series prefix (e.g., "INV", "PRO", "CN", "DN") |
| currentNumber | integer | Current sequential number |
| type | string | Document type: invoice, proforma, credit_note, delivery_note |
| active | boolean | Whether this series is active and available for use |
| source | string | Source: manual, anaf, import |
| nextNumber | string | Virtual field: formatted next number (prefix + padded number) |
| createdAt | datetime | Timestamp when created |
| updatedAt | datetime | Timestamp of last update |
| deletedAt | datetime | Soft delete timestamp (null if not deleted) |

## Example

```json
{
  "id": "f2a3b4c5-d6e7-8901-6789-012345678901",
  "prefix": "INV",
  "currentNumber": 125,
  "type": "invoice",
  "active": true,
  "source": "manual",
  "nextNumber": "INV-0126",
  "createdAt": "2024-01-01T10:00:00+02:00",
  "updatedAt": "2024-02-15T16:45:00+02:00",
  "deletedAt": null
}
```

## Multiple Series Example

```json
[
  {
    "id": "f2a3b4c5-d6e7-8901-6789-012345678901",
    "prefix": "INV",
    "currentNumber": 125,
    "type": "invoice",
    "active": true,
    "nextNumber": "INV-0126"
  },
  {
    "id": "a3b4c5d6-e7f8-9012-7890-123456789012",
    "prefix": "PRO",
    "currentNumber": 42,
    "type": "proforma",
    "active": true,
    "nextNumber": "PRO-0043"
  },
  {
    "id": "b4c5d6e7-f8a9-0123-8901-234567890123",
    "prefix": "CN",
    "currentNumber": 8,
    "type": "credit_note",
    "active": true,
    "nextNumber": "CN-0009"
  },
  {
    "id": "c5d6e7f8-a9b0-1234-9012-345678901234",
    "prefix": "DN",
    "currentNumber": 15,
    "type": "delivery_note",
    "active": true,
    "nextNumber": "DN-0016"
  },
  {
    "id": "d6e7f8a9-b0c1-2345-0123-456789012345",
    "prefix": "2023-INV",
    "currentNumber": 450,
    "type": "invoice",
    "active": false,
    "nextNumber": "2023-INV-0451"
  }
]
```

## Document Types

- **invoice**: Regular invoices
- **proforma**: Proforma invoices (quotations)
- **credit_note**: Credit notes
- **delivery_note**: Delivery notes

## Number Formatting

The `nextNumber` virtual field formats the next document number:
- Combines `prefix` with `currentNumber + 1`
- Numbers are zero-padded to 4 digits minimum
- Examples:
  - `INV` + 125 → `INV-0126`
  - `PRO` + 5 → `PRO-0006`
  - `2024-INV` + 1234 → `2024-INV-1235`

## Common Series Patterns

### By Year
- `2024-INV`, `2024-PRO`, `2024-CN` - Reset numbering each year

### By Type
- `INV` - Regular invoices
- `PRO` - Proformas
- `CN` - Credit notes
- `DN` - Delivery notes

### By Purpose
- `INV-EXP` - Export invoices
- `INV-RO` - Domestic invoices
- `INV-EU` - EU invoices

## Notes

- Only one series per type should be `active: true` at a time (or users select from multiple)
- The `currentNumber` increments with each issued document
- Inactive series (previous years) remain in system with `active: false`
- **source**:
  - `manual` - Created by user
  - `anaf` - From ANAF configuration
  - `import` - Bulk imported
- Series can be soft-deleted but numbers cannot be reused
- The system automatically locks and increments `currentNumber` to prevent duplicate numbers
