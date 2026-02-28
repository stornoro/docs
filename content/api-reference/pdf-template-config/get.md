---
title: Get PDF Template Configuration
description: Retrieve the PDF template configuration for a company
method: GET
endpoint: /api/v1/pdf-template-config
---

# Get PDF Template Configuration

Returns the current PDF template configuration for the company. If no configuration exists, returns a default configuration with the `classic` template.

```
GET /api/v1/pdf-template-config
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token or API key for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

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
  "footerText": null,
  "customCss": null
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
| `footerText` | string\|null | Custom footer text |
| `customCss` | string\|null | Custom CSS injected into the template |

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `404` | Company not found |
