---
title: Delete Email Sender Configuration
description: Remove the organization's custom SMTP email sender
method: DELETE
endpoint: /api/v1/mailer-config
---

# Delete Email Sender Configuration

Removes the organization's custom email sender. Client documents revert to being sent from the default Storno address.

```
DELETE /api/v1/mailer-config
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token or API key for authentication |

Requires the `settings.manage` permission.

## Request

```bash {% title="cURL" %}
curl -X DELETE https://api.storno.ro/api/v1/mailer-config \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Response

```json
{
  "message": "Mailer configuration deleted."
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | Missing `settings.manage` permission |
| `404` | Organization not found, or no configuration exists |
