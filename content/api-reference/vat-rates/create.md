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

Requires the `settings.manage` permission.

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rate` | number | Yes | VAT percentage (e.g., 19 for 19%) |
| `label` | string | Yes | Display label (e.g., "TVA 19%") |
| `categoryCode` | string | No | e-Factura category code (default: "S") |
| `isDefault` | boolean | No | Set as default rate (default: false) |
| `isActive` | boolean | No | Whether the rate is active (default: true) |
| `position` | integer | No | Display order (default: 0) |

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
  "id": "vat-uuid-1",
  "rate": "19.00",
  "label": "TVA 19%",
  "categoryCode": "S",
  "isDefault": true,
  "isActive": true,
  "position": 1
}
```

## Category Codes

| Code | Description | Typical Use |
|------|-------------|-------------|
| `S` | Standard rate | Standard and reduced VAT rates |
| `Z` | Zero rated | 0% VAT |
| `E` | Exempt | VAT-exempt transactions |
| `AE` | Reverse charge | VAT responsibility on buyer |
| `K` | Exempt for export | Exports outside the EU |
| `L` | Intra-community supply | Supplies to other EU member states |
| `O` | Outside scope | Not subject to VAT |
| `M` | Margin scheme | Margin scheme sales |

## Default Rate Behavior

- If `isDefault` is `true`, the default flag is cleared on the company's other rates
- The first rate is not made default automatically

## Errors

| Status Code | Description |
|-------------|-------------|
| 400 | `rate` or `label` is missing |
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found |

Error bodies have the form `{"error": "message"}`.

## Related Endpoints

- [List VAT rates](/api-reference/vat-rates/list)
- [Update VAT rate](/api-reference/vat-rates/update)
- [Delete VAT rate](/api-reference/vat-rates/delete)
