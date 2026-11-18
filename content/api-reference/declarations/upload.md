---
title: Upload a declaration (XML or PDF)
description: Create a declaration from an XML file or from the ANAF PDF made by another program; type and period come from the document, which is filed as it is
method: POST
endpoint: /api/v1/declarations/upload
---

# Upload a declaration (XML or PDF)

Creates a declaration from a document made elsewhere: the XML file, or the ANAF PDF produced by SAGA, DUKIntegrator or ANAF's own form filled in Acrobat (Storno reads the XML embedded in the PDF, as attachment or XFA data). The type comes from the root element of the XML (`declaratieNNN` such as `declaratie394`, `declaratieunica` for D112, or `c168`), the year from its `an` attribute and the month from its `luna` attribute (the current year and month 1 when they are missing). From then on the declaration behaves like any other: `validate` runs ANAF's validator on it, the [agent](/api-reference/declarations/agent) signs and files it, the recipisa lands in the dosar. **The uploaded document is what gets filed, never a regeneration** (`metadata.externalXml`); a PDF upload also keeps the original file (`metadata.uploadedPdfPath`). A PDF without a declaration inside answers `422 NO_DECLARATION_XML`.

This is the way to use Storno's filing (agent, certificate, tracking, dosare) with an accounting program that produces the declarations.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `multipart/form-data` |

## Request Body

Multipart form data.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | The XML declaration file, or the ANAF PDF with the XML embedded |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/declarations/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -F "file=@/path/to/D394_2026_01.xml"
```

```javascript {% title="JavaScript" %}
const formData = new FormData();
formData.append('file', xmlFileBlob, 'D394_2026_01.xml');

const response = await fetch('https://api.storno.ro/api/v1/declarations/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  },
  body: formData
});

const data = await response.json();
```

## Response

Returns `201 Created` with the new declaration object. The declaration is created in `draft` status with the attributes of the uploaded XML in `data.rows`.

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d394",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "draft",
  "data": {
    "rows": { "an": "2026", "luna": "1" },
    "uploadedXml": true
  },
  "metadata": {
    "source": "xml_upload",
    "externalXml": true
  },
  "anafUploadId": null,
  "errorMessage": null,
  "submittedAt": null,
  "acceptedAt": null,
  "companyId": "company-uuid-here",
  "dosarId": null
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID of the created declaration |
| `type` | string | Declaration type read from the document |
| `year` | integer | Fiscal year read from the document |
| `month` | integer | Fiscal month read from the document |
| `periodType` | string | Standard period type of the declaration type |
| `status` | string | Always `draft` after upload |
| `data` | object | `rows` holds the attributes of the root element; `uploadedXml` is `true` |
| `metadata` | object | `source` is `xml_upload` or `pdf_upload`; `externalXml` is `true`. A PDF upload also carries `uploadedPdfPath` and `uploadedFileName` |

The other fields are the ones described in [get declaration](/api-reference/declarations/get).

## Validation Rules

- The uploaded file must be a valid XML document, or a PDF that carries a declaration XML
- The root element of the XML must be one of the forms listed above, otherwise the upload is refused

## Error Codes

Errors have the body `{"error": "message"}`, with an extra `code` on some of them.

| Status Code | Description |
|-------------|-------------|
| 400 | No file was sent, the file is not valid XML, or its root element is not a recognised declaration (`Cannot determine declaration type from root element`) |
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the `declaration.submit` permission |
| 404 | The company was not found |
| 422 | A PDF without a declaration inside (`code: NO_DECLARATION_XML`) |
