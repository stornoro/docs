---
title: Validate License
description: Validate a self-hosted license key and retrieve the current plan and features.
method: POST
endpoint: /api/v1/licensing/validate
---

# Validate License

Validate a license key issued to a self-hosted instance. Returns the current plan, features, and subscription details. This endpoint is called automatically by self-hosted instances and does not require authentication — the license key itself is the credential.

**No authentication required.**

## Request

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `licenseKey` | string | Yes | 64-character hex license key |
| `instanceName` | string | No | Human-readable name for this instance |
| `instanceUrl` | string | No | Public URL of the self-hosted instance |

### Example Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://app.storno.ro/api/v1/licensing/validate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    "instanceName": "Production Server",
    "instanceUrl": "https://factura.mycompany.ro"
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://app.storno.ro/api/v1/licensing/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    licenseKey: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    instanceName: 'Production Server',
    instanceUrl: 'https://factura.mycompany.ro',
  }),
});

const data = await response.json();
```
{% /tab %}
{% tab label="PHP" %}
```php
$client = new \GuzzleHttp\Client();

$response = $client->post('https://app.storno.ro/api/v1/licensing/validate', [
    'json' => [
        'licenseKey' => 'a1b2c3d4e5f6...64-char-key',
        'instanceName' => 'Production Server',
        'instanceUrl' => 'https://factura.mycompany.ro',
    ],
]);

$data = json_decode($response->getBody(), true);
```
{% /tab %}
{% /tabs %}

## Response

### Success Response (200 OK)

```json
{
  "valid": true,
  "plan": "pro",
  "features": {
    "maxCompanies": 5,
    "maxInvoicesPerMonth": 500,
    "maxUsers": 5,
    "recurringInvoices": true,
    "apiAccess": true,
    "prioritySupport": false
  },
  "organizationName": "SC Firma Mea SRL",
  "currentPeriodEnd": "2026-03-20T00:00:00+00:00",
  "billingUrl": "https://app.storno.ro/settings/billing"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether the license key is valid |
| `plan` | string | Current plan: `free`, `pro`, or `business` |
| `features` | object | Plan feature limits and flags |
| `organizationName` | string | Name of the organization that owns this key |
| `currentPeriodEnd` | string | ISO 8601 timestamp of the billing period end |
| `trialEndsAt` | string | ISO 8601 timestamp (only present during trial) |
| `trialDaysLeft` | integer | Days remaining in trial (only present during trial) |
| `billingUrl` | string | URL to manage the subscription on the SaaS |

### Trial Response

When the organization is in a trial period, additional fields are included:

```json
{
  "valid": true,
  "plan": "pro",
  "features": { ... },
  "organizationName": "SC Firma Mea SRL",
  "trialEndsAt": "2026-03-06T00:00:00+00:00",
  "trialDaysLeft": 14,
  "billingUrl": "https://app.storno.ro/settings/billing"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request — `licenseKey` is missing |
| `401` | Unauthorized — Invalid or revoked license key |
| `403` | Forbidden — Organization is inactive |

### Error Response Examples

**Missing Key (400)**

```json
{
  "error": "licenseKey is required"
}
```

**Invalid Key (401)**

```json
{
  "valid": false,
  "error": "Invalid or revoked license key"
}
```

**Inactive Organization (403)**

```json
{
  "valid": false,
  "error": "Organization is inactive"
}
```

## Usage Notes

- This endpoint is **unauthenticated** — the license key is the credential
- Self-hosted instances should validate every **24 hours** (via `app:license:sync` cron)
- The `instanceName` and `instanceUrl` are stored for identification purposes in the SaaS dashboard
- JWT licenses are validated offline and do not use this endpoint
- No user data or business information is sent in the request
