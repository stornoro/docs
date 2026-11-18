---
title: Update VAT rate
description: Update an existing VAT rate configuration.
---

# Update VAT rate

Updates an existing VAT rate for the authenticated company. Only the fields you send are changed.

```http
PATCH /api/v1/vat-rates/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the VAT rate |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |
| `Content-Type` | string | Yes | Must be `application/json` |

Requires the `settings.manage` permission.

### Body Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `rate` | number | VAT percentage |
| `label` | string | Display label |
| `categoryCode` | string | e-Factura category code |
| `isDefault` | boolean | Set as default rate |
| `isActive` | boolean | Whether the rate is active |
| `position` | integer | Display order |

## Response

Returns the updated VAT rate object.

## Example Request

```bash
curl -X PATCH 'https://api.storno.ro/api/v1/vat-rates/vat-uuid-2' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid' \
  -H 'Content-Type: application/json' \
  -d '{
    "label": "TVA redusă 9%",
    "position": 2
  }'
```

## Example Response

```json
{
  "id": "vat-uuid-2",
  "rate": "9.00",
  "label": "TVA redusă 9%",
  "categoryCode": "S",
  "isDefault": false,
  "isActive": true,
  "position": 2
}
```

## Default Rate Behavior

- If `isDefault` is set to `true`, the default flag is cleared on the company's other rates

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found, or VAT rate not found in this company |

Error bodies have the form `{"error": "message"}`.

## Related Endpoints

- [List VAT rates](/api-reference/vat-rates/list)
- [Create VAT rate](/api-reference/vat-rates/create)
- [Delete VAT rate](/api-reference/vat-rates/delete)
