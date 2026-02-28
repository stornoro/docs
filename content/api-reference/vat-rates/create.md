---
title: Create VAT rate
description: Add a new VAT rate to the company configuration.
---

# Create VAT rate

Creates a new VAT rate for the authenticated company.

```http
POST /api/v1/vat-rates
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rate` | number | Yes | VAT percentage (e.g., 19 for 19%) |
| `label` | string | Yes | Display label (e.g., "TVA 19%") |
| `categoryCode` | string | No | e-Factura category code (default: "S") |
| `isDefault` | boolean | No | Set as default rate (default: false) |
| `position` | integer | No | Display order (auto-assigned if not provided) |

## Response

Returns the created VAT rate object with a `201 Created` status.

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/vat-rates' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "rate": 19,
    "label": "TVA 19%",
    "categoryCode": "S",
    "isDefault": true,
    "position": 1
  }'
```

## Example Response

```json
{
  "uuid": "vat-uuid-1",
  "rate": 19,
  "label": "TVA 19%",
  "categoryCode": "S",
  "isDefault": true,
  "position": 1,
  "createdAt": "2026-02-16T16:30:00Z",
  "updatedAt": "2026-02-16T16:30:00Z"
}
```

## Category Codes

Common e-Factura category codes:

| Code | Description | Typical Use |
|------|-------------|-------------|
| `S` | Standard rate | Default for most goods/services |
| `AA` | Reduced rate | Lower VAT rates (9%, 5%) |
| `E` | Exempt | VAT-exempt transactions |
| `O` | Outside scope | Not subject to VAT |
| `Z` | Zero rated | 0% VAT but with input deduction |
| `AE` | Reverse charge | VAT responsibility on buyer |

## Default Rate Behavior

- If `isDefault` is `true`, any existing default rate will be set to non-default
- Only one VAT rate can be marked as default
- The default rate is automatically selected in new invoice lines
- If this is the first VAT rate, it automatically becomes the default

## Position Assignment

- If `position` is not provided, the system assigns the next available position
- Lower position numbers appear first in dropdowns
- You can specify any integer to control ordering

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- Missing `rate` field
- Missing `label` field
- Negative rate value
- Invalid category code
- Duplicate rate and label combination

## Related Endpoints

- [List VAT rates](/api-reference/vat-rates/list)
- [Update VAT rate](/api-reference/vat-rates/update)
- [Delete VAT rate](/api-reference/vat-rates/delete)
