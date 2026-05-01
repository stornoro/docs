---
title: Toggle Sync
description: Enable or disable ANAF e-Factura synchronization
method: POST
endpoint: /api/v1/companies/{uuid}/toggle-sync
---

# Toggle Sync

Toggles the ANAF e-Factura synchronization status for a company. Requires a valid ANAF OAuth token for the company's CIF. When enabled, the system will automatically sync invoices from e-Factura according to the configured sync settings.

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer {token} |

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | string | Company UUID |

## Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/companies/550e8400-e29b-41d4-a716-446655440000/toggle-sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const companyUuid = '550e8400-e29b-41d4-a716-446655440000';

const response = await fetch(`https://api.storno.ro/api/v1/companies/${companyUuid}/toggle-sync`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const company = await response.json();
```
{% /tab %}
{% /tabs %}

## Response

The endpoint returns the new sync state, not the full company resource. Read
the full company via `GET /api/v1/companies/{uuid}` if you need the rest.

```json
{
  "syncEnabled": true,
  "message": "Sync enabled"
}
```

When sync was previously enabled the same call disables it:

```json
{
  "syncEnabled": false,
  "message": "Sync disabled"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Unauthorized — invalid or missing JWT |
| 403 | Forbidden — caller lacks `COMPANY_EDIT` on the target company |
| 404 | Not Found — company UUID does not exist |
| 422 | Unprocessable Entity — attempted to **enable** sync but the company has no valid ANAF OAuth token. Response body: `{ "error": "...", "messageKey": "ERR_SYNC_ENABLE_NO_TOKEN" }`. Connect via the ANAF OAuth flow first (`POST /api/v1/anaf/token-links`) and try again. |
| 500 | Internal server error |
