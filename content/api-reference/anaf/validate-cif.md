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

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | The ANAF token ID to validate |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

```json
{
  "valid": true,
  "errors": []
}
```

Or if validation fails:

```json
{
  "valid": false,
  "errors": [
    "CIF not found in ANAF registry",
    "Company does not have e-Factura access enabled"
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| valid | boolean | Whether validation passed |
| errors | array | Array of error messages (empty if valid) |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - token belongs to another user |
| 404 | Token not found |
