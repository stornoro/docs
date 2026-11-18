---
title: Bulk Submit Declarations
description: Submit multiple validated declarations to ANAF in a single request
method: POST
endpoint: /api/v1/declarations/bulk-submit
---

# Bulk Submit Declarations

Submits multiple declarations to ANAF in a single request. Declarations in `draft` or `validated` status are submitted; declarations in any other status are skipped.

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
| `submitted` | integer | Number of declarations handed over for submission. Declarations that were skipped are not counted |

## Behavior

- Only declarations in `draft` or `validated` status are submitted; others are silently skipped
- Ids that do not exist or belong to another company are silently ignored
- Each declaration is submitted independently, so a failure on one does not block the others
- A submitted declaration moves to `processing` once ANAF has received it, or to `error` with an `errorMessage` when the upload failed; read the individual declarations to follow progress

## Error Codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 400 | `ids` is missing, empty or not an array |
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the `declaration.submit` permission |
