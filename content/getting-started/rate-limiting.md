---
title: Rate Limiting
description: Understand API rate limits, throttling policies, and how to handle 429 responses.
---

# Rate Limiting

The API limits specific endpoints to protect the platform and prevent abuse. There is no general per-request limit on authenticated or unauthenticated traffic today. One may be introduced, so clients should handle `429 Too Many Requests` and honor the `Retry-After` header when it is present.

All limits below are sliding windows. A request over the limit is rejected until the window moves on.

## Authentication endpoint limits

| Endpoint | Limit | Window | Applied per |
|----------|-------|--------|-------------|
| `POST /api/auth` (login) | 5 attempts | 1 minute | IP address |
| `POST /api/auth/register` | 10 attempts | 1 hour | IP address |
| `POST /api/auth/resend-confirmation` | 10 attempts | 1 hour | IP address |
| `POST /api/auth/resend-confirmation` | 3 attempts | 1 hour | Email address |
| `POST /api/auth/mfa/verify`, `/mfa/email-otp/send`, `/mfa/passkey/options` | 5 attempts, shared | 1 minute | IP address |
| `POST /api/auth/forgot-password` | 3 attempts | 15 minutes | IP address |
| `POST /api/auth/forgot-password` | 3 attempts | 1 hour | Email address |
| `POST /api/auth/reset-password` | 3 attempts | 15 minutes | IP address |

Login answers a rate limited attempt with `401` and the message `Too many requests.`, not `429`, because it goes through the JWT login handler. Do not retry a failing login in a loop. After the first failed attempts from the same IP, a login from a browser also needs a `turnstileToken` field in the body, otherwise it answers `401` with `captcha_required`. Requests that identify as the mobile app are exempt from the captcha.

The other authentication endpoints answer `429` with `{"error": "Too many requests."}`.

### Shared social and passkey bucket

`POST /api/auth/google`, `POST /api/auth/apple`, `POST /api/auth/passkey/login` and `POST /api/auth/passkey/login/options` draw from one bucket of 10 attempts per minute per IP address. Requesting passkey options and then logging in uses two of the 10.

## Other endpoint limits

| Endpoint | Limit | Window | Applied per |
|----------|-------|--------|-------------|
| `POST /api/v1/contact` | 3 submissions | 1 hour | IP address |
| `POST /api/v1/licensing/validate` | 10 attempts | 1 hour | IP address |
| OAuth2 token endpoint | 20 requests | 1 minute | IP address |
| Client and supplier lookups (ANAF, VIES, partner verification) | 30 requests | 1 minute | User |
| Webhook test and delivery retry | 10 requests | 10 minutes | User |
| Storage connection test | 10 requests | 10 minutes | User |
| Invitations sent | 10 invitations | 1 hour | Organization |
| Document emails | 10 emails on free plans, 60 on paid plans | 10 minutes | User |
| Public declaration validation and legal document tools | 60 requests | 1 hour | IP address |
| Public storno generator | 30 requests | 1 hour | IP address |

## ANAF integration limits

ANAF (Romanian Tax Authority) calls have dedicated limiters to comply with ANAF API restrictions:

| Operation | Limit | Window | Applied per |
|-----------|-------|--------|-------------|
| All ANAF calls (global) | 1,000 requests | 1 minute | System-wide |
| ANAF calls triggered from one organization | 60 requests | 1 minute | Organization |
| List messages | 1,500 requests | 1 day | Company CIF |
| Download message | 100 requests | 1 day | Message ID |
| Check upload status | 100 requests | 1 day | Upload ID |
| Upload response | 1,000 requests | 1 day | Company CIF |

## Handling rate limit responses

When a rate limit is exceeded, most endpoints return a `429 Too Many Requests` response:

```json
{
  "error": "Too many requests."
}
```

For ANAF endpoints, the response includes a `Retry-After` header and a `retryAfter` value in seconds:

```json
{
  "error": "ANAF rate limit reached. Please try again later.",
  "retryAfter": 45
}
```

### Best Practices

- **Implement exponential backoff.** When you receive a `429`, wait before retrying and double the wait time on each consecutive failure.
- **Cache responses.** Avoid duplicate requests for data that rarely changes, such as exchange rates and company details.
- **Use webhooks.** Subscribe to [webhook events](/concepts/webhooks-events) instead of polling for status changes.
- **Use list filters.** Where the API supports them, filter a list endpoint instead of requesting items one by one.

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
