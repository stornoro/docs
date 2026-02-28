---
title: Submit Delivery Note to e-Transport
description: Submit an issued delivery note to ANAF's e-Transport system
method: POST
endpoint: /api/v1/delivery-notes/{uuid}/submit-etransport
---

# Submit Delivery Note to e-Transport

Submits an issued delivery note to Romania's ANAF e-Transport system to generate a TTN (Tracked Transport Number) declaration for domestic transport.

The submission is asynchronous. The API call immediately sets `etransportStatus` to `uploaded` and dispatches a background job that validates the delivery note, generates the required XML, uploads it to ANAF, and polls for a UIT (Unique Identification of Transport). The final status is updated once ANAF processes the declaration.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note to submit |

## Request

No request body required.

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/submit-etransport \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/submit-etransport', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

Returns the updated delivery note with `etransportStatus = uploaded` and `etransportSubmittedAt` set to the current timestamp:

```json
{
  "uuid": "950e8400-e29b-41d4-a716-446655440000",
  "number": "DN-2026-012",
  "seriesId": "850e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "850e8400-e29b-41d4-a716-446655440000",
    "name": "DN",
    "nextNumber": 13
  },
  "clientId": "750e8400-e29b-41d4-a716-446655440000",
  "client": {
    "uuid": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "registrationNumber": "RO12345678",
    "email": "contact@client.ro"
  },
  "status": "issued",
  "issueDate": "2026-02-18",
  "currency": "RON",
  "exchangeRate": 1.0,
  "subtotal": "5000.00",
  "vatAmount": "950.00",
  "total": "5950.00",
  "etransportStatus": "uploaded",
  "etransportSubmittedAt": "2026-02-18T14:35:00Z",
  "etransportUit": null,
  "issuedAt": "2026-02-18T14:30:00Z",
  "createdAt": "2026-02-18T09:00:00Z",
  "updatedAt": "2026-02-18T14:35:00Z"
}
```

## State Changes

### etransportStatus Transitions

| Transition | When |
|------------|------|
| `null` → `uploaded` | Immediately on successful API call |
| `uploaded` → `ok` | ANAF accepted the declaration and returned a UIT |
| `uploaded` → `nok` | ANAF rejected the declaration |
| `null` → `validation_failed` | Entity validation failed before upload |
| `null` → `upload_failed` | ANAF API error during upload |

### Fields Updated
- `etransportStatus` — set to `uploaded` on the synchronous response
- `etransportSubmittedAt` — set to current UTC timestamp (ISO 8601)
- `etransportUit` — populated with the UIT string once ANAF returns `ok`
- `updatedAt` — updated on every status change

## Validation Rules

### Status Requirement
- The delivery note must be in `issued` status.
- Delivery notes in `draft`, `cancelled`, or `converted` status cannot be submitted.

### e-Transport Fields Required
The delivery note must have all mandatory e-Transport fields populated before submission:

- Vehicle registration number
- Transport route (loading and unloading addresses)
- Declared transport date
- Tariff codes (NC codes) on all lines
- Gross weight per line

If any required field is missing, the background job sets `etransportStatus` to `validation_failed` without contacting ANAF.

### Re-submission
A delivery note with `etransportStatus` of `ok` (already has a valid UIT) cannot be resubmitted. Delivery notes with `nok`, `validation_failed`, or `upload_failed` status can be corrected and resubmitted.

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Delivery note not found or doesn't belong to the company |
| 422 | `validation_error` | Delivery note is not in `issued` status, or already has a valid UIT |

## Best Practices

1. **Check status before submitting** — Confirm `status = issued` and `etransportStatus` is not `ok` before calling this endpoint.
2. **Poll for final status** — After receiving `uploaded`, poll the delivery note (or listen for a webhook) until `etransportStatus` transitions to `ok`, `nok`, `validation_failed`, or `upload_failed`.
3. **Fill all e-Transport fields first** — Ensure vehicle number, route, NC tariff codes, and weights are complete before submitting to avoid `validation_failed`.
4. **Handle nok gracefully** — If ANAF returns `nok`, review the error details on the delivery note, correct the data, and resubmit.
5. **Store the UIT** — Once `etransportStatus = ok`, persist the `etransportUit` value; it is required to accompany the physical transport.
