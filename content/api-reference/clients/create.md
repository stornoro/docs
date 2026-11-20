---
title: Create client
description: Create a new client manually
---

# Create client

Creates a new client for the specified company. If a client with the same CUI already exists, returns the existing client instead of creating a duplicate.

For foreign EU clients with a VAT code, the system automatically validates the VAT number against the EU VIES system and stores the result.

```http
POST /api/v1/clients
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | UUID of the company context. The `company` query parameter is accepted as an alternative, and the header can be omitted when the organization has a single company. Routes addressed by UUID resolve the company from the record |
| `Content-Type` | string | Yes | Must be `application/json` |

### Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Company name or individual full name |
| `type` | string | No | Client type: `company` or `individual` (default: `company`) |
| `cui` | string | No | CUI (tax identification number) for companies |
| `cnp` | string | No | CNP (personal identification number) for individuals |
| `vatCode` | string | No | Full VAT code with country prefix (e.g., `RO12345678`, `DE000000000`) |
| `isVatPayer` | boolean | No | Whether the client is registered for VAT (default: false) |
| `registrationNumber` | string | No | Company registration number |
| `address` | string | Conditional | Street address. Required unless the client is a Romanian company with a `cui`, in which case it is filled from ANAF |
| `city` | string | Conditional | City name. Same rule as `address` |
| `county` | string | Conditional | County. Required for `country` `RO` under the same rule as `address` |
| `country` | string | No | ISO 3166-1 alpha-2 country code (default: `RO`) |
| `postalCode` | string | No | Postal/ZIP code |
| `email` | string | No | Email address |
| `phone` | string | No | Phone number |
| `bankName` | string | No | Bank name |
| `bankAccount` | string | No | Bank account number (IBAN) |
| `defaultPaymentTermDays` | integer | No | Default payment term in days |
| `overdueRemindersDisabled` | boolean | No | `true` keeps this client out of the company's automatic [overdue reminders](/concepts/overdue-reminders) (default: `false`) |
| `contactPerson` | string | No | Contact person name |
| `notes` | string | No | Internal notes |
| `idNumber` | string | No | Client identification number (personal ID, passport, etc.) |
| `currency` | string | No | Preferred currency for this client (ISO 4217: EUR, USD, RON, etc.) |
| `status` | string | No | `active`, `warning` or `blocked` |
| `creditLimit` | number \| null | No | Credit limit in the company currency |
| `affiliated` | boolean | No | Affiliated party flag |

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/clients' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Example GmbH",
    "type": "company",
    "vatCode": "DE000000000",
    "isVatPayer": true,
    "address": "Musterstrasse 1",
    "city": "Berlin",
    "country": "DE",
    "postalCode": "10115",
    "email": "billing@example.com"
  }'
```

## Response

Returns the created client object with status `201 Created`.

```json
{
  "client": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "type": "company",
    "name": "Example GmbH",
    "cui": null,
    "cnp": null,
    "vatCode": "DE000000000",
    "isVatPayer": true,
    "address": "Musterstrasse 1",
    "city": "Berlin",
    "country": "DE",
    "email": "billing@example.com",
    "viesValid": true,
    "status": "active",
    "creditLimit": null,
    "affiliated": false
  },
  "anafValidated": false
}
```

`anafValidated` is `true` when a Romanian company was matched in ANAF and its data filled in. The client object carries the list fields. `viesValidatedAt`, `viesName`, `source`, `county`, `postalCode` and `phone` are returned by [Get client](/api-reference/clients/get).

### Duplicate CUI handling

If a client with the same CUI already exists for this company, the endpoint returns the existing client with `200 OK` instead of creating a duplicate:

```json
{
  "client": { ... },
  "existing": true
}
```

### VIES auto-validation

When a foreign EU client is created with a VAT code, the system automatically validates it against the EU VIES system. The result is stored in:
- `viesValid` — `true` if valid, `false` if invalid, `null` if not applicable
- `viesValidatedAt` and `viesName` — timestamp and registered name, returned by Get client

This only applies to EU member state countries (AT, BE, BG, CY, CZ, DE, DK, EE, EL, ES, FI, FR, HR, HU, IE, IT, LT, LU, LV, MT, NL, PL, PT, SE, SI, SK). Romanian and non-EU clients are not validated.

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found |
| 422 | Missing required fields, returned as `{"errors": [{"key": "name", "message": "Name is required."}]}` |

Other errors have the form `{"error": "message"}`.

## Related Endpoints

- [List clients](/api-reference/clients/list)
- [Get client](/api-reference/clients/get)
- [Create from registry](/api-reference/clients/from-registry)
- [ANAF lookup](/api-reference/clients/anaf-lookup)
