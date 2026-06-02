---
title: Get White-label Configuration
description: Retrieve the organization's white-label branding configuration
method: GET
endpoint: /api/v1/white-label-config
---

# Get White-label Configuration

Returns the organization's white-label branding configuration. White-label is available on the **Business** plan; the `entitled` field reflects whether the current plan allows it. Branding only takes effect when the plan is entitled **and** the configuration is enabled.

```
GET /api/v1/white-label-config
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token or API key for authentication |

Requires the `settings.view` permission.

## Request

```bash {% title="cURL" %}
curl https://api.storno.ro/api/v1/white-label-config \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Response

```json
{
  "entitled": true,
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "enabled": true,
    "appName": "Acme Invoicing",
    "logoUrl": "/v1/white-label/logo",
    "primaryColor": "#2563eb",
    "removeBranding": true
  }
}
```

When no configuration has been created yet, `data` is `null`.

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `entitled` | boolean | Whether the organization's plan (Business) allows white-label |
| `data` | object\|null | The configuration, or `null` if not yet created |
| `data.enabled` | boolean | Whether white-label branding is active |
| `data.appName` | string\|null | Custom app name shown in the app shell and browser tab |
| `data.logoUrl` | string\|null | Relative URL of the custom logo (fetch with the same auth header) |
| `data.primaryColor` | string\|null | Accent color in hex format |
| `data.removeBranding` | boolean | Whether the Storno footer is removed from PDFs and client emails |

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | Missing `settings.view` permission |
| `404` | Organization not found |
