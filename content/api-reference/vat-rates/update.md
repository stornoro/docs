---
title: Update VAT rate
description: Update an existing VAT rate configuration.
---

# Update VAT rate

Updates an existing VAT rate for the authenticated company.

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

### Body Parameters

All parameters are optional, but at least one must be provided.

| Parameter | Type | Description |
|-----------|------|-------------|
| `rate` | number | VAT percentage |
| `label` | string | Display label |
| `categoryCode` | string | e-Factura category code |
| `isDefault` | boolean | Set as default rate |
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
  "uuid": "vat-uuid-2",
  "rate": 9,
  "label": "TVA redusă 9%",
  "categoryCode": "AA",
  "isDefault": false,
  "position": 2,
  "createdAt": "2025-06-01T10:05:00Z",
  "updatedAt": "2026-02-16T16:45:00Z"
}
```

## Default Rate Behavior

- If `isDefault` is set to `true`, any existing default rate will be set to non-default
- Only one VAT rate can be marked as default
- Setting `isDefault` to `false` on the default rate requires another rate to be set as default first

## Important Notes

- Changing the rate percentage does not retroactively affect existing invoices
- Existing invoice lines preserve the VAT rate that was used at creation time
- Consider creating a new VAT rate instead of modifying an existing one if the rate changes
- Updating the label only affects future displays; existing invoices store the label at creation

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | VAT rate not found or doesn't belong to company |
| 422 | validation_error | Invalid input data (see error details) |

### Validation Errors

Common validation errors include:

- No fields provided for update
- Negative rate value
- Invalid category code
- Duplicate rate and label combination

## Related Endpoints

- [List VAT rates](/api-reference/vat-rates/list)
- [Create VAT rate](/api-reference/vat-rates/create)
- [Delete VAT rate](/api-reference/vat-rates/delete)
