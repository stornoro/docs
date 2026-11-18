---
title: Pagination
description: How to paginate through list endpoints in the Storno.ro API.
---

# Pagination

All list endpoints support pagination using `page` and `limit` query parameters.

## Request Parameters

| Parameter | Type   | Default | Description |
|-----------|--------|---------|-------------|
| page      | number | 1       | Page number (1-indexed) |
| limit     | number | 10      | Items per page, maximum 20 |

A `limit` above the maximum is clamped to 20, not rejected. A few endpoints use other defaults and maximums, which their pages state.

## Example Request

```bash
curl "https://api.storno.ro/api/v1/invoices?page=2&limit=20" \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

## Response Format

Paginated responses include metadata alongside the data. Some lists add more fields, for example invoice lists also return `currency` and `totals`.

```json
{
  "data": [
    { "uuid": "...", "number": "FACT-001", ... },
    { "uuid": "...", "number": "FACT-002", ... }
  ],
  "total": 150,
  "page": 2,
  "limit": 20
}
```

| Field | Type   | Description |
|-------|--------|-------------|
| data  | array  | Array of resource objects |
| total | number | Total number of matching resources |
| page  | number | Current page number |
| limit | number | Items per page, after clamping |

## Filtering and Sorting

Many list endpoints support additional query parameters for filtering and sorting. Common filters include:

| Parameter | Type   | Description |
|-----------|--------|-------------|
| search    | string | Full-text search across relevant fields |
| status    | string | Filter by resource status |
| from      | string | Filter by start date (YYYY-MM-DD) |
| to        | string | Filter by end date (YYYY-MM-DD) |
| sort      | string | Sort field (e.g., `issueDate`, `number`) |
| order     | string | Sort direction: `asc` or `desc` |

See individual endpoint documentation for available filters.

## Grouped Responses

Some endpoints (e.g., clients, suppliers) return grouped results instead of paginated arrays:

```json
{
  "data": {
    "A": [
      { "uuid": "...", "name": "ABC Corp" }
    ],
    "S": [
      { "uuid": "...", "name": "SC Firma SRL" }
    ]
  },
  "total": 45
}
```

These endpoints group results alphabetically by the first letter of the name.

## Best Practices

- Request `limit=20` for the fewest round trips
- Compute the number of pages as `ceil(total / limit)` and stop when `page * limit >= total`
- Cache `total` to avoid re-fetching it on every page change
