---
title: List Companies
description: Retrieve all companies for the current organization
method: GET
endpoint: /api/v1/companies
---

# List Companies

Returns an array of all companies belonging to the authenticated user's organization. Each company includes its basic information, configuration settings, and ANAF token status.

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer {token} |

## Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X GET https://api.storno.ro/api/v1/companies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/v1/companies', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const companies = await response.json();
```
{% /tab %}
{% /tabs %}

## Response

```json
[
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
]
```

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid or missing token |
| 500 | Internal server error |
