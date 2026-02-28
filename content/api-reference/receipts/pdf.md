---
title: Download Receipt PDF
description: Download the PDF representation of a receipt
method: GET
endpoint: /api/v1/receipts/{uuid}/pdf
---

# Download Receipt PDF

Downloads the PDF for a fiscal receipt. The PDF is generated using the company's configured PDF template and includes all line items, payment breakdown, customer details, and cash register information.

```
GET /api/v1/receipts/{uuid}/pdf
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token or API key for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | UUID of the receipt |

## Request

```bash {% title="cURL" %}
curl https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -o receipt.pdf
```

```javascript {% title="JavaScript" %}
const response = await fetch(
  'https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890/pdf',
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
| `Content-Disposition` | `attachment; filename="bon-{number}.pdf"` |

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Receipt not found |
| `500` | PDF generation failed |
