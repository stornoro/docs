---
title: Product
description: Product or service object for invoice line items
---

# Product

The Product object represents goods or services that can be added to invoices, proformas, and other documents. Products can be physical goods or services, and can be synced from ANAF e-Factura system.

## Attributes

| Attribute | Type | In List | In Detail | Description |
|-----------|------|---------|-----------|-------------|
| id | UUID | ✓ | ✓ | Unique identifier |
| name | string | ✓ | ✓ | Product or service name |
| code | string | ✓ | ✓ | Product code/SKU |
| unitOfMeasure | string | ✓ | ✓ | Unit of measure (e.g., "buc", "kg", "ora", "m") |
| defaultPrice | decimal | ✓ | ✓ | Default unit price |
| currency | string | ✓ | ✓ | 3-letter currency code (e.g., "RON", "EUR") |
| vatRate | decimal | ✓ | ✓ | VAT rate percentage (e.g., 19.00, 9.00, 5.00) |
| isService | boolean | ✓ | ✓ | True if service, false if physical product |
| isActive | boolean | ✓ | ✓ | Whether the product is active and available |
| description | text | ✗ | ✓ | Detailed description |
| vatCategoryCode | string | ✗ | ✓ | VAT category code for ANAF (e.g., "S", "Z", "E") |
| source | string | ✗ | ✓ | Source: manual, anaf, import |
| lastSyncedAt | datetime | ✗ | ✓ | Last sync timestamp from ANAF |
| createdAt | datetime | ✓ | ✓ | Timestamp when created |
| updatedAt | datetime | ✓ | ✓ | Timestamp of last update |
| deletedAt | datetime | ✓ | ✓ | Soft delete timestamp (null if not deleted) |

## Example - Physical Product

```json
{
  "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
  "name": "Laptop Dell XPS 15",
  "code": "DELL-XPS15-2024",
  "unitOfMeasure": "buc",
  "defaultPrice": 5500.00,
  "currency": "RON",
  "vatRate": 19.00,
  "isService": false,
  "isActive": true,
  "description": "Laptop Dell XPS 15, Intel i7, 16GB RAM, 512GB SSD",
  "vatCategoryCode": "S",
  "source": "manual",
  "lastSyncedAt": null,
  "createdAt": "2024-01-10T09:00:00+02:00",
  "updatedAt": "2024-02-05T11:30:00+02:00",
  "deletedAt": null
}
```

## Example - Service

```json
{
  "id": "e5f6a7b8-c9d0-1234-ef12-345678901234",
  "name": "Web Development",
  "code": "SRV-WEBDEV",
  "unitOfMeasure": "ora",
  "defaultPrice": 150.00,
  "currency": "RON",
  "vatRate": 19.00,
  "isService": true,
  "isActive": true,
  "description": "Custom web development services - hourly rate",
  "vatCategoryCode": "S",
  "source": "manual",
  "lastSyncedAt": null,
  "createdAt": "2024-01-05T10:00:00+02:00",
  "updatedAt": "2024-01-05T10:00:00+02:00",
  "deletedAt": null
}
```

## Common Units of Measure (Romania)

- **buc** - bucată (piece)
- **kg** - kilogram
- **g** - gram
- **l** - liter
- **m** - meter
- **m2** - square meter
- **m3** - cubic meter
- **ora** - hour (oră)
- **zi** - day (zi)
- **luna** - month (lună)
- **set** - set
- **pachet** - package (pachet)

## VAT Category Codes

- **S** - Standard rate (19%)
- **Z** - Zero rate (0%)
- **E** - Exempt
- **AE** - Reverse charge
- **K** - Intra-community supply
- **G** - Export outside EU
- **O** - Outside scope
- **L** - Canary Islands levy
- **M** - Ceuta/Melilla levy

## Notes

- **isService**: Affects how the product is treated in invoices (services vs goods)
- **isActive**: Inactive products don't appear in product selection dropdowns
- **defaultPrice**: Used as starting price when adding to invoice lines
- **vatRate**: Default VAT rate, can be overridden on individual invoice lines
- **source**: `manual` (user-created), `anaf` (synced from e-Factura), `import` (bulk import)
- Products synced from ANAF have `lastSyncedAt` timestamp
- Soft-deleted products have `deletedAt` set but remain in database
