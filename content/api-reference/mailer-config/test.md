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
| `testEmail` | string | Recipient for the test message. It must be your own email address or the email address of one of the organization's companies. Defaults to your own address |
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
  -d '{ "testEmail": "your-own-address@example.com" }'
```

## Response

```json
{
  "success": true,
  "message": "Test email sent to your-own-address@example.com."
}
```

When the message cannot be sent, the response is `200` with `success` set to `false` and `error` set to `Test email could not be sent. Check the SMTP host, port, encryption and credentials.` Validation failures return `400` with `success: false` and an `error` message.

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Missing host or invalid from address, a host that is not allowed, or a `testEmail` outside the allowed addresses |
| `401` | Missing or invalid authentication token |
| `403` | Missing `settings.manage` permission, or plan is not Business |
| `404` | Organization not found |
