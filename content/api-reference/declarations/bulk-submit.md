---
title: Bulk Submit Declarations
description: Submit multiple validated declarations to ANAF in a single request
method: POST
endpoint: /api/v1/declarations/bulk-submit
---

# Bulk Submit Declarations

Submits multiple declarations to ANAF SPV in a single request. Each declaration must be in `validated` status before it can be submitted. Declarations that are not in `validated` status are skipped. Submission is performed asynchronously per declaration.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ids` | string[] | Yes | Array of declaration UUIDs to submit. Must contain at least one UUID |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/declarations/bulk-submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "c3d4e5f6-a7b8-9012-cdef-123456789012"
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations/bulk-submit', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ids: [
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      'c3d4e5f6-a7b8-9012-cdef-123456789012'
    ]
  })
});

const result = await response.json();
```

## Response

```json
{
  "submitted": 3
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `submitted` | integer | Number of declarations successfully queued for submission. Declarations that were not in `validated` status are excluded from this count |

## Behavior

- Only declarations in `validated` status are submitted; others are silently skipped
- Each declaration is submitted independently — a failure on one does not block others
- After submission, each declaration transitions to `submitted` status and then to `processing` as ANAF acknowledges receipt
- Status updates are handled asynchronously; poll individual declarations or use [refresh-statuses](/api-reference/declarations/refresh-statuses) to check progress

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request body or empty `ids` array |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 422 | `validation_error` | `ids` field is missing or not an array |
| 500 | `internal_error` | Server error occurred |
