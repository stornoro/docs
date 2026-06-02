---
title: Update White-label Configuration
description: Update the organization's white-label branding configuration
method: PUT
endpoint: /api/v1/white-label-config
---

# Update White-label Configuration

Creates or updates the organization's white-label branding. Requires the **Business** plan; requests from other plans return `403`. Fields are merged — only the keys you send are changed.

```
PUT /api/v1/white-label-config
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token or API key for authentication |
| `Content-Type` | string | Yes | `application/json` |

Requires the `settings.manage` permission.

## Body Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | No | Enable or disable white-label branding |
| `appName` | string\|null | No | Custom app name (max 100 chars, `null` to clear) |
| `primaryColor` | string\|null | No | Accent color in hex format (e.g. `#2563eb`), `null` to clear |
| `removeBranding` | boolean | No | Remove the `Storno.ro` footer from generated PDFs and client-facing emails |
| `customDomain` | string\|null | No | Custom domain serving the app and client links (`null` to clear). Changing it resets verification and returns a `dnsRecord` to publish |

The logo is managed through separate endpoints: `POST /api/v1/white-label-config/logo` (multipart upload, field `logo`, PNG/JPG/SVG up to 2MB) and `DELETE /api/v1/white-label-config/logo`. The custom domain is verified via [Verify Custom Domain](/api-reference/white-label-config/verify-domain).

When a custom domain is set but not yet verified, the response includes a `dnsRecord` object (`{ name, type, value }`) — the TXT record to publish before verifying.

## Request

```bash {% title="cURL" %}
curl -X PUT https://api.storno.ro/api/v1/white-label-config \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "appName": "Acme Invoicing",
    "primaryColor": "#2563eb",
    "removeBranding": true
  }'
```

## Response

```json
{
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

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Invalid color format (must be hex, e.g. `#2563eb`) |
| `401` | Missing or invalid authentication token |
| `403` | Missing `settings.manage` permission, or plan is not Business |
| `404` | Organization not found |
