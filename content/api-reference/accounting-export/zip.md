---
title: Accounting export ZIP (SAGA)
description: Export SAGA-compatible XML files (clients, suppliers, products, invoices, receipts, payments) as a single ZIP archive
---

# Accounting export ZIP

Builds a SAGA-compatible XML bundle (clients, suppliers, products, invoices, receipts, payments) and streams it back as a single ZIP archive. The response is the binary ZIP — no async job, no follow-up download endpoint.

```
POST /api/v1/accounting-export/zip
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target` | string | Yes | Currently only `saga` is supported (`winmentor` and `ciel` return a friendly error). |
| `dateFrom` | string | No | ISO date (`YYYY-MM-DD`) — start of the invoices/receipts/payments window. |
| `dateTo` | string | No | ISO date (`YYYY-MM-DD`) — end of the window. |
| `options` | object | No | Per-target options (see below). |

### SAGA options

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `includeDiscount` | boolean | `false` | Emit invoice-level `<FacturaDiscount>` in `<Antet>` when the invoice has a positive discount. |
| `exportAccounts` | boolean | `true` | Also emit `conturi_cli_*.xml` and `conturi_frn_*.xml` (account assignment files). |
| `exportBnr` | boolean | `false` | Include `curs_bnr_*.xml` with the current BNR FX rates. |
| `accounts` | object | — | Per-export chart-of-accounts overrides. Missing keys fall back to the company’s stored SAGA settings; explicit values win for this export only. |

### `options.accounts`

| Field | Default (stored setting) | Description |
|-------|--------------------------|-------------|
| `cash` | `5311` | Account used for cash receipts and cash supplier payments. |
| `bank` | `5121` | Account used for bank transfers (OP). |
| `card` | `5125.2` | Card analytic. **SAGA rejects a synthetic `5125`** — always use a leaf analytic such as `5125.2`. |
| `clients` | `4111` | Used inside `conturi_cli_*.xml` when `exportAccounts` is true. |
| `suppliers` | `4011` | Used inside `conturi_frn_*.xml` when `exportAccounts` is true. |

## Example request

```bash
curl -X POST 'https://api.storno.ro/api/v1/accounting-export/zip' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'X-Company: <COMPANY_UUID>' \
  -H 'Content-Type: application/json' \
  --output saga-export.zip \
  -d '{
    "target": "saga",
    "dateFrom": "2026-04-01",
    "dateTo":   "2026-04-30",
    "options": {
      "includeDiscount": false,
      "exportAccounts":  true,
      "exportBnr":       false,
      "accounts": {
        "cash":      "5311",
        "bank":      "5121",
        "card":      "5125.2",
        "clients":   "4111",
        "suppliers": "4011"
      }
    }
  }'
```

## Response

Returns the ZIP archive directly:

```http
Content-Type: application/zip
Content-Disposition: attachment; filename="saga-export_<CIF>_<DD_MM_YYYY>.zip"
```

The archive contains:

- `cli_<date>.xml` — clients
- `frn_<date>.xml` — suppliers
- `art_<date>.xml` — products
- `F_<CIF>_multiple_<date>.xml` — outgoing invoices
- `inc_<date>.xml` — receipts (incasari) on outgoing invoices
- `plt_<date>.xml` — payments (plati) on incoming invoices
- `conturi_cli_<date>.xml`, `conturi_frn_<date>.xml` — when `exportAccounts=true`
- `curs_bnr_<date>.xml` — when `exportBnr=true`

## Notes on SAGA partner matching

For card receipts/payments (`TipDocument=Card`), `<CodFiscal>` is always emitted empty — SAGA matches card flows through the merchant aggregator account, not a partner CIF. For cash and bank transfers, `<CodFiscal>` is emitted only when the invoice partner has a Romanian CIF/CUI (digits, with the optional `RO` prefix stripped). Foreign VAT identifiers (e.g. `DE...`, `BG...`, `FR...`) and internal client IDs are dropped to avoid SAGA rejecting the import line.

## Settings endpoints

The default chart-of-accounts is stored per company at:

- `GET /api/v1/accounting-export/settings`
- `PUT /api/v1/accounting-export/settings`

Use `options.accounts` here when you need to override those defaults for a single export without persisting a change.
