---
title: Update PDF Template Configuration
description: Update the PDF template configuration for a company
method: PUT
endpoint: /api/v1/pdf-template-config
---

# Update PDF Template Configuration

Updates the PDF template configuration for the company. All fields are optional - only include the fields you want to change.

```
PUT /api/v1/pdf-template-config
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token or API key for authentication |
| `X-Company` | string | Conditional | Company UUID. Optional when the organization has a single company. The `?company=` query parameter is also accepted |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateSlug` | string | No | Template design: `classic`, `modern`, `minimal`, or `bold` |
| `primaryColor` | string\|null | No | Primary color in hex format (`#RRGGBB`). Set to `null` to use template default. |
| `fontFamily` | string\|null | No | CSS font family (e.g., `"DejaVu Sans"`, `"Roboto"`). Letters, digits, spaces, commas, quotes and hyphens only, up to 100 characters. An empty string clears it |
| `showLogo` | boolean | No | Display company logo on PDFs (default: `true`) |
| `showBankInfo` | boolean | No | Display bank account info on PDFs (default: `true`) |
| `showVatInRon` | boolean | No | Display the VAT amount converted to RON on foreign-currency invoices (default: `true`). Required by Romanian Fiscal Code art. 319 (20) j for RON VAT payers; no effect on RON invoices. |
| `bankDisplaySection` | string | No | `supplier`, `payment` or `both`. Other values are ignored |
| `bankDisplayMode` | string | No | `stacked` or `inline`. Other values are ignored |
| `defaultNotes` | string\|null | No | Default notes text |
| `defaultPaymentTerms` | string\|null | No | Default payment terms text |
| `defaultPaymentMethod` | string\|null | No | `bank_transfer`, `cash`, `card`, `cheque`, `other` or `null`. Other values are ignored |
| `footerText` | string\|null | No | Custom footer text. Set to `null` to remove. |
| `customCss` | string\|null | No | Custom CSS styles. Set to `null` to remove. It is rejected if it contains `<`, backslashes, control characters or is too long |
| `labelOverrides` | object\|null | No | Per-label overrides, keyed by label name, each with optional `visible` and `text` (up to 200 characters). Unknown label names are dropped. `null` clears all overrides |

## Request

```bash {% title="cURL" %}
curl -X PUT https://api.storno.ro/api/v1/pdf-template-config \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "templateSlug": "modern",
    "primaryColor": "#6366f1",
    "showLogo": true,
    "showBankInfo": true,
    "footerText": "Thank you for your business!"
  }'
```

## Response

Returns the updated configuration object.

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "templateSlug": "modern",
  "primaryColor": "#6366f1",
  "fontFamily": "DejaVu Sans",
  "showLogo": true,
  "showBankInfo": true,
  "showVatInRon": true,
  "bankDisplaySection": "both",
  "bankDisplayMode": "stacked",
  "defaultNotes": null,
  "defaultPaymentTerms": null,
  "defaultPaymentMethod": null,
  "footerText": "Thank you for your business!",
  "customCss": null,
  "labelOverrides": null
}
```

## Validation

- `templateSlug` must be one of: `classic`, `modern`, `minimal`, `bold`
- `primaryColor` must match hex format `#[0-9a-fA-F]{6}` or be `null`

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Invalid JSON body, template slug, color format, font family or custom CSS |
| `401` | Missing or invalid authentication token |
| `403` | Missing the `settings.manage` permission |
| `404` | Company not found |
