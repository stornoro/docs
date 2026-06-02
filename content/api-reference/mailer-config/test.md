---
title: Test Email Sender
description: Send a test message through the custom SMTP sender
method: POST
endpoint: /api/v1/mailer-config/test
---

# Test Email Sender

Sends a test message through the custom SMTP sender to verify the connection and credentials. Uses the stored configuration unless overridden in the body. Requires the **Business** plan. A successful test updates `lastTestedAt` on the stored configuration.

```
POST /api/v1/mailer-config/test
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token or API key for authentication |
| `Content-Type` | string | Yes | `application/json` |

Requires the `settings.manage` permission.

## Body Parameters

All optional — any omitted field falls back to the stored configuration.

| Field | Type | Description |
|-------|------|-------------|
| `testEmail` | string | Recipient for the test message (defaults to the from address) |
| `host` | string | Override SMTP host |
| `port` | integer | Override SMTP port |
| `encryption` | string | Override encryption (`none`, `tls`, `ssl`) |
| `username` | string | Override SMTP username |
| `password` | string | Override SMTP password |
| `fromAddress` | string | Override sender address |
| `fromName` | string | Override sender display name |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/mailer-config/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "testEmail": "me@example.com" }'
```

## Response

```json
{
  "success": true,
  "message": "Test email sent to me@example.com."
}
```

On failure, `success` is `false` and `error` contains the SMTP error message.

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Missing host or invalid from address |
| `401` | Missing or invalid authentication token |
| `403` | Missing `settings.manage` permission, or plan is not Business |
| `404` | Organization not found |
