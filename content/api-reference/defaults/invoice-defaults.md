---
title: Invoice Defaults
description: Get default values and configuration for invoices
---

# Invoice Defaults

Retrieve default values and dropdown options for invoice creation, including VAT rates, currencies, payment terms, exchange rates, and client-specific VAT rule indicators.

---

## Get Invoice Defaults

```http
GET /api/v1/invoice-defaults?clientId={clientId}
```

Get all default values and configuration options for invoice creation. This endpoint provides all dropdown options and current exchange rates needed by invoice forms. When a `clientId` is provided, it also returns client-specific VAT rule indicators (reverse charge, OSS, export).

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | Yes | Company UUID |

### Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| clientId | string | No | Client UUID. When provided, returns client-specific VAT flags: `reverseCharge`, `ossApplicable`, `exportApplicable`. |

### Response

```json
{
  "vatRates": [
    {
      "rate": "21",
      "label": "Standard 21%",
      "categoryCode": "S",
      "default": true
    },
    {
      "rate": "9",
      "label": "Redus 9%",
      "categoryCode": "S",
      "default": false
    },
    {
      "rate": "5",
      "label": "Redus 5%",
      "categoryCode": "S",
      "default": false
    },
    {
      "rate": "0",
      "label": "Scutit",
      "categoryCode": "Z",
      "default": false
    }
  ],
  "currencies": ["RON", "EUR", "USD", "GBP", "CHF", "HUF", "CZK", "PLN", "BGN", "SEK", "NOK", "DKK"],
  "defaultCurrency": "RON",
  "defaultPaymentTermDays": 30,
  "defaultUnitOfMeasure": "buc",
  "unitsOfMeasure": [
    {
      "value": "buc",
      "label": "buc (Bucata)",
      "code": "H87"
    },
    {
      "value": "ora",
      "label": "ora (Ora)",
      "code": "HUR"
    }
  ],
  "documentSeriesTypes": [
    { "value": "invoice", "label": "Factura" },
    { "value": "proforma", "label": "Proforma" },
    { "value": "credit_note", "label": "Nota de credit" },
    { "value": "delivery_note", "label": "Aviz de insotire" }
  ],
  "paymentMethods": [
    { "value": "bank_transfer", "label": "Transfer bancar" },
    { "value": "cash", "label": "Numerar" },
    { "value": "card", "label": "Card" },
    { "value": "cheque", "label": "Cec / Bilet la ordin" },
    { "value": "other", "label": "Altele" }
  ],
  "exchangeRates": {
    "EUR": 4.975,
    "USD": 4.56
  },
  "exchangeRateDate": "2026-03-01",
  "isVatPayer": true,
  "reverseCharge": false,
  "exportApplicable": false,
  "ossApplicable": false,
  "ossVatRate": null,
  "ossVatRates": [],
  "countries": [
    { "code": "RO", "label": "Romania" },
    { "code": "DE", "label": "Germania" }
  ],
  "counties": [
    { "code": "B", "label": "Bucuresti" },
    { "code": "CJ", "label": "Cluj" }
  ]
}
```

### Response Fields

#### VAT Rates
| Field | Type | Description |
|-------|------|-------------|
| rate | string | VAT rate percentage (e.g., "21", "9", "0") |
| label | string | Display label |
| categoryCode | string | UBL VAT category code: `S` (standard), `Z` (zero), `AE` (reverse charge), `E` (exempt) |
| default | boolean | Whether this is the pre-selected rate. When `reverseCharge` or `exportApplicable` is true, the 0% rate is default. |

#### Client-Specific VAT Flags
| Field | Type | Description |
|-------|------|-------------|
| isVatPayer | boolean | Whether the company is a VAT payer |
| reverseCharge | boolean | `true` when the client is an EU company with a valid VIES VAT number. A "Taxare inversă / Reverse Charge" rate (0%, category AE) is prepended to vatRates. |
| exportApplicable | boolean | `true` when the client is in a non-EU country. The 0% rate becomes the default. Use `autoApplyVatRules` on invoice creation to automatically set lines to 0% VAT with category Z. |
| ossApplicable | boolean | `true` when the client is in an EU country (not RO), the company has OSS enabled, and the client is not VIES-valid. Destination country VAT rates are returned in `ossVatRates`. |
| ossVatRate | object\|null | The standard OSS rate for the destination country (backwards compatibility). Contains `rate`, `label`, `categoryCode`. |
| ossVatRates | array | All available OSS VAT rates for the destination country (standard, reduced, etc.). Each has `rate`, `label`, `categoryCode`, `default`. |

#### Currencies
Array of ISO 4217 currency codes (e.g., `["RON", "EUR", "USD", ...]`).

#### Document Series Types
| Field | Type | Description |
|-------|------|-------------|
| value | string | Series type identifier: `invoice`, `proforma`, `credit_note`, `delivery_note` |
| label | string | Display label in Romanian |

#### Payment Methods
| Field | Type | Description |
|-------|------|-------------|
| value | string | Method identifier: `bank_transfer`, `cash`, `card`, `cheque`, `other` |
| label | string | Method name in Romanian |

#### Units of Measure
| Field | Type | Description |
|-------|------|-------------|
| value | string | Unit code (e.g., `buc`, `ora`, `kg`) |
| label | string | Display label with full name |
| code | string | UBL/UN/ECE unit code (e.g., `H87`, `HUR`, `KGM`) |

#### Exchange Rates
| Field | Type | Description |
|-------|------|-------------|
| exchangeRates | object | Key-value pairs: currency code → rate to RON. Updated daily from BNR. |
| exchangeRateDate | string\|null | Date of the exchange rates (ISO 8601: YYYY-MM-DD) |

#### Countries & Counties
| Field | Type | Description |
|-------|------|-------------|
| countries | array | ISO 3166-1 alpha-2 country codes with Romanian labels |
| counties | array | Romanian county codes with labels (for `countrySubentity` field) |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - no access to company |

### Notes

- VAT rates are loaded from the company's configured rates (not hardcoded)
- When the company is not a VAT payer, the 0% rate becomes default
- Exchange rates reflect the latest BNR (Banca Națională a României) rates
- Frontend and mobile apps MUST NOT hardcode these values
- Use this endpoint to populate invoice form dropdowns
- Pass `clientId` to get VAT rule indicators before creating an invoice
