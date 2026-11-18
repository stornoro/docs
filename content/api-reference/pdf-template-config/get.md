---
title: Get PDF Template Configuration
description: Retrieve the PDF template configuration for a company
method: GET
endpoint: /api/v1/pdf-template-config
---

# Get PDF Template Configuration

Returns the PDF template configuration of the company. If none exists yet, a default one with the `classic` template is created and returned.

```
GET /api/v1/pdf-template-config
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token or API key for authentication |
| `X-Company` | string | Conditional | Company UUID. Optional when the organization has a single company. The `?company=` query parameter is also accepted |

## Request

```bash {% title="cURL" %}
curl https://api.storno.ro/api/v1/pdf-template-config \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```

## Response

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "templateSlug": "classic",
  "primaryColor": "#2563eb",
  "fontFamily": "DejaVu Sans",
  "showLogo": true,
  "showBankInfo": true,
  "showVatInRon": true,
  "bankDisplaySection": "both",
  "bankDisplayMode": "stacked",
  "defaultNotes": null,
  "defaultPaymentTerms": null,
  "defaultPaymentMethod": null,
  "footerText": null,
  "customCss": null,
  "labelOverrides": null
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Configuration UUID |
| `templateSlug` | string | Active template design (`classic`, `modern`, `minimal`, `bold`) |
| `primaryColor` | string\|null | Primary brand color in hex format |
| `fontFamily` | string\|null | CSS font family used in PDFs |
| `showLogo` | boolean | Whether the company logo is displayed |
| `showBankInfo` | boolean | Whether bank account info is displayed |
| `showVatInRon` | boolean | Whether the VAT amount in RON is displayed on foreign-currency invoices (Fiscal Code art. 319 (20) j) |
| `bankDisplaySection` | string | Where bank accounts are shown: `supplier`, `payment` or `both` |
| `bankDisplayMode` | string | `stacked` or `inline` |
| `defaultNotes` | string\|null | Default notes text |
| `defaultPaymentTerms` | string\|null | Default payment terms text |
| `defaultPaymentMethod` | string\|null | `bank_transfer`, `cash`, `card`, `cheque`, `other` or `null` |
| `footerText` | string\|null | Custom footer text |
| `customCss` | string\|null | Custom CSS injected into the template |
| `labelOverrides` | object\|null | Per-label overrides, keyed by label name, each with optional `visible` (boolean) and `text` (string, up to 200 characters) |

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `404` | Company not found |
