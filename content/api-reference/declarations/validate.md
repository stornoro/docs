---
title: Validate Declaration
description: Validate a draft declaration by generating and schema-checking its XML
method: POST
endpoint: /api/v1/declarations/{uuid}/validate
---

# Validate Declaration

Validates a `draft` declaration by generating the ANAF-formatted XML and running it through ANAF's DUKIntegrator validator. If validation passes, the declaration transitions to `validated` status and is ready for submission. The XML and the PDF are generated and stored on a successful validation (a failure to render the PDF does not fail the request). When validation fails the response is a 400 whose `error` lists the validator messages.

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

Returns the declaration object in `validated` status.

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d300",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "validated",
  "data": {
    "layout": "v2026",
    "rows": { "R9_1": 84034, "R9_2": 17647 },
    "warnings": []
  },
  "metadata": {
    "dukValidation": {
      "valid": true,
      "namespace": "mfp:anaf:dgti:d300:declaratie:v10",
      "warnings": [],
      "validatedAt": "2026-02-10 08:10:00"
    }
  },
  "anafUploadId": null,
  "errorMessage": null,
  "submittedAt": null,
  "acceptedAt": null,
  "companyId": "company-uuid-here",
  "dosarId": null
}
```

## Response fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `validated` after successful validation |
| `metadata.dukValidation` | object | The validator result: `valid`, the `namespace` used, `warnings` and `validatedAt` |

The other fields are the ones described in [get declaration](/api-reference/declarations/get).

## Restrictions

- The declaration must be in `draft` status
- The company profile must have all the fiscal data (CIF, address, representative and so on) the form needs; missing data is reported in `data.warnings`

## Error Codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 400 | The declaration is not in `draft` status, no generator exists for its type, or the validator rejected the XML (`DUK validation failed: ...`) |
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the `declaration.submit` permission |
| 404 | Declaration not found or it belongs to another company |

## Example validation error response

```json
{
  "error": "DUK validation failed: E: cif: CNP-ul nu este valid; E: cap11[1].venit_brut: valoare obligatorie"
}
```

## Next Steps

After a successful validation:
1. Download the generated XML for review (`GET /api/v1/declarations/{uuid}/xml`)
2. Submit to ANAF (`POST /api/v1/declarations/{uuid}/submit`)
