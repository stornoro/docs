---
title: Download Declaration XML
description: Download the generated XML file for a declaration
method: GET
endpoint: /api/v1/declarations/{uuid}/xml
---

# Download Declaration XML

Downloads the generated XML file for a declaration. The XML is available once the declaration has been validated (status `validated`, `submitted`, `processing`, `accepted`, `rejected`, or `error`). The file is returned as `application/xml`.

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
curl -X GET https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/xml \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -o declaration.xml
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/xml', {
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
a.download = 'declaration.xml';
a.click();
```

## Response

**Success:** Returns `200 OK` with the XML file as the response body.

| Header | Value |
|--------|-------|
| `Content-Type` | `application/xml` |
| `Content-Disposition` | `attachment; filename="d394-2026-01.xml"` |

The response body is the raw ANAF-formatted XML document.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<declaratie394 xmlns="mfp:anaf:dgti:d394:declaratie:v2" ...>
  <antetDeclaratie>
    <codDeclarant>RO12345678</codDeclarant>
    <perioada>012026</perioada>
    ...
  </antetDeclaratie>
  ...
</declaratie394>
```

## Availability

The XML file is available when `xmlPath` is set on the declaration object. This is the case for declarations in the following statuses:

| Status | XML Available |
|--------|--------------|
| `draft` | No |
| `validated` | Yes |
| `submitted` | Yes |
| `processing` | Yes |
| `accepted` | Yes |
| `rejected` | Yes |
| `error` | Yes (if XML was generated before the error) |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Declaration not found, doesn't belong to the company, or XML has not been generated yet |
| 500 | `internal_error` | Server error occurred |
