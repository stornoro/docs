---
title: Error Handling
description: Understand error response formats and HTTP status codes used by the Storno.ro API.
---

# Error Handling

The Storno.ro API uses standard HTTP status codes and returns structured error responses in JSON format.

## Error Response Format

Most error responses have a single `error` field with a human-readable message:

```json
{
  "error": "Company not found."
}
```

Some errors add more fields:

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Machine-readable code such as `PLAN_LIMIT`, `account_inactive` or `email_not_confirmed` |
| `messageKey` | string | Translation key for the message, present on some errors |
| `retryAfter` | integer | Seconds to wait, on ANAF rate limit errors |

The login and refresh routes (`POST /api/auth` and `POST /api/auth/refresh`) return a different body for bad credentials and expired tokens. It has a numeric `code` and a `message`:

```json
{
  "code": 401,
  "message": "Invalid credentials."
}
```

### Validation errors

Validation failures are 400 in most endpoints, with an `error` message that names the problem. A few endpoints validate several fields at once and return a list instead. Creating a client is one of them, with status 422:

```json
{
  "errors": [
    { "key": "name", "message": "Name is required." },
    { "key": "city", "message": "City is required." }
  ]
}
```

Invoice validation endpoints return the UBL validation result in `validation.errors` and `validation.warnings` on a successful response.

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
| 401  | **Unauthorized** — Missing, invalid, or expired JWT token or API key, or a login attempt that is rate limited |
| 402  | **Payment Required** — Feature not available on current plan (see `PLAN_LIMIT` code) |
| 403  | **Forbidden** — Valid token but insufficient permissions (for example a role restriction), or an inactive account or unconfirmed email at login |
| 404  | **Not Found** — Resource doesn't exist, or the company cannot be resolved (`Company not found.`) |
| 405  | **Method Not Allowed** — HTTP method not supported for this endpoint |
| 409  | **Conflict** — Duplicate resource, for example registering an email that already exists, or starting an import that is already running |
| 422  | **Unprocessable Entity** — The request is well-formed but the document is in the wrong state (for example issuing or deleting an invoice that does not allow it), or a multi-field validation failure |
| 429  | **Too Many Requests** — Rate limit exceeded |

### Server Error Codes

| Code | Description |
|------|-------------|
| 500  | **Internal Server Error** — Unexpected server error |
| 502  | **Bad Gateway** — ANAF service unreachable |
| 503  | **Service Unavailable** — Server temporarily unavailable |

## Common Error Scenarios

### Authentication errors

```json
// 401, expired JWT (Authorization: Bearer ...)
{
  "code": 401,
  "message": "Expired JWT Token"
}

// 401, wrong email or password at POST /api/auth
{
  "code": 401,
  "message": "Invalid credentials."
}

// 403, inactive account at POST /api/auth
{
  "error": "The account is inactive.",
  "code": "account_inactive"
}
```

An invalid API key returns 401 as well. The exact text depends on the key (`Invalid API token`, `API token has been revoked`, `API token has expired`).

### Company context errors

The company comes from the `X-Company` header (or a `company` query parameter). When it is missing and the organization has more than one company, or when the company does not belong to the caller or the caller has no access to it, the endpoint answers 404:

```json
{
  "error": "Company not found."
}
```

A few endpoints answer 400 with `No company selected.` instead.

### Plan limit errors

```json
// 402, feature not available on the current plan
{
  "error": "Recurring invoices are not available on your plan.",
  "code": "PLAN_LIMIT"
}

// 402, monthly invoice limit reached
{
  "error": "Monthly invoice limit reached.",
  "code": "PLAN_LIMIT",
  "limit": 100
}
```

Plan limit errors apply equally to web, mobile, and API key authenticated requests. See [Plans & Features](/concepts/licensing#plans--features) for details on what each plan includes.

### Resource state errors

```json
// 422, invoice cannot be deleted in its current state
{
  "error": "Invoice cannot be deleted."
}
```

State errors carry the message of the rule that failed, so match on the status code and show or log `error`, not on the exact text.

## Handling Errors

### Retry Strategy

- **401**: Refresh your token and retry the request. A rate limited login also answers 401, so do not loop on it
- **429**: Wait for the duration in the `Retry-After` header when the response has one
- **500/502/503**: Retry with exponential backoff (max 3 retries)
- **402**: Upgrade your plan — see [Plans & Features](/concepts/licensing#plans--features)
- **400/403/404/409/422**: Do not retry. Fix the request

### Example Error Handler

```js
async function apiRequest(url, options = {}, retried = false) {
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

    if (response.status === 401 && !retried) {
      // Token expired: refresh once and retry
      await refreshToken();
      return apiRequest(url, options, true);
    }

    throw new ApiError(error.error ?? error.message, response.status, error.errors, error.code);
  }

  return response.json();
}
```
