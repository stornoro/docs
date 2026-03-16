---
title: Sync Declarations from ANAF
description: Discover and import declarations filed with ANAF for a given year
method: POST
endpoint: /api/v1/declarations/sync
---

# Sync Declarations from ANAF

Triggers an asynchronous sync that discovers declarations filed with ANAF for a given fiscal year via SPV messages. For each filing found, if no local record exists it is created and the corresponding recipisa is downloaded. Useful for importing historical filings or reconciling records after an ANAF SPV migration.

Returns `202 Accepted` immediately; the actual sync runs in the background.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `year` | integer | Yes | Fiscal year to sync (e.g., 2025) |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/declarations/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations/sync', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    year: 2025
  })
});

// 202 Accepted — sync runs asynchronously
```

## Response

**Success:** Returns `202 Accepted` with an empty response body. The sync job is queued and runs asynchronously.

## Async Behavior

The sync job performs the following steps in the background:

1. Queries ANAF SPV messages for the specified year to find submission receipts
2. For each filing discovered, checks whether a local declaration record already exists
3. Creates missing records with status `accepted` and populates available metadata
4. Downloads the recipisa PDF from ANAF for each newly created record

To check the results, list declarations filtered by year after the sync completes:
```
GET /api/v1/declarations?year=2025&status=accepted
```

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request body or missing `year` field |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 422 | `validation_error` | `year` is not a valid 4-digit year |
| 502 | `anaf_error` | Could not connect to ANAF SPV to initiate sync |
| 500 | `internal_error` | Server error occurred |
