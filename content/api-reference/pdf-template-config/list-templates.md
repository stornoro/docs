---
title: List Available Templates
description: List all available PDF template designs
method: GET
endpoint: /api/v1/pdf-template-config/templates
---

# List Available Templates

Returns all available PDF template designs with their metadata. Use the `slug` value when updating the PDF template configuration.

```
GET /api/v1/pdf-template-config/templates
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token or API key for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Request

```bash {% title="cURL" %}
curl https://api.storno.ro/api/v1/pdf-template-config/templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```

## Response

```json
[
  {
    "slug": "classic",
    "name": "Clasic",
    "description": "Design traditional cu linii curate si culori profesionale",
    "defaultColor": "#2563eb"
  },
  {
    "slug": "modern",
    "name": "Modern",
    "description": "Design modern cu colturi rotunjite si antet colorat",
    "defaultColor": "#6366f1"
  },
  {
    "slug": "minimal",
    "name": "Minimal",
    "description": "Design minimalist cu linii fine si aspect compact",
    "defaultColor": "#374151"
  },
  {
    "slug": "bold",
    "name": "Indrăzneț",
    "description": "Design puternic cu bara de culoare si totaluri mari",
    "defaultColor": "#dc2626"
  }
]
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | Template identifier used in configuration |
| `name` | string | Human-readable template name |
| `description` | string | Brief description of the template style |
| `defaultColor` | string | Default primary color for this template |

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
