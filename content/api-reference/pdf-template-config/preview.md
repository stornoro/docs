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
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateSlug` | string | No | Template to preview (default: `classic`) |
| `primaryColor` | string | No | Primary color to preview in hex format |
| `fontFamily` | string | No | Font family to preview |

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
