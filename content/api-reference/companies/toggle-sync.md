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

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "SRL Example Company",
  "cif": "12345678",
  "registrationNumber": "J40/1234/2020",
  "vatPayer": true,
  "vatCode": "RO12345678",
  "address": "Strada Exemplu, Nr. 10",
  "city": "Bucuresti",
  "state": "Bucuresti",
  "country": "Romania",
  "sector": "Sector 1",
  "phone": "+40721234567",
  "email": "contact@example.ro",
  "bankName": "Banca Transilvania",
  "bankAccount": "RO49AAAA1B31007593840000",
  "bankBic": "BTRLRO22",
  "defaultCurrency": "RON",
  "syncEnabled": true,
  "lastSyncedAt": null,
  "syncDaysBack": 30,
  "efacturaDelayHours": 24,
  "archiveEnabled": true,
  "archiveRetentionYears": 10,
  "tokenStatus": {
    "hasToken": true,
    "isValid": true,
    "expiresAt": "2026-03-16T10:30:00Z"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - No valid ANAF token exists for this company |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - No access to this company |
| 404 | Not Found - Company does not exist |
| 500 | Internal server error |
