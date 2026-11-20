---
title: Update Company
description: Update company configuration settings
method: PATCH
endpoint: /api/v1/companies/{uuid}
---

# Update Company

Updates a company. Only the fields present in the body change. The CIF cannot be changed. To reload name, address and VAT status from ANAF, use the `refresh-anaf` action instead.

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
| registrationNumber | string | No | Trade register number |
| vatPayer | boolean | No | Whether the company is a VAT payer |
| vatCode | string | No | VAT code. An empty value clears it |
| vatOnCollection | boolean | No | VAT on collection |
| oss | boolean | No | One Stop Shop registration |
| vatIn | string | No | Intra-community VAT identification number |
| eoriCode | string | No | EORI code |
| address | string | No | Street and number |
| city | string | No | City. Bucharest sectors are normalised |
| state | string | No | County |
| country | string | No | Country code |
| website | string | No | Website |
| capitalSocial | string | No | Share capital |
| representative | string | No | Legal representative |
| representativeRole | string | No | Role of the legal representative |
| bankName | string | No | Bank name |
| bankAccount | string | No | IBAN account number |
| bankBic | string | No | BIC/SWIFT code |
| defaultCurrency | string | No | Default currency code (e.g., "RON", "EUR") |
| caenCode | string | No | Main activity code (CAEN) — the D300 header and SAF-T need it |
| vatPeriod | string | No | `monthly` (default) or `quarterly` — the D300, D394 and SAF-T deadlines of the [fiscal calendar](/api-reference/fiscal-calendar/overview) follow it |
| incomeTaxPeriod | string | No | `quarterly` (default) or `monthly` — the D100 deadline |
| hasEmployees | boolean | No | With employees the company files D112 every month |
| phone | string | No | Contact phone number |
| email | string | No | Contact email address |
| syncDaysBack | integer | No | Number of days to sync back from ANAF |
| efacturaDelayHours | integer \| null | No | Hours to delay e-Factura submission. `null` or one of 2, 24, 48, 72, 96. Any other value returns 400 |
| overdueRemindersEnabled | boolean | No | Turn the automatic [overdue reminders](/concepts/overdue-reminders) on or off. Default `false` |
| overdueReminderSteps | object[] \| null | No | The reminder steps, 1 to 5, each `{ days, subject, body }`. `null` restores the default steps (3, 7 and 14 days). See [Reminder steps](#reminder-steps) |
| archiveEnabled | boolean | No | Enable automatic archiving |
| archiveRetentionYears | integer | No | Years to retain archived data. `null` clears it |
| enabledModules | string[] \| null | No | Array of enabled module keys for sidebar visibility. `null` = all enabled. Valid keys: `delivery_notes`, `receipts`, `proforma_invoices`, `recurring_invoices`, `reports`, `cash_register`, `efactura`, `spv_messages`. When all 8 keys are provided, the server stores `null`. |

### Reminder steps

Each element of `overdueReminderSteps` is one email, sent once per invoice.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| days | integer | Yes | Days after the due date when the step is sent. A whole number from 1 to 365, unique across the steps |
| subject | string \| null | No | Email subject. One line, up to 200 characters, without `<` or `>`. `null` or empty uses the default subject |
| body | string \| null | No | Email body, up to 5000 characters. `null` or empty uses the default body |

`subject` and `body` take the variables `[[client_name]]`, `[[invoice_number]]`, `[[total]]`, `[[balance]]`, `[[currency]]`, `[[due_date]]`, `[[issue_date]]`, `[[days_overdue]]`, `[[company_name]]`, `[[client_outstanding]]`. The response returns the steps in effect, sorted by `days`.

```json
{
  "overdueRemindersEnabled": true,
  "overdueReminderSteps": [
    { "days": 5, "subject": "Factura [[invoice_number]] a depășit scadența", "body": "Bună ziua,\n\nFactura [[invoice_number]] are un rest de plată de [[balance]] [[currency]]." },
    { "days": 15 }
  ]
}
```

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
  "email": "updated@example.ro",
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
  "stripeConnect": null
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - `vatPeriod` or `incomeTaxPeriod` is not `monthly` or `quarterly`, `efacturaDelayHours` is not allowed, `enabledModules` is not `null` or an array of valid keys, or `overdueReminderSteps` breaks a rule of [Reminder steps](#reminder-steps) (the `error` text names the rule) |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - No access to this company |
| 404 | Not Found - Company does not exist |
| 500 | Internal server error |
