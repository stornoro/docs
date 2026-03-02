---
title: Create from registry
description: Create a client from the ONRC registry with ANAF validation
---

# Create from registry

Creates a client by looking up a CUI in the ANAF registry and auto-filling all available details. If a client with the same CUI already exists, returns the existing client instead of creating a duplicate.

This is the recommended way to add Romanian company clients — it ensures all fiscal data (VAT status, registration number, address) is accurate and up to date from official sources.

```http
POST /api/v1/clients/from-registry
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

### Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `cui` | string | Yes | CUI/CIF to look up (with or without `RO` prefix) |
| `name` | string | No | Fallback name if ANAF lookup fails |

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/clients/from-registry' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "cui": "12345678"
  }'
```

## Response

Returns the created client with status `201 Created`, along with whether ANAF validation succeeded.

```json
{
  "client": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "type": "company",
    "name": "EXEMPLU SRL",
    "cui": "12345678",
    "vatCode": "RO12345678",
    "isVatPayer": true,
    "registrationNumber": "J40/1234/2020",
    "address": "Str. Exemplu, Nr. 10",
    "city": "Bucuresti Sectorul 1",
    "county": "Bucuresti",
    "country": "RO",
    "postalCode": "010101",
    "phone": "+40211234567",
    "source": "manual",
    "createdAt": "2026-03-02T12:00:00+02:00"
  },
  "anafValidated": true
}
```

### Duplicate CUI handling

If a client with the same CUI already exists, returns the existing client with `200 OK`:

```json
{
  "client": { ... },
  "existing": true
}
```

### ANAF lookup failure

If the ANAF service is unavailable, the client is still created with the CUI and the fallback `name` (or `"CUI 12345678"` if no name provided). The `anafValidated` field will be `false`.

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found |
| 422 | CUI is required |

## Related Endpoints

- [Create client](/api-reference/clients/create)
- [ANAF lookup](/api-reference/clients/anaf-lookup)
- [List clients](/api-reference/clients/list)
