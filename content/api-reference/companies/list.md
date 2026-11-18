---
title: List Companies
description: Retrieve all companies for the current organization
method: GET
endpoint: /api/v1/companies
---

# List Companies

Returns the companies of the authenticated user's organization that the user can access, under `data`. Each company includes its basic information and configuration settings.

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

const { data: companies } = await response.json();
```
{% /tab %}
{% /tabs %}

## Response

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Example Company SRL",
      "cif": "12345678",
      "type": "company",
      "isIndividual": false,
      "registrationNumber": "J40/1234/2020",
      "vatPayer": true,
      "vatCode": "RO12345678",
      "address": "Strada Exemplu, Nr. 10",
      "city": "Bucuresti",
      "state": "Bucuresti",
      "country": "RO",
      "phone": "+40721234567",
      "email": "contact@example.ro",
      "website": null,
      "capitalSocial": null,
      "vatOnCollection": false,
      "oss": false,
      "vatIn": null,
      "eoriCode": null,
      "representative": null,
      "representativeRole": null,
      "caenCode": null,
      "vatPeriod": "monthly",
      "incomeTaxPeriod": "quarterly",
      "hasEmployees": false,
      "bankName": "Banca Transilvania",
      "bankAccount": "RO49AAAA1B31007593840000",
      "bankBic": "BTRLRO22",
      "defaultCurrency": "RON",
      "syncEnabled": true,
      "lastSyncedAt": "2026-02-16T10:30:00+00:00",
      "syncDaysBack": 60,
      "archiveEnabled": true,
      "archiveRetentionYears": 10,
      "efacturaDelayHours": 24,
      "isReadOnly": false,
      "enabledModules": null,
      "deletedAt": null,
      "hardDeleteAt": null,
      "stripeConnect": null
    }
  ]
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid or missing token |
| 404 | No organization found |
| 500 | Internal server error |
