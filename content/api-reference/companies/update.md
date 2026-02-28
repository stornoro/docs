---
title: Update Company
description: Update company configuration settings
method: PATCH
endpoint: /api/v1/companies/{uuid}
---

# Update Company

Updates configuration settings for a company. Note that core ANAF data (CIF, registration number, VAT status, official address) cannot be modified as they are synced from official sources.

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer {token} |

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | string | Company UUID |

## Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No | Company display name |
| bankName | string | No | Bank name |
| bankAccount | string | No | IBAN account number |
| bankBic | string | No | BIC/SWIFT code |
| defaultCurrency | string | No | Default currency code (e.g., "RON", "EUR") |
| phone | string | No | Contact phone number |
| email | string | No | Contact email address |
| syncDaysBack | integer | No | Number of days to sync back from ANAF (1-365) |
| efacturaDelayHours | integer | No | Hours to delay e-Factura sync (0-72) |
| archiveEnabled | boolean | No | Enable automatic archiving |
| archiveRetentionYears | integer | No | Years to retain archived data (1-50) |
| enabledModules | string[] \| null | No | Array of enabled module keys for sidebar visibility. `null` = all enabled. Valid keys: `delivery_notes`, `receipts`, `proforma_invoices`, `recurring_invoices`, `reports`, `efactura`, `spv_messages`. When all 7 keys are provided, the server stores `null`. |

## Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X PATCH https://api.storno.ro/api/v1/companies/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+40721234567",
    "email": "updated@example.ro",
    "bankName": "Banca Transilvania",
    "bankAccount": "RO49AAAA1B31007593840000",
    "syncDaysBack": 60
  }'
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const companyUuid = '550e8400-e29b-41d4-a716-446655440000';

const response = await fetch(`https://api.storno.ro/api/v1/companies/${companyUuid}`, {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone: '+40721234567',
    email: 'updated@example.ro',
    bankName: 'Banca Transilvania',
    bankAccount: 'RO49AAAA1B31007593840000',
    syncDaysBack: 60
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
  "phone": "+40721234567",
  "email": "updated@example.ro",
  "bankName": "Banca Transilvania",
  "bankAccount": "RO49AAAA1B31007593840000",
  "bankBic": "BTRLRO22",
  "defaultCurrency": "RON",
  "syncEnabled": true,
  "lastSyncedAt": "2026-02-16T10:30:00Z",
  "syncDaysBack": 60,
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

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation failed for provided parameters |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - No access to this company |
| 404 | Not Found - Company does not exist |
| 500 | Internal server error |
