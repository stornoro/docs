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
| limit     | number | 20      | Items per page (max varies by endpoint, typically 100) |

## Example Request

```bash
curl "https://api.storno.ro/api/v1/invoices?page=2&limit=25" \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

## Response Format

Paginated responses include metadata alongside the data:

```json
{
  "data": [
    { "uuid": "...", "number": "FACT-001", ... },
    { "uuid": "...", "number": "FACT-002", ... }
  ],
  "total": 150,
  "page": 2,
  "limit": 25,
  "pages": 6
}
```

| Field | Type   | Description |
|-------|--------|-------------|
| data  | array  | Array of resource objects |
| total | number | Total number of matching resources |
| page  | number | Current page number |
| limit | number | Items per page |
| pages | number | Total number of pages |

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

- Use reasonable `limit` values (20–50) for UI pagination
- Use larger limits (100) for bulk data exports
- Always check `pages` to know when you've reached the end
- Cache `total` to avoid re-fetching it on every page change
