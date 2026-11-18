---
title: Download Declaration XML
description: Download the generated XML file for a declaration
method: GET
endpoint: /api/v1/declarations/{uuid}/xml
---

# Download Declaration XML

Downloads the XML file of a declaration as `application/xml`. When the XML was already stored (validation, submission or upload) the stored file is returned; otherwise it is generated from the current data of the declaration.

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
| `Content-Disposition` | `attachment; filename="d394_2026_01.xml"` |

The response body is the raw ANAF-formatted XML document.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<declaratie394 xmlns="mfp:anaf:dgti:d394:declaratie:v5" luna="1" an="2026" ...>
  ...
</declaratie394>
```

## Availability

Any declaration can be downloaded. A stored file is served as it is; for a declaration without one the XML is generated on the fly, and generation fails with 400 when the type has no XML generator.

## Error Codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 400 | The XML could not be generated for this declaration |
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the `declaration.view` permission |
| 404 | Declaration not found or it belongs to another company |
