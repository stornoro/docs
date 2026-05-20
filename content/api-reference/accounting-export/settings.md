---
title: Accounting export settings
description: Read and update the company's stored SAGA / WinMentor / Ciel export defaults
---

# Accounting export settings

Per-company defaults consumed by [`POST /api/v1/accounting-export/zip`](/api-reference/accounting-export/zip). The stored values are used unless an export request passes explicit overrides via `options.accounts`.

## Get settings

```
GET /api/v1/accounting-export/settings
```

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

### Response

```json
{
  "saga": {
    "accountCash":      "5311",
    "accountBank":      "5121",
    "accountCard":      "5125.2",
    "accountClients":   "4111",
    "accountSuppliers": "4011",
    "currencyAccounts": {
      "USD": { "cash": "5314", "bank": "5124", "card": "5125.1" },
      "EUR": { "cash": "",     "bank": "",     "card": "5125.3" }
    }
  },
  "winmentor": {
    "bankName":     "",
    "bankNumber":   "",
    "bankLocality": ""
  },
  "ciel": {}
}
```

Missing keys fall back to the defaults shown above (in particular `accountCard` defaults to the SAGA-postable analytic `5125.2`, not the synthetic `5125`). `currencyAccounts` is an open-ended map keyed by ISO 4217 currency code; any empty per-currency field falls back to the corresponding RON account. The receipts/payments exporter splits the SAGA XML output by currency whenever non-RON payments exist (see [`POST /accounting-export/zip`](/api-reference/accounting-export/zip)).

## Update settings

```
PUT /api/v1/accounting-export/settings
```

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body

Partial settings object — keys are deep-merged onto the existing configuration.

```json
{
  "saga": {
    "accountCard": "5125.2"
  }
}
```

### Response

Returns the new, fully-resolved settings (same shape as `GET`).

### Permissions

- `GET` requires `settings.view`.
- `PUT` requires `settings.manage`.
