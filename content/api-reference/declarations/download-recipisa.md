---
title: Download Recipisa
description: Download the ANAF recipisa PDF for an accepted declaration
method: GET
endpoint: /api/v1/declarations/{uuid}/recipisa
---

# Download Recipisa

Downloads the ANAF recipisa (receipt) PDF of a declaration. The recipisa is stored once ANAF has answered the filing, so it exists for accepted declarations and also for rejected ones, where it lists the errors.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the declaration |

## Request

```bash {% title="cURL" %}
curl -X GET https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/recipisa \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -o recipisa.pdf
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/recipisa', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

// Save as file in browser
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'recipisa.pdf';
a.click();
```

## Response

**Success:** Returns `200 OK` with the PDF file as the response body.

| Header | Value |
|--------|-------|
| `Content-Type` | `application/pdf` |
| `Content-Disposition` | `attachment; filename="d394_2026_01_recipisa.pdf"` |

The response body is the binary PDF document issued by ANAF.

## Availability

The recipisa is available once Storno has downloaded it from ANAF. Until then the request answers 404 (`Recipisa not available.`).

## Error Codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the `declaration.view` permission |
| 404 | Declaration not found, it belongs to another company, or the recipisa is not available yet |
