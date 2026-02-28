---
title: Error Handling
description: Understand error response formats and HTTP status codes used by the Storno.ro API.
---

# Error Handling

The Storno.ro API uses standard HTTP status codes and returns structured error responses in JSON format.

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Short error description",
  "message": "Detailed human-readable explanation",
  "code": 400
}
```

### Validation Errors

When a request fails validation, the response includes field-level error details:

```json
{
  "error": "Validation failed",
  "message": "The request contains invalid data",
  "code": 400,
  "errors": {
    "issueDate": "This value should not be blank.",
    "lines": "At least one line item is required.",
    "lines[0].quantity": "This value should be greater than 0."
  }
}
```

## HTTP Status Codes

### Success Codes

| Code | Description |
|------|-------------|
| 200  | Request succeeded |
| 201  | Resource created successfully |
| 204  | Request succeeded with no response body (e.g., DELETE) |

### Client Error Codes

| Code | Description |
|------|-------------|
| 400  | **Bad Request** — Invalid request body, missing required fields, or validation errors |
| 401  | **Unauthorized** — Missing, invalid, or expired JWT token |
| 402  | **Payment Required** — Feature not available on current plan (see `PLAN_LIMIT` code) |
| 403  | **Forbidden** — Valid token but insufficient permissions (e.g., wrong company, role restriction) |
| 404  | **Not Found** — Resource doesn't exist or belongs to a different company |
| 405  | **Method Not Allowed** — HTTP method not supported for this endpoint |
| 409  | **Conflict** — Resource state conflict (e.g., issuing an already-issued invoice, duplicate IBAN) |
| 422  | **Unprocessable Entity** — Request is well-formed but semantically invalid |
| 429  | **Too Many Requests** — Rate limit exceeded |

### Server Error Codes

| Code | Description |
|------|-------------|
| 500  | **Internal Server Error** — Unexpected server error |
| 502  | **Bad Gateway** — ANAF service unreachable |
| 503  | **Service Unavailable** — Server temporarily unavailable |

## Common Error Scenarios

### Authentication Errors

```json
// 401 — Expired token
{
  "code": 401,
  "message": "Expired JWT Token"
}

// 401 — Invalid credentials
{
  "code": 401,
  "message": "Invalid credentials."
}
```

### Company Context Errors

```json
// 403 — Missing X-Company header
{
  "error": "Company context required",
  "message": "The X-Company header is required for this endpoint.",
  "code": 403
}

// 403 — No access to company
{
  "error": "Access denied",
  "message": "You do not have access to this company.",
  "code": 403
}
```

### Plan Limit Errors

```json
// 402 — Feature not available on current plan
{
  "error": "Recurring invoices are not available on your plan.",
  "code": "PLAN_LIMIT"
}

// 402 — Monthly invoice limit reached
{
  "error": "Monthly invoice limit reached.",
  "code": "PLAN_LIMIT",
  "limit": 100
}
```

Plan limit errors apply equally to web, mobile, and API key authenticated requests. See [Plans & Features](/concepts/licensing#plans--features) for details on what each plan includes.

### Resource State Errors

```json
// 409 — Invoice already issued
{
  "error": "Invalid state transition",
  "message": "Cannot issue an invoice that is already issued.",
  "code": 409
}

// 409 — Cannot delete issued invoice
{
  "error": "Cannot delete",
  "message": "Cannot delete an issued invoice. Cancel it first.",
  "code": 409
}
```

## Handling Errors

### Retry Strategy

- **401**: Refresh your token and retry the request
- **429**: Wait for the duration specified in the `Retry-After` header
- **500/502/503**: Retry with exponential backoff (max 3 retries)
- **402**: Upgrade your plan — see [Plans & Features](/concepts/licensing#plans--features)
- **400/403/404/409**: Do not retry — fix the request

### Example Error Handler

```js
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Company': companyUuid,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();

    if (response.status === 401) {
      // Token expired — refresh and retry
      await refreshToken();
      return apiRequest(url, options);
    }

    throw new ApiError(error.message, response.status, error.errors);
  }

  return response.json();
}
```
