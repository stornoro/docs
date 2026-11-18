---
title: Series & Numbering
description: How document series and automatic numbering work in Storno.ro.
---

# Series & Numbering

Storno.ro uses document series to generate sequential, formatted document numbers for invoices, proforma invoices, credit notes, delivery notes, receipts and vouchers.

## Document Series

A document series defines a numbering pattern for a specific document type within a company.

### Series Properties

| Property | Description |
|----------|-------------|
| `prefix` | The series prefix (e.g., `FACT`, `PRO`, `CN`, `AVZ`) |
| `currentNumber` | The last used number in this series |
| `type` | Document type: `invoice`, `proforma`, `credit_note`, `delivery_note`, `receipt`, `voucher` |
| `isDefault` | Whether this is the default series for its type |
| `source` | How the series was created: `manual`, `default` or `efactura` |
| `active` | Whether this series is considered when the default series for a type is chosen |
| `nextNumber` | Computed string: the next number to be assigned (e.g., `FACT0001`) |

### How Numbering Works

Drafts carry a temporary number. The final number is assigned when the document is issued, under a lock on the series:

1. Increments `currentNumber` by 1
2. Pads the number with zeros to at least 4 digits (e.g., `0001`, `0002`)
3. Appends it directly to the prefix, with no separator
4. Assigns the result as the document `number`

**Example:** Series with prefix `FACT` and currentNumber `42`:
- Next document number: `FACT0043`

### Creating a Series

```bash
curl -X POST https://api.storno.ro/api/v1/document-series \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}" \
  -H "Content-Type: application/json" \
  -d '{
    "prefix": "FACT",
    "type": "invoice",
    "currentNumber": 0
  }'
```

### Multiple Series

A company can have multiple active series per document type. This is useful for:

- **Different business lines** — `FACT-A` for consulting, `FACT-B` for products
- **Yearly series** — `FACT2026`, `FACT2025`
- **Branch offices** — `BUC`, `CLJ`

### Series Uniqueness

The prefix must be unique within a company, across all document types. Creating a second series with an existing prefix returns `409`, even for a different type.

## Series Types

| Type | Used For | Example Prefix |
|------|----------|----------------|
| `invoice` | Invoices | `FACT`, `FCT`, `INV` |
| `proforma` | Proforma invoices | `PRO`, `PF` |
| `credit_note` | Credit notes | `CN`, `NC` |
| `delivery_note` | Delivery notes | `AVZ`, `DN` |
| `receipt` | Receipts | `CH` |
| `voucher` | Vouchers | `BON` |

## Managing Series

### Adjusting the Counter

If you need to skip numbers or align with an existing series:

```bash
curl -X PATCH https://api.storno.ro/api/v1/document-series/{uuid} \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentNumber": 100
  }'
```

The next document will be numbered with 101 (for example `FACT0101`).

### Deactivating a Series

Deactivated series are skipped when the default series for a type is chosen, and existing documents retain their numbers:

```bash
curl -X PATCH https://api.storno.ro/api/v1/document-series/{uuid} \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}" \
  -H "Content-Type: application/json" \
  -d '{
    "active": false
  }'
```

## Auto-Created Series

When a company has no series, Storno.ro creates defaults: `FCT` (invoice), `PRO` (proforma), `CH` (receipt) and `BON` (voucher). These have `source: "default"`. Series created from imported e-Factura invoices have `source: "efactura"`. Series created through the API have `source: "manual"`. All can be modified or deleted.

## Best Practices

- Use short, meaningful prefixes (3-5 characters)
- Create separate series per document type
- Don't change `currentNumber` downward — this can cause duplicate numbers
- Deactivate old series instead of deleting them (preserves document references)
