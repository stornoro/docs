---
title: Invoice Line
description: Invoice line item object for products and services
---

# Invoice Line

The InvoiceLine object represents a single line item on an invoice, proforma, delivery note, or credit note. Lines reference products and include quantity, pricing, and VAT information.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Unique identifier |
| product | object | Product reference (id, name, code) - optional |
| position | integer | Line position/order (1, 2, 3...) |
| description | string | Line item description |
| quantity | decimal | Quantity |
| unitOfMeasure | string | Unit of measure (e.g., "buc", "ora", "kg") |
| unitPrice | decimal | Price per unit (excluding VAT if vatIncluded is false) |
| vatRate | decimal | VAT percentage rate (e.g., 19.00) |
| vatCategoryCode | string | ANAF VAT category code (S, Z, E, etc.) |
| vatAmount | decimal | Total VAT amount for this line |
| lineTotal | decimal | Total line amount including VAT |
| discount | decimal | Discount amount |
| discountPercent | decimal | Discount percentage |
| vatIncluded | boolean | Whether unitPrice includes VAT |
| productCode | string | Product code/SKU |
| createdAt | datetime | Timestamp when created |
| updatedAt | datetime | Timestamp of last update |

## Calculations

The line calculations work as follows:

### When VAT is NOT included in price (vatIncluded = false)
```
subtotal = (unitPrice * quantity) - discount
vatAmount = subtotal * (vatRate / 100)
lineTotal = subtotal + vatAmount
```

### When VAT is included in price (vatIncluded = true)
```
lineTotal = (unitPrice * quantity) - discount
subtotal = lineTotal / (1 + vatRate / 100)
vatAmount = lineTotal - subtotal
```

## Example - Standard Line

```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "product": {
    "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
    "name": "Web Development Services",
    "code": "SRV-WEBDEV"
  },
  "position": 1,
  "description": "Custom web development - 40 hours",
  "quantity": 40.0,
  "unitOfMeasure": "ora",
  "unitPrice": 150.00,
  "vatRate": 19.00,
  "vatCategoryCode": "S",
  "vatAmount": 1140.00,
  "lineTotal": 7140.00,
  "discount": 0.00,
  "discountPercent": 0.00,
  "vatIncluded": false,
  "productCode": "SRV-WEBDEV",
  "createdAt": "2024-02-15T09:00:00+02:00",
  "updatedAt": "2024-02-15T09:00:00+02:00"
}
```

## Example - Line with Discount

```json
{
  "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
  "product": {
    "id": "e5f6a7b8-c9d0-1234-ef12-345678901234",
    "name": "Laptop Dell XPS 15",
    "code": "DELL-XPS15"
  },
  "position": 1,
  "description": "Laptop Dell XPS 15 - 10% discount applied",
  "quantity": 5.0,
  "unitOfMeasure": "buc",
  "unitPrice": 5500.00,
  "vatRate": 19.00,
  "vatCategoryCode": "S",
  "vatAmount": 4655.00,
  "lineTotal": 29155.00,
  "discount": 2750.00,
  "discountPercent": 10.00,
  "vatIncluded": false,
  "productCode": "DELL-XPS15",
  "createdAt": "2024-02-15T10:00:00+02:00",
  "updatedAt": "2024-02-15T10:00:00+02:00"
}
```

## Example - Multiple Lines

```json
[
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "position": 1,
    "description": "Web Development Services",
    "quantity": 40.0,
    "unitOfMeasure": "ora",
    "unitPrice": 150.00,
    "vatRate": 19.00,
    "vatAmount": 1140.00,
    "lineTotal": 7140.00,
    "discount": 0.00,
    "productCode": "SRV-WEBDEV"
  },
  {
    "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
    "position": 2,
    "description": "Hosting Service - 1 year",
    "quantity": 12.0,
    "unitOfMeasure": "luna",
    "unitPrice": 50.00,
    "vatRate": 19.00,
    "vatAmount": 114.00,
    "lineTotal": 714.00,
    "discount": 0.00,
    "productCode": "HOST-YEAR"
  },
  {
    "id": "e5f6a7b8-c9d0-1234-ef12-345678901234",
    "position": 3,
    "description": "SSL Certificate",
    "quantity": 1.0,
    "unitOfMeasure": "buc",
    "unitPrice": 100.00,
    "vatRate": 19.00,
    "vatAmount": 19.00,
    "lineTotal": 119.00,
    "discount": 0.00,
    "productCode": "SSL-CERT"
  }
]
```

## Example - Credit Note Line (Negative)

```json
{
  "id": "f6a7b8c9-d0e1-2345-f123-456789012345",
  "position": 1,
  "description": "Web Development Services (credit - overpayment)",
  "quantity": -10.0,
  "unitOfMeasure": "ora",
  "unitPrice": 150.00,
  "vatRate": 19.00,
  "vatCategoryCode": "S",
  "vatAmount": -285.00,
  "lineTotal": -1785.00,
  "discount": 0.00,
  "discountPercent": 0.00,
  "vatIncluded": false,
  "productCode": "SRV-WEBDEV",
  "createdAt": "2024-02-20T13:00:00+02:00",
  "updatedAt": "2024-02-20T13:00:00+02:00"
}
```

## Notes

- **position**: Determines display order (1 is first line, 2 is second, etc.)
- **product**: Optional reference to Product object (can be null for custom lines)
- **description**: Free text description shown on invoice (can differ from product name)
- **quantity**: Can be negative for credit notes
- **unitPrice**: Price per unit, interpretation depends on `vatIncluded`
- **vatIncluded**:
  - `false` - Price excludes VAT (most common for B2B)
  - `true` - Price includes VAT (common for B2C retail)
- **discount**: Can be absolute amount or calculated from `discountPercent`
- **productCode**: Stored for reference even if product is later deleted
- All amounts are calculated and stored for performance (not computed on-the-fly)
- Line items share the `DocumentLineFieldsTrait` with other document types
