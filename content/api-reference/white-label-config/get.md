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
    "removeBranding": true,
    "customDomain": "facturi.example.com",
    "customDomainVerified": false,
    "customDomainVerifiedAt": null,
    "dnsRecord": {
      "name": "_storno-verify.facturi.example.com",
      "type": "TXT",
      "value": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"
    }
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
| `data.logoUrl` | string\|null | Path reference to the custom logo, or `null` when none is uploaded. The image itself is served by `GET /api/v1/white-label/logo` with the same auth header |
| `data.primaryColor` | string\|null | Accent color in hex format |
| `data.removeBranding` | boolean | Whether the Storno footer is removed from PDFs and client emails |
| `data.customDomain` | string\|null | Custom domain |
| `data.customDomainVerified` | boolean | Whether the domain's TXT record was verified |
| `data.customDomainVerifiedAt` | string\|null | ISO 8601 time of verification |
| `data.dnsRecord` | object\|null | TXT record to publish (`name`, `type`, `value`). `null` when there is no domain or it is verified |

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | Missing `settings.view` permission |
| `404` | Organization not found |
