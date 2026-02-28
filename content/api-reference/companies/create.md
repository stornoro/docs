---
title: Create Company
description: Add a new company by CIF with automatic ANAF validation
method: POST
endpoint: /api/v1/companies
---

# Create Company

Creates a new company by providing its CIF (tax identification number). The system automatically validates the CIF with ANAF and retrieves the company's official registration data including name, address, VAT status, and other details.

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer {token} |

## Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cif | string | Yes | The CIF/tax ID (e.g., "RO12345678" or "12345678") |

## Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/companies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cif": "12345678"
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const response = await fetch('https://api.storno.ro/api/v1/companies', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cif: '12345678'
  })
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
  "phone": null,
  "email": null,
  "bankName": null,
  "bankAccount": null,
  "bankBic": null,
  "defaultCurrency": "RON",
  "syncEnabled": false,
  "lastSyncedAt": null,
  "syncDaysBack": 30,
  "efacturaDelayHours": 24,
  "archiveEnabled": false,
  "archiveRetentionYears": 10,
  "tokenStatus": {
    "hasToken": false,
    "isValid": false,
    "expiresAt": null
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid CIF format or ANAF validation failed |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - No access |
| 409 | Conflict - Company with this CIF already exists in organization |
| 500 | Internal server error |
