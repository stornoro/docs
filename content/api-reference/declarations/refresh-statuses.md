---
title: Refresh Declaration Statuses
description: Check ANAF SPV for status updates on all in-flight declarations
method: POST
endpoint: /api/v1/declarations/refresh-statuses
---

# Refresh Declaration Statuses

Triggers an asynchronous job that checks ANAF SPV for status updates on all declarations currently in `submitted` or `processing` status. For each in-flight declaration, the job queries ANAF using the stored `anafUploadId` and updates the local status accordingly. If a declaration is accepted, the recipisa is automatically downloaded.

Returns `202 Accepted` immediately; status updates are applied in the background.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/declarations/refresh-statuses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations/refresh-statuses', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

// 202 Accepted — status refresh runs asynchronously
```

## Response

**Success:** Returns `202 Accepted` with an empty response body. The refresh job is queued and runs asynchronously.

## Async Behavior

The refresh job processes all declarations in `submitted` or `processing` status for the company. For each declaration:

1. Queries ANAF SPV using the stored `anafUploadId`
2. Maps the ANAF response to the corresponding local status
3. Updates the declaration status in the database
4. If the new status is `accepted`, downloads and stores the recipisa PDF

After the job completes, retrieve updated statuses by listing declarations:
```
GET /api/v1/declarations?status=accepted
GET /api/v1/declarations?status=rejected
```

## Status Transitions Applied

| ANAF Response | Local Status After Refresh |
|---------------|---------------------------|
| Processing in progress | `processing` (no change) |
| Accepted | `accepted` |
| Rejected | `rejected` + `errorMessage` populated |
| Not found / expired | `error` + `errorMessage` populated |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 502 | `anaf_error` | Could not connect to ANAF SPV |
| 500 | `internal_error` | Server error occurred |
