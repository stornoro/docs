---
title: Create Company
description: Add a company by CIF with automatic ANAF validation, or an individual person by CNP
method: POST
endpoint: /api/v1/companies
---

# Create Company

Creates a new company by providing its CIF (tax identification number). The system automatically validates the CIF with ANAF and retrieves the company's official registration data including name, address, VAT status, and other details.

A **individual person** (persoană fizică) can be added the same way with `type: "individual"`: the landlord who registers rental contracts (C168) and files the annual return (D212) as a person, or anyone who receives invoices in SPV by CNP. Nothing is fetched from ANAF; the CNP is checked (13 digits, first digit 1–8, control digit) and the name, city and county are typed by hand. The person is a company like any other afterwards (`X-Company`, dosare, declarations, invoices received), never a VAT payer, with `type: "individual"` and `isIndividual: true` in every response, and `refresh-anaf` refused with `400 INDIVIDUAL`.

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer {token} |

## Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cif | string | companies | The CIF/tax ID (e.g., "RO12345678" or "12345678") |
| type | string | No | `company` (default) or `individual` |
| cnp | string | individuals | The person's CNP; a CNP sent as `cif` is refused with `422 CNP_NOT_CIF` |
| name | string | individuals | Full name |
| address | string | No | Street and number |
| city | string | individuals | City (București sectors are normalised) |
| state | string | individuals | County |
| country, email, phone | string | No | Default country `RO` |

Individual person:

```json
{ "type": "individual", "cnp": "1800101400016", "name": "POPESCU ION", "address": "Bld. Iuliu Maniu 7", "city": "Sector 6", "state": "București" }
```

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
| 422 | `INVALID_CNP` (control digit), `CNP_NOT_CIF` (a CNP given as `cif`), `VALIDATION_FAILED` (name, city or state missing for a person) |
| 500 | Internal server error |
