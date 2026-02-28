---
title: PDF Template Config
description: PDF template configuration object for customizing document appearance
---

# PDF Template Config

The PDF Template Config object controls how PDFs are generated for a company's invoices, proforma invoices, credit notes, and delivery notes. Each company has a single configuration that applies to all document types.

## Object

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "templateSlug": "classic",
  "primaryColor": "#2563eb",
  "fontFamily": "DejaVu Sans",
  "showLogo": true,
  "showBankInfo": true,
  "footerText": null,
  "customCss": null
}
```

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `templateSlug` | string | Active template design. One of: `classic`, `modern`, `minimal`, `bold` |
| `primaryColor` | string\|null | Primary brand color in hex format (`#RRGGBB`). Falls back to template default if null. |
| `fontFamily` | string\|null | CSS font family for the PDF. Default: `DejaVu Sans` |
| `showLogo` | boolean | Whether to display the company logo. Default: `true` |
| `showBankInfo` | boolean | Whether to display bank account information. Default: `true` |
| `footerText` | string\|null | Custom footer text displayed at the bottom of documents |
| `customCss` | string\|null | Custom CSS styles injected into the PDF template |

## Available Templates

| Slug | Name | Default Color | Description |
|------|------|---------------|-------------|
| `classic` | Clasic | `#2563eb` | Traditional design with clean lines and professional colors |
| `modern` | Modern | `#6366f1` | Modern design with rounded corners and colored header |
| `minimal` | Minimal | `#374151` | Minimalist design with thin lines and compact layout |
| `bold` | Bold | `#dc2626` | Bold design with color bar and large totals |

## Document Language

PDFs support multi-language generation. The language is set per-document (not per-template) via the `language` field on invoices and proforma invoices. Supported languages:

| Code | Language |
|------|----------|
| `ro` | Romanian (default) |
| `en` | English |
| `de` | German |
| `fr` | French |

## Related Endpoints

- [Get PDF Template Configuration](/api-reference/pdf-template-config/get)
- [Update PDF Template Configuration](/api-reference/pdf-template-config/update)
- [List Available Templates](/api-reference/pdf-template-config/list-templates)
- [Preview PDF Template](/api-reference/pdf-template-config/preview)
