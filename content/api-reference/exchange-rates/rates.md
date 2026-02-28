---
title: Exchange Rates
description: Get current BNR exchange rates
---

# Exchange Rates

Retrieve current exchange rates from BNR (Banca Națională a României).

---

## Get Exchange Rates

```http
GET /api/v1/exchange-rates
```

Get the latest exchange rates from BNR. Rates are updated daily (typically around 13:00 EET).

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

```json
{
  "date": "2026-02-16",
  "rates": {
    "EUR": 4.9750,
    "USD": 4.5600,
    "GBP": 5.8200,
    "CHF": 5.2100,
    "JPY": 0.0307,
    "CAD": 3.2800,
    "AUD": 2.9400,
    "HUF": 0.0123,
    "CZK": 0.1890,
    "PLN": 1.1200,
    "SEK": 0.4150,
    "DKK": 0.6670,
    "NOK": 0.4280
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| date | string | Date of rates in YYYY-MM-DD format |
| rates | object | Exchange rates to RON |

### Rate Object

Key-value pairs where:
- **Key**: ISO 4217 currency code (e.g., `EUR`, `USD`)
- **Value**: Exchange rate to 1 RON (number with 4 decimal places)

For example, `"EUR": 4.9750` means 1 EUR = 4.9750 RON.

### Supported Currencies

Common currencies include:
- EUR - Euro
- USD - US Dollar
- GBP - British Pound
- CHF - Swiss Franc
- JPY - Japanese Yen
- CAD - Canadian Dollar
- AUD - Australian Dollar
- HUF - Hungarian Forint
- CZK - Czech Koruna
- PLN - Polish Zloty
- SEK - Swedish Krona
- DKK - Danish Krone
- NOK - Norwegian Krone

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |

### Notes

- Rates are cached and updated once daily from BNR
- BNR typically publishes rates around 13:00 EET on business days
- On weekends and holidays, the last available rates are returned
- Rates are used for invoice currency conversion
- All rates are expressed as: 1 foreign currency = X RON
