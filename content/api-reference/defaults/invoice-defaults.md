---
title: Invoice Defaults
description: Get default values and configuration for invoices
---

# Invoice Defaults

Retrieve default values and dropdown options for invoice creation, including VAT rates, currencies, payment terms, and exchange rates.

---

## Get Invoice Defaults

```http
GET /api/v1/invoice-defaults
```

Get all default values and configuration options for invoice creation. This endpoint provides all dropdown options and current exchange rates needed by invoice forms.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | Yes | Company UUID |

### Response

```json
{
  "vatRates": [
    {
      "value": 19,
      "label": "19% - Cota standard"
    },
    {
      "value": 9,
      "label": "9% - Cota redusă"
    },
    {
      "value": 5,
      "label": "5% - Cota redusă"
    },
    {
      "value": 0,
      "label": "0% - Scutit"
    }
  ],
  "currencies": [
    {
      "value": "RON",
      "label": "RON - Leu românesc",
      "symbol": "RON"
    },
    {
      "value": "EUR",
      "label": "EUR - Euro",
      "symbol": "€"
    },
    {
      "value": "USD",
      "label": "USD - Dolar american",
      "symbol": "$"
    },
    {
      "value": "GBP",
      "label": "GBP - Liră sterlină",
      "symbol": "£"
    }
  ],
  "paymentTerms": [
    {
      "value": 0,
      "label": "Plată la livrare"
    },
    {
      "value": 15,
      "label": "15 zile"
    },
    {
      "value": 30,
      "label": "30 zile"
    },
    {
      "value": 45,
      "label": "45 zile"
    },
    {
      "value": 60,
      "label": "60 zile"
    }
  ],
  "unitsOfMeasure": [
    {
      "value": "BUC",
      "label": "Bucată"
    },
    {
      "value": "ORE",
      "label": "Oră"
    },
    {
      "value": "ZI",
      "label": "Zi"
    },
    {
      "value": "KG",
      "label": "Kilogram"
    },
    {
      "value": "M",
      "label": "Metru"
    },
    {
      "value": "M2",
      "label": "Metru pătrat"
    },
    {
      "value": "L",
      "label": "Litru"
    },
    {
      "value": "SET",
      "label": "Set"
    }
  ],
  "paymentMethods": [
    {
      "value": "transfer",
      "label": "Transfer bancar"
    },
    {
      "value": "cash",
      "label": "Numerar"
    },
    {
      "value": "card",
      "label": "Card"
    },
    {
      "value": "cec",
      "label": "Cec"
    }
  ],
  "exchangeRates": {
    "EUR": 4.9750,
    "USD": 4.5600,
    "GBP": 5.8200,
    "CHF": 5.2100
  }
}
```

### Response Fields

#### VAT Rates
| Field | Type | Description |
|-------|------|-------------|
| value | integer | VAT rate percentage |
| label | string | Display label in Romanian |

#### Currencies
| Field | Type | Description |
|-------|------|-------------|
| value | string | ISO 4217 currency code |
| label | string | Currency name in Romanian |
| symbol | string | Currency symbol |

#### Payment Terms
| Field | Type | Description |
|-------|------|-------------|
| value | integer | Number of days |
| label | string | Display label in Romanian |

#### Units of Measure
| Field | Type | Description |
|-------|------|-------------|
| value | string | Unit code |
| label | string | Unit name in Romanian |

#### Payment Methods
| Field | Type | Description |
|-------|------|-------------|
| value | string | Method identifier |
| label | string | Method name in Romanian |

#### Exchange Rates
Key-value pairs where:
- **Key**: ISO 4217 currency code (e.g., `EUR`, `USD`)
- **Value**: Exchange rate to RON

Exchange rates are updated daily from BNR (Banca Națională a României).

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - no access to company |

### Notes

- All dropdown options are fetched from backend configuration
- Exchange rates reflect the latest BNR rates
- Frontend and mobile apps MUST NOT hardcode these values
- Use this endpoint to populate invoice form dropdowns
