---
title: Get Company
description: Retrieve detailed information for a specific company
method: GET
endpoint: /api/v1/companies/{uuid}
---

# Get Company

Returns detailed information for a specific company, including all configuration settings and ANAF token status.

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
curl -X GET https://api.storno.ro/api/v1/companies/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const companyUuid = '550e8400-e29b-41d4-a716-446655440000';

const response = await fetch(`https://api.storno.ro/api/v1/companies/${companyUuid}`, {
  method: 'GET',
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
  "lastSyncedAt": "2026-02-16T10:30:00Z",
  "syncDaysBack": 30,
  "efacturaDelayHours": 24,
  "archiveEnabled": true,
  "archiveRetentionYears": 10,
  "enabledModules": null,
  "tokenStatus": {
    "hasToken": true,
    "isValid": true,
    "expiresAt": "2026-03-16T10:30:00Z"
  }
}
```

The `enabledModules` field controls sidebar/menu visibility for optional modules. When `null`, all modules are visible (default). When set to an array, only those module keys appear in the navigation. Valid keys: `delivery_notes`, `receipts`, `proforma_invoices`, `recurring_invoices`, `reports`, `efactura`, `spv_messages`.

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - No access to this company |
| 404 | Not Found - Company does not exist |
| 500 | Internal server error |
