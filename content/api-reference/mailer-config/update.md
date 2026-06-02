---
title: Update Email Sender Configuration
description: Configure a custom SMTP email sender for the organization
method: PUT
endpoint: /api/v1/mailer-config
---

# Update Email Sender Configuration

Creates or updates the organization's custom SMTP sender. Requires the **Business** plan; other plans return `403`. Once enabled, invoices, receipts, and delivery notes sent to clients go through this SMTP server from your own address. Omit `password` on update to keep the stored one.

```
PUT /api/v1/mailer-config
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
| `host` | string | Yes (on create) | SMTP host |
| `fromAddress` | string | Yes (on create) | Sender address, authorized on the SMTP server |
| `password` | string | Yes (on create) | SMTP password (omit on update to keep the stored one) |
| `port` | integer | No | SMTP port (default `587`) |
| `encryption` | string | No | `none`, `tls` (STARTTLS, default), or `ssl` (implicit) |
| `username` | string | No | SMTP username |
| `fromName` | string | No | Sender display name |
| `enabled` | boolean | No | Activate or deactivate the custom sender |

## Request

```bash {% title="cURL" %}
curl -X PUT https://api.storno.ro/api/v1/mailer-config \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "host": "smtp.example.com",
    "port": 587,
    "encryption": "tls",
    "username": "facturi@example.com",
    "password": "app-specific-password",
    "fromAddress": "facturi@example.com",
    "fromName": "Acme SRL"
  }'
```

## Response

Returns the saved configuration (without the password). See [Get Email Sender Configuration](/api-reference/mailer-config/get).

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Missing host, invalid from address, invalid encryption, or missing password on create |
| `401` | Missing or invalid authentication token |
| `403` | Missing `settings.manage` permission, or plan is not Business |
| `404` | Organization not found |
