---
title: Currency Conversion
description: Convert amounts between currencies using BNR rates
---

# Currency Conversion

Convert an amount from one currency to another using current BNR exchange rates.

---

## Convert Currency

```http
GET /api/v1/exchange-rates/convert
```

Convert an amount between two currencies using current BNR rates.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| amount | number | Yes | Amount to convert. Must be greater than 0 |
| from | string | No | Source currency code (ISO 4217). Default: `EUR` |
| to | string | No | Target currency code (ISO 4217). Default: `RON` |

### Example Request

```http
GET /api/v1/exchange-rates/convert?amount=100&from=EUR&to=RON
```

### Response

```json
{
  "amount": "497.50",
  "rate": "4.9750",
  "from": "EUR",
  "to": "RON"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| amount | string | Converted amount, with 2 decimals |
| rate | string | Exchange rate used from `from` to `to`, with 4 decimals |
| from | string | Source currency code |
| to | string | Target currency code |

### Conversion Examples

```http
# EUR to RON
GET /api/v1/exchange-rates/convert?amount=100&from=EUR&to=RON
# Result: 497.50 RON

# RON to EUR
GET /api/v1/exchange-rates/convert?amount=497.50&from=RON&to=EUR
# Result: 100.00 EUR

# USD to EUR
GET /api/v1/exchange-rates/convert?amount=100&from=USD&to=EUR
# Result: Uses cross-rate through RON
```

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 400 | `amount` is zero, negative or missing, or a currency is not supported. The body is `{"error": "message"}` |

### Notes

- All conversions use BNR rates (updated daily)
- For non-RON to non-RON conversions, cross-rates through RON are calculated
- The converted amount is rounded to 2 decimal places
- RON is treated as base currency (rate = 1)
- Rates are updated once daily from BNR
