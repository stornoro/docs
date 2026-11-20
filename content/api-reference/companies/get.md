---
title: Get Company
description: Retrieve detailed information for a specific company
method: GET
endpoint: /api/v1/companies/{uuid}
---

# Get Company

Returns detailed information for a specific company, including all configuration settings. `hasValidToken` tells whether an ANAF token usable for the company exists.

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
  "overdueRemindersEnabled": false,
  "overdueReminderSteps": [
    { "days": 3, "subject": null, "body": null },
    { "days": 7, "subject": null, "body": null },
    { "days": 14, "subject": null, "body": null }
  ],
  "isReadOnly": false,
  "enabledModules": null,
  "deletedAt": null,
  "hardDeleteAt": null,
  "stripeConnect": null,
  "hasValidToken": true
}
```

The `enabledModules` field controls sidebar/menu visibility for optional modules. When `null`, all modules are visible (default). When set to an array, only those module keys appear in the navigation. Valid keys: `delivery_notes`, `receipts`, `proforma_invoices`, `recurring_invoices`, `reports`, `cash_register`, `efactura`, `spv_messages`.

`overdueRemindersEnabled` says whether the automatic [overdue reminders](/concepts/overdue-reminders) are on. `overdueReminderSteps` always holds the steps in effect, sorted by `days`: the default steps (3, 7 and 14 days) when the company has set none. A `subject` or `body` of `null` means the default text.

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - No access to this company |
| 404 | Not Found - Company does not exist |
| 500 | Internal server error |
