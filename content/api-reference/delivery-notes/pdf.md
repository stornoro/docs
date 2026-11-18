---
title: Download Delivery Note PDF
description: Download the PDF representation of a delivery note
method: GET
endpoint: /api/v1/delivery-notes/{uuid}/pdf
---

# Download Delivery Note PDF

Downloads the PDF for a delivery note. The PDF is generated using the company's configured PDF template and includes all line items, client details, and delivery information.

```
GET /api/v1/delivery-notes/{uuid}/pdf
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token or API key for authentication |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | UUID of the delivery note |

## Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `hideVat` | boolean | No | Leave VAT amounts off the PDF (default: false) |
| `hidePrices` | boolean | No | Leave prices off the PDF (default: false) |

## Request

```bash {% title="cURL" %}
curl https://api.storno.ro/api/v1/delivery-notes/7c9e6679-7425-40de-944b-e07fc1f90ae7/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -o aviz.pdf
```

```javascript {% title="JavaScript" %}
const response = await fetch(
  'https://api.storno.ro/api/v1/delivery-notes/7c9e6679-7425-40de-944b-e07fc1f90ae7/pdf',
  {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
      'X-Company': '550e8400-e29b-41d4-a716-446655440000'
    }
  }
);

const blob = await response.blob();
```

## Response

Returns the PDF file as binary data with appropriate headers.

**Headers:**

| Header | Value |
|--------|-------|
| `Content-Type` | `application/pdf` |
| `Content-Disposition` | `inline; filename="aviz-{number}.pdf"` |

## Error Codes

Errors have the form `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `402` | PDF generation is not available on the organization's plan (the body also has `"code": "PLAN_LIMIT"`) |
| `403` | Permission denied |
| `404` | Delivery note not found or not in the caller's organization |
| `500` | PDF generation failed |
