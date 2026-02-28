---
title: Get webhook delivery
description: Retrieve full details of a single webhook delivery attempt including request and response payloads
method: GET
endpoint: /api/v1/webhooks/{uuid}/deliveries/{deliveryUuid}
---

# Get webhook delivery

Returns the complete details of a single delivery attempt, including the full request payload sent to your endpoint, the request headers (including the signature), and the full response received. Use this to debug failed deliveries or audit successful ones.

```
GET /api/v1/webhooks/{uuid}/deliveries/{deliveryUuid}
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Webhook endpoint UUID |
| `deliveryUuid` | string | Yes | Delivery attempt UUID |

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl "https://api.storno.ro/api/v1/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890/deliveries/c3d4e5f6-a7b8-9012-cdef-123456789012" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const webhookUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const deliveryUuid = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

const response = await fetch(
  `https://api.storno.ro/api/v1/webhooks/${webhookUuid}/deliveries/${deliveryUuid}`,
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
      'X-Company': '550e8400-e29b-41d4-a716-446655440000'
    }
  }
);

const delivery = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the complete delivery record including request and response details.

```json
{
  "uuid": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "webhookUuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "eventType": "invoice.validated",
  "status": "failed",
  "attempt": 1,
  "requestUrl": "https://your-app.example.com/webhooks/storno",
  "requestMethod": "POST",
  "requestHeaders": {
    "Content-Type": "application/json",
    "User-Agent": "Storno-Webhooks/1.0",
    "X-Storno-Event": "invoice.validated",
    "X-Storno-Delivery": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "X-Storno-Signature": "sha256=3e7b3a4f8c2d5e1b9a0c6f4d2e8a5b1c3d7a0e4f8b2c5d9a3e6f1b4c8d2a5e9f"
  },
  "requestPayload": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "type": "invoice.validated",
    "createdAt": "2026-02-18T09:45:00Z",
    "company": "550e8400-e29b-41d4-a716-446655440000",
    "data": {
      "invoiceUuid": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "invoiceNumber": "FAC-2026-042",
      "status": "validated",
      "anafSubmissionId": "ANAF-2026-987654",
      "validatedAt": "2026-02-18T09:44:00Z"
    }
  },
  "responseCode": 503,
  "responseHeaders": {
    "Content-Type": "text/plain",
    "Retry-After": "30"
  },
  "responseBody": "Service Unavailable",
  "durationMs": 5002,
  "errorMessage": "Endpoint returned non-2xx status: 503",
  "deliveredAt": "2026-02-18T09:45:00Z",
  "nextRetryAt": null
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique delivery attempt identifier |
| `webhookUuid` | string | UUID of the parent webhook endpoint |
| `eventType` | string | The event type that triggered this delivery |
| `status` | string | Outcome: `success` (2xx response) or `failed` (timeout or non-2xx) |
| `attempt` | integer | Attempt number (1 for initial, higher for retries) |
| `requestUrl` | string | The URL the delivery was posted to |
| `requestMethod` | string | Always `POST` |
| `requestHeaders` | object | HTTP headers sent with the delivery request |
| `requestPayload` | object | The exact JSON body sent to your endpoint |
| `responseCode` | integer | HTTP status code returned by your endpoint, or `0` on timeout |
| `responseHeaders` | object | HTTP response headers returned by your endpoint |
| `responseBody` | string | First 4,096 characters of the response body returned by your endpoint |
| `durationMs` | integer | Round-trip time in milliseconds |
| `errorMessage` | string | Human-readable failure reason, or `null` on success |
| `deliveredAt` | string | ISO 8601 timestamp when the delivery was attempted |
| `nextRetryAt` | string | ISO 8601 timestamp of the next scheduled retry, or `null` if no retry is pending |

### Delivery payload structure

The `requestPayload.data` object shape varies by event type:

| Event type | `data` content |
|------------|----------------|
| `invoice.created` | `invoiceUuid`, `invoiceNumber`, `status`, `direction`, `clientName`, `total`, `currency` |
| `invoice.validated` | `invoiceUuid`, `invoiceNumber`, `status`, `anafSubmissionId`, `validatedAt` |
| `invoice.rejected` | `invoiceUuid`, `invoiceNumber`, `status`, `anafSubmissionId`, `rejectionErrors` |
| `invoice.paid` | `invoiceUuid`, `invoiceNumber`, `amountPaid`, `balance`, `paidAt` |
| `sync.completed` | `syncId`, `invoicesSynced`, `duration`, `completedAt` |
| `sync.failed` | `syncId`, `errorMessage`, `failedAt` |
| `webhook.test` | `message`, `webhookUuid` |

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions — requires `webhook.view` permission |
| `404` | Webhook endpoint or delivery record not found for this company |

## Related endpoints

- [List deliveries](/api-reference/webhooks/list-deliveries) — Browse all delivery attempts with filtering
- [Test webhook](/api-reference/webhooks/test-webhook) — Send a new test delivery to inspect the full flow
