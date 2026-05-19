---
title: Export invoices, receipts and payments as SAGA XML
description: Single-file SAGA XML exports for outgoing invoices, receipts (incasari) and supplier payments (plati)
---

# Export invoices, receipts and payments as SAGA XML

Three GET endpoints that return one SAGA XML file each — handy when SAGA only needs that single import file (no ZIP, no master data). For a full SAGA bundle (clients, suppliers, products, invoices, receipts, payments) use [`POST /accounting-export/zip`](/api-reference/accounting-export/zip).

## Endpoints

```
GET /api/v1/invoices/export/saga-xml
GET /api/v1/invoices/export/receipts-saga-xml
GET /api/v1/invoices/export/payments-saga-xml
```

| Endpoint | Returns | Root element |
|----------|---------|--------------|
| `/invoices/export/saga-xml` | Outgoing invoices for the active company. Accepts the same query filters as the invoice list. | `<Facturi>` |
| `/invoices/export/receipts-saga-xml` | Receipts (incasari) on **outgoing** invoices. | `<Incasari>` |
| `/invoices/export/payments-saga-xml` | Payments (plati) on **incoming** invoices. | `<Plati>` |

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Query parameters (receipts and payments)

Both `*-saga-xml` payment endpoints accept per-export chart-of-accounts overrides. When omitted, the company’s stored SAGA settings are used (see [accounting export settings](/api-reference/accounting-export/settings)).

| Name | Default | Description |
|------|---------|-------------|
| `accountCash` | stored setting / `5311` | Cont used for `cash` (TipDocument `Chitanta`). |
| `accountBank` | stored setting / `5121` | Cont used for `bank_transfer` (TipDocument `OP`). |
| `accountCard` | stored setting / `5125.2` | Cont used for `card` (TipDocument `Card`). SAGA requires a leaf analytic — `5125` alone is not postable. |

## Example

```bash
curl -G 'https://api.storno.ro/api/v1/invoices/export/receipts-saga-xml' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'X-Company: <COMPANY_UUID>' \
  --data-urlencode 'accountCard=5125.2' \
  -o incasari.xml
```

## Response

```http
Content-Type: application/xml; charset=UTF-8
Content-Disposition: attachment; filename="I_RO<CIF>_multiple_<DD_MM_YYYY>_<DD_MM_YYYY>.xml"
```

Body is the SAGA XML file.

## CodFiscal handling

For card receipts (`TipDocument=Card`), `<CodFiscal>` is emitted empty — SAGA reconciles card flows through the merchant aggregator account. For cash and bank transfers, `<CodFiscal>` is emitted only when the partner has a Romanian CIF/CUI (digits, optional `RO` prefix). Foreign VAT codes (e.g. `DE...`, `BG...`) and internal client IDs are dropped to keep SAGA from rejecting the import line.
