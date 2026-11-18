---
title: Preview PDF Template
description: Generate an HTML preview of a PDF template with sample data
method: POST
endpoint: /api/v1/pdf-template-config/preview
---

# Preview PDF Template

Generates an HTML preview of a PDF template using sample invoice data. Use this to preview how a template will look with specific colors and fonts before saving the configuration.

```
POST /api/v1/pdf-template-config/preview
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
| `templateSlug` | string | No | Template to preview. Default: the company's saved template. An unknown slug is ignored |
| `primaryColor` | string | No | Primary color in hex format (`#RRGGBB`). Invalid values are ignored |
| `fontFamily` | string | No | Font family to preview. Invalid values are ignored |
| `showLogo` | boolean | No | Show the company logo |
| `showBankInfo` | boolean | No | Show bank account info |
| `showVatInRon` | boolean | No | Show the VAT amount in RON |
| `bankDisplaySection` | string | No | `supplier`, `payment` or `both` |
| `bankDisplayMode` | string | No | `stacked` or `inline` |

Fields you leave out use the saved configuration. Nothing is saved.

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/pdf-template-config/preview \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "templateSlug": "modern",
    "primaryColor": "#6366f1"
  }'
```

## Response

Returns the rendered HTML preview.

**Headers:**

| Header | Value |
|--------|-------|
| `Content-Type` | `text/html; charset=UTF-8` |

The response body contains the full HTML document that can be rendered in a browser or converted to PDF.

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `404` | Company not found |
| `500` | Preview generation failed |
