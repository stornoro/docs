---
title: Series & Numbering
description: How document series and automatic numbering work in Storno.ro.
---

# Series & Numbering

Storno.ro uses document series to generate sequential, formatted document numbers for invoices, proforma invoices, credit notes, and delivery notes.

## Document Series

A document series defines a numbering pattern for a specific document type within a company.

### Series Properties

| Property | Description |
|----------|-------------|
| `prefix` | The series prefix (e.g., `FACT`, `PRO`, `CN`, `AVZ`) |
| `currentNumber` | The last used number in this series |
| `type` | Document type: `invoice`, `proforma`, `credit_note`, `delivery_note` |
| `active` | Whether this series is available for new documents |
| `nextNumber` | Computed: the next number to be assigned (e.g., `FACT-001`) |

### How Numbering Works

When a document is created with a series, the system:

1. Increments `currentNumber` by 1
2. Formats the number with zero-padding (e.g., `001`, `002`)
3. Combines prefix + separator + padded number
4. Assigns the result as the document `number`

**Example:** Series with prefix `FACT` and currentNumber `42`:
- Next document number: `FACT-043`

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
- **Branch offices** — `BUC-`, `CLJ-`

### Series Uniqueness

The prefix must be unique within a company for each document type. You cannot have two invoice series with the same prefix.

## Series Types

| Type | Used For | Example Prefix |
|------|----------|----------------|
| `invoice` | Invoices and credit notes | `FACT`, `FCT`, `INV` |
| `proforma` | Proforma invoices | `PRO`, `PF` |
| `credit_note` | Credit notes | `CN`, `NC` |
| `delivery_note` | Delivery notes | `AVZ`, `DN` |

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

The next document will be numbered 101.

### Deactivating a Series

Deactivated series cannot be used for new documents but existing documents retain their numbers:

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

When a company is added, Storno.ro may auto-create default series based on common Romanian conventions. These have `source: "auto"` and can be modified or deleted.

## Best Practices

- Use short, meaningful prefixes (3-5 characters)
- Create separate series per document type
- Don't change `currentNumber` downward — this can cause duplicate numbers
- Deactivate old series instead of deleting them (preserves document references)
