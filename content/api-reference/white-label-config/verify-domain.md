---
title: Verify Custom Domain
description: Verify the white-label custom domain via its DNS TXT record
method: POST
endpoint: /api/v1/white-label-config/domain/verify
---

# Verify Custom Domain

Checks that the DNS TXT verification record for the configured custom domain has been published. On success the domain is marked verified and becomes the base for client-facing links (invoice share/payment URLs). Requires the **Business** plan.

When you set a `customDomain` via [Update White-label Configuration](/api-reference/white-label-config/update), the response returns a `dnsRecord` to publish:

```
_storno-verify.facturi.example.com.  TXT  "a1b2c3d4e5f6..."
```

```
POST /api/v1/white-label-config/domain/verify
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token or API key for authentication |

Requires the `settings.manage` permission.

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/white-label-config/domain/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Response

```json
{
  "success": true,
  "data": {
    "customDomain": "facturi.example.com",
    "customDomainVerified": true,
    "customDomainVerifiedAt": "2026-06-02T10:30:00+00:00"
  }
}
```

When the record is not found yet:

```json
{
  "success": false,
  "error": "TXT record not found yet. DNS changes can take a few minutes to propagate.",
  "expected": { "name": "_storno-verify.facturi.example.com", "type": "TXT", "value": "a1b2c3d4e5f6..." }
}
```

## Next Step

After verification, point the domain to Storno with a `CNAME` to `app.storno.ro`. TLS for the custom domain is provisioned by the Storno team once the CNAME resolves.

## Error Codes

| Code | Description |
|------|-------------|
| `400` | No domain configured to verify |
| `401` | Missing or invalid authentication token |
| `403` | Missing `settings.manage` permission, or plan is not Business |
| `404` | Organization not found |
