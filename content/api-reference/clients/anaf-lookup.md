---
title: ANAF lookup
description: Look up a Romanian company by CUI in the ANAF registry
---

# ANAF lookup

Looks up a Romanian company by CUI in the ANAF (National Agency for Fiscal Administration) registry without creating a client. Returns company details that can be used to pre-fill a client creation form.

```http
GET /api/v1/clients/anaf-lookup
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cui` | string | Yes | CUI/CIF to look up (with or without `RO` prefix) |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/clients/anaf-lookup?cui=12345678' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Response

Returns the company details from ANAF.

```json
{
  "data": {
    "cui": "12345678",
    "name": "EXEMPLU SRL",
    "address": "Str. Exemplu, Nr. 10",
    "city": "Bucuresti Sectorul 1",
    "county": "Bucuresti",
    "postalCode": "010101",
    "phone": "+40211234567",
    "registrationNumber": "J40/1234/2020",
    "isVatPayer": true,
    "vatCode": "RO12345678"
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `cui` | string | CUI number (without RO prefix) |
| `name` | string | Registered company name |
| `address` | string | Registered street address |
| `city` | string | City (Bucharest sectors are normalized to UBL format) |
| `county` | string | County (Bucharest sectors are normalized) |
| `postalCode` | string \| null | Postal code |
| `phone` | string \| null | Phone number |
| `registrationNumber` | string \| null | Trade register number |
| `isVatPayer` | boolean | Whether the company is registered for VAT |
| `vatCode` | string \| null | Full VAT code with RO prefix (if VAT payer) |

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 404 | CUI not found in ANAF |
| 422 | CUI is required |
| 503 | ANAF lookup service unavailable |

## Related Endpoints

- [Create client](/api-reference/clients/create)
- [Create from registry](/api-reference/clients/from-registry)
