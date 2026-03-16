---
title: Validate Declaration
description: Validate a draft declaration by generating and schema-checking its XML
method: POST
endpoint: /api/v1/declarations/{uuid}/validate
---

# Validate Declaration

Validates a `draft` declaration by generating the ANAF-formatted XML and running it through schema validation. If validation passes, the declaration transitions to `validated` status and is ready for submission. Any schema errors are returned as a validation error response.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the declaration to validate |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/validate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

Returns the updated declaration object in `validated` status with the generated XML path populated.

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d394",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "validated",
  "data": {
    "totalSalesBase": "84033.61",
    "totalSalesVat": "15966.39",
    "totalPurchasesBase": "42016.81",
    "totalPurchasesVat": "7983.19",
    "invoiceCount": 47
  },
  "metadata": {
    "generatedAt": "2026-02-10T08:00:00Z",
    "invoiceCountAtGeneration": 47,
    "validatedAt": "2026-02-10T08:10:00Z"
  },
  "errorMessage": null,
  "anafUploadId": null,
  "xmlPath": "declarations/2026/01/d394-2026-01.xml",
  "recipisaPath": null,
  "createdAt": "2026-02-10T08:00:00Z",
  "updatedAt": "2026-02-10T08:10:00Z",
  "createdBy": "user-uuid-here"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `type` | string | Declaration type |
| `year` | integer | Fiscal year |
| `month` | integer | Fiscal month |
| `periodType` | string \| null | Period type |
| `status` | string | `validated` after successful validation |
| `data` | object | The fiscal data used to generate the XML |
| `metadata` | object | Updated metadata including `validatedAt` timestamp |
| `errorMessage` | string \| null | `null` on success; contains XML schema errors on validation failure |
| `xmlPath` | string | Internal storage path of the generated XML file |
| `recipisaPath` | string \| null | `null` until declaration is accepted |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 timestamp of this validation |

## Restrictions

- The declaration must be in `draft` status
- The company profile must have all required fiscal data (CIF, address, etc.) to generate a valid XML

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Declaration not found or doesn't belong to the company |
| 409 | `conflict` | Declaration is not in draft status |
| 422 | `validation_error` | Generated XML failed schema validation; details contain specific errors |
| 500 | `internal_error` | Server error occurred |

## Example Validation Error Response

```json
{
  "error": {
    "code": "validation_error",
    "message": "XML schema validation failed",
    "details": {
      "schemaErrors": [
        "Element 'CodFiscal': This element is not expected. Expected is one of ( NrInreg, DataInreg ).",
        "Element 'TotalBaza': '0' is not a valid value of the atomic type 'pozitiv'."
      ]
    }
  }
}
```

## Next Steps

After a successful validation:
1. Download the generated XML for review (`GET /api/v1/declarations/{uuid}/xml`)
2. Submit to ANAF (`POST /api/v1/declarations/{uuid}/submit`)
