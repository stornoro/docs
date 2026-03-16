---
title: Download Recipisa
description: Download the ANAF recipisa PDF for an accepted declaration
method: GET
endpoint: /api/v1/declarations/{uuid}/recipisa
---

# Download Recipisa

Downloads the ANAF recipisa (confirmation receipt) PDF for a declaration that has been accepted by ANAF. The recipisa is the official document confirming that ANAF received and accepted the filing. It is available only when the declaration status is `accepted`.

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
| `Content-Disposition` | `attachment; filename="d394-2026-01-recipisa.pdf"` |

The response body is the binary PDF document issued by ANAF confirming acceptance of the declaration.

## Availability

The recipisa is available only when `recipisaPath` is set on the declaration object. This occurs when the declaration status is `accepted`.

| Status | Recipisa Available |
|--------|-------------------|
| `draft` | No |
| `validated` | No |
| `submitted` | No |
| `processing` | No |
| `accepted` | Yes |
| `rejected` | No |
| `error` | No |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Declaration not found, doesn't belong to the company, or recipisa is not yet available |
| 500 | `internal_error` | Server error occurred |
