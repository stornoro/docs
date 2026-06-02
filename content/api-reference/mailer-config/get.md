---
title: Get Email Sender Configuration
description: Retrieve the organization's custom SMTP email sender configuration
method: GET
endpoint: /api/v1/mailer-config
---

# Get Email Sender Configuration

Returns the organization's custom email sender (SMTP). Available on the **Business** plan; `entitled` reflects whether the current plan allows it. The SMTP password is never returned — `hasPassword` indicates whether one is stored.

```
GET /api/v1/mailer-config
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token or API key for authentication |

Requires the `settings.view` permission.

## Request

```bash {% title="cURL" %}
curl https://api.storno.ro/api/v1/mailer-config \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Response

```json
{
  "entitled": true,
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "enabled": true,
    "host": "smtp.example.com",
    "port": 587,
    "encryption": "tls",
    "username": "facturi@example.com",
    "fromAddress": "facturi@example.com",
    "fromName": "Acme SRL",
    "hasPassword": true,
    "lastTestedAt": "2026-06-02T10:15:00+00:00"
  }
}
```

When no configuration exists, `data` is `null`.

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `entitled` | boolean | Whether the org's plan (Business) allows a custom sender |
| `data` | object\|null | The configuration, or `null` if not yet created |
| `data.enabled` | boolean | Whether the custom sender is active |
| `data.host` | string | SMTP host |
| `data.port` | integer | SMTP port |
| `data.encryption` | string | `none`, `tls` (STARTTLS), or `ssl` (implicit) |
| `data.username` | string\|null | SMTP username |
| `data.fromAddress` | string | Sender address |
| `data.fromName` | string\|null | Sender display name |
| `data.hasPassword` | boolean | Whether an SMTP password is stored |
| `data.lastTestedAt` | string\|null | ISO-8601 timestamp of the last successful test |

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | Missing `settings.view` permission |
| `404` | Organization not found |
