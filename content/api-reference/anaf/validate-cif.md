---
title: Validate CIF
description: Validate ANAF token for a specific CIF
---

# Validate CIF

Validate that an ANAF token has proper access to e-Factura for a specific CIF.

---

## Validate Token for CIF

```http
POST /api/v1/anaf/tokens/{id}/validate-cif
```

Validates the token by checking:
- Organization ownership of the CIF
- ANAF registry lookup
- e-Factura access permissions

On success the CIF is added to the token's `validatedCifs`. On failure it is removed.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ANAF token UUID |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cif | integer\|string | Yes | The CIF to validate, with or without the `RO` prefix |

### Response

```json
{
  "valid": true,
  "cif": 12345678,
  "companyName": "Example Company SRL",
  "message": "Token-ul este valid pentru Example Company SRL (CIF 12345678)"
}
```

When validation fails the status is `422` and the body is:

```json
{
  "valid": false,
  "cif": 12345678,
  "error": "CIF-ul 12345678 nu exista in baza de date ANAF."
}
```

When the CIF does not belong to a company of your organization, the body also carries `"code": "COMPANY_NOT_FOUND"`.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| valid | boolean | Whether validation passed |
| cif | integer | The CIF that was checked |
| companyName | string | Company name from the ANAF registry (success only) |
| message | string | Confirmation text (success only) |
| error | string | Reason for the failure (failure only) |
| code | string | `COMPANY_NOT_FOUND` when the CIF is not in your organization |

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | | `cif` is missing |
| 401 | | Unauthorized - invalid authentication |
| 402 | `PLAN_LIMIT` | The CIF is not in your organization and your plan does not allow another company |
| 404 | | Token not found, or it belongs to another user |
| 422 | | The CIF is not in your organization, is unknown to ANAF, or the token has no e-Factura access to it |
| 429 | | ANAF rate limit reached. `retryAfter` carries the seconds to wait |
