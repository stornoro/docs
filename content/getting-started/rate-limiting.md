---
title: Rate Limiting
description: Understand API rate limits, throttling policies, and how to handle 429 responses.
---

# Rate Limiting

All API requests are subject to rate limiting to protect the platform and ensure fair usage. Limits vary by endpoint type and authentication status.

## General API Limits

| Tier | Bucket Size | Refill Rate | Applied Per |
|------|-------------|-------------|-------------|
| Unauthenticated | 10,000 requests | 100 per 5 minutes | IP address |
| Authenticated | 50,000 requests | 500 per 2 minutes | IP address |

General API limits use a **token bucket** policy — each request consumes one token. Tokens refill at a steady rate. When the bucket is empty, requests are rejected with `429 Too Many Requests`.

## Authentication Endpoint Limits

Authentication endpoints use stricter **sliding window** limits to prevent brute-force attacks:

| Endpoint | Limit | Window | Applied Per |
|----------|-------|--------|-------------|
| `POST /api/auth` (login) | 5 attempts | 1 minute | IP address |
| `POST /api/auth/register` | 10 attempts | 1 hour | IP address |
| `POST /api/auth/mfa/verify` | 5 attempts | 1 minute | IP address |
| `POST /api/auth/google` | 10 attempts | 1 minute | IP address |
| `POST /api/auth/passkey/login` | 10 attempts | 1 minute | IP address |
| `POST /api/auth/passkey/login/options` | 10 attempts | 1 minute | IP address |
| `POST /api/auth/forgot-password` | 3 attempts | 15 minutes | IP address |
| `POST /api/auth/reset-password` | 3 attempts | 15 minutes | IP address |

## Other Endpoint Limits

| Endpoint | Limit | Window | Applied Per |
|----------|-------|--------|-------------|
| `POST /api/v1/contact` | 3 submissions | 1 hour | IP address |
| `POST /api/v1/licensing/validate` | 10 attempts | 1 hour | IP address |

## ANAF Integration Limits

ANAF (Romanian Tax Authority) endpoints have dedicated rate limiters to comply with ANAF API restrictions:

| Operation | Limit | Window | Applied Per |
|-----------|-------|--------|-------------|
| All ANAF calls (global) | 1,000 requests | 1 minute | System-wide |
| List messages | 1,500 requests | 1 day | Company CIF |
| Download message | 10 requests | 1 day | Message ID |
| Check upload status | 100 requests | 1 day | Upload ID |
| Upload response | 1,000 requests | 1 day | Company CIF |

## Handling Rate Limit Responses

When a rate limit is exceeded, the API returns a `429 Too Many Requests` response:

```json
{
  "error": "Too many requests. Please try again later."
}
```

For ANAF endpoints, the response includes a `Retry-After` header and value:

```json
{
  "error": "ANAF rate limit reached. Try again later.",
  "retryAfter": 45
}
```

### Best Practices

- **Implement exponential backoff** — when you receive a `429`, wait before retrying. Double the wait time on each consecutive failure.
- **Cache responses** — avoid unnecessary duplicate requests, especially for data that doesn't change frequently (exchange rates, company details).
- **Use webhooks** — instead of polling for status changes, subscribe to [webhook events](/concepts/webhooks-events) for real-time updates.
- **Batch operations** — where the API supports it, use list endpoints with filters instead of making individual requests.

### Example: Retry with Backoff

{% tabs %}
{% tab label="JavaScript" %}
```js
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.status !== 429) return response;

    const retryAfter = response.headers.get('Retry-After');
    const waitMs = retryAfter
      ? parseInt(retryAfter) * 1000
      : Math.pow(2, attempt) * 1000;

    await new Promise(resolve => setTimeout(resolve, waitMs));
  }

  throw new Error('Rate limit exceeded after retries');
}
```
{% /tab %}
{% tab label="PHP" %}
```php
function fetchWithRetry(string $url, array $options, int $maxRetries = 3): Response
{
    for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
        $response = $client->request('GET', $url, $options);

        if ($response->getStatusCode() !== 429) {
            return $response;
        }

        $retryAfter = $response->getHeaderLine('Retry-After');
        $waitSeconds = $retryAfter
            ? (int) $retryAfter
            : pow(2, $attempt);

        sleep($waitSeconds);
    }

    throw new \RuntimeException('Rate limit exceeded after retries');
}
```
{% /tab %}
{% /tabs %}
