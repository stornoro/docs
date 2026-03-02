---
title: VIES lookup
description: Validate a VAT code against the EU VIES system
---

# VIES lookup

Validates a VAT code against the EU VIES (VAT Information Exchange System) API. Returns whether the VAT number is valid and the registered company name/address. Use this to verify EU intra-community VAT numbers before applying reverse charge.

```http
GET /api/v1/clients/vies-lookup
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
| `vatCode` | string | Yes | Full EU VAT code including country prefix (e.g., `DE123456789`, `FR12345678901`) |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/clients/vies-lookup?vatCode=DE812526315' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": {
    "valid": true,
    "name": "EXAMPLE GMBH",
    "address": "MUSTERSTRASSE 1, 10115 BERLIN",
    "countryCode": "DE",
    "vatNumber": "812526315"
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether the VAT number is valid and active |
| `name` | string \| null | Company name as registered in the VIES system |
| `address` | string \| null | Registered address |
| `countryCode` | string | Two-letter EU country code |
| `vatNumber` | string | VAT number without country prefix |

## Auto-validation

When a foreign EU client is created or updated with a VAT code, the system automatically validates it against VIES. The result is stored in the client's `viesValid`, `viesValidatedAt`, and `viesName` fields. This automatic validation only applies to EU member state country codes — non-EU countries (US, UK, CH, etc.) are skipped.

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 422 | Missing or invalid VAT code format |
| 503 | VIES service unavailable |

## Related Endpoints

- [List clients](/api-reference/clients/list)
- [Get client](/api-reference/clients/get)
