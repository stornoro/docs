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
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateSlug` | string | No | Template design: `classic`, `modern`, `minimal`, or `bold` |
| `primaryColor` | string\|null | No | Primary color in hex format (`#RRGGBB`). Set to `null` to use template default. |
| `fontFamily` | string\|null | No | CSS font family (e.g., `"DejaVu Sans"`, `"Roboto"`) |
| `showLogo` | boolean | No | Display company logo on PDFs (default: `true`) |
| `showBankInfo` | boolean | No | Display bank account info on PDFs (default: `true`) |
| `footerText` | string\|null | No | Custom footer text. Set to `null` to remove. |
| `customCss` | string\|null | No | Custom CSS styles. Set to `null` to remove. |

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
  "footerText": "Thank you for your business!",
  "customCss": null
}
```

## Validation

- `templateSlug` must be one of: `classic`, `modern`, `minimal`, `bold`
- `primaryColor` must match hex format `#[0-9a-fA-F]{6}` or be `null`

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Invalid template slug or color format |
| `401` | Missing or invalid authentication token |
| `404` | Company not found |
