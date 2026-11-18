---
title: Submit Delivery Note to e-Transport
description: Submit an issued delivery note to ANAF's e-Transport system
method: POST
endpoint: /api/v1/delivery-notes/{uuid}/submit-etransport
---

# Submit Delivery Note to e-Transport

Submits an issued delivery note to Romania's ANAF e-Transport system to generate a TTN (Tracked Transport Number) declaration for domestic transport.

The submission is asynchronous. The API call immediately sets `etransportStatus` to `pending` and dispatches a background job that validates the delivery note, generates the required XML, uploads it to ANAF, and polls for a UIT (Unique Identification of Transport). The status is updated as the job progresses.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |

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

Returns the delivery note with `etransportStatus = pending` and `etransportSubmittedAt` set to the current time. The object has the fields described in [Get delivery note](/api-reference/delivery-notes/get#response); the example is abridged:

```json
{
  "id": "950e8400-e29b-41d4-a716-446655440000",
  "number": "DN0012",
  "client": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "cui": "12345678"
  },
  "status": "issued",
  "issueDate": "2026-02-18",
  "currency": "RON",
  "subtotal": "5000.00",
  "vatTotal": "1050.00",
  "total": "6050.00",
  "etransportStatus": "pending",
  "etransportSubmittedAt": "2026-02-18T14:35:00+00:00",
  "etransportUit": null,
  "etransportErrorMessage": null,
  "issuedAt": "2026-02-18T14:30:00+00:00"
}
```

## State Changes

### etransportStatus transitions

| Transition | When |
|------------|------|
| `null` to `pending` | Immediately on successful API call |
| `pending` to `uploaded` | The declaration was uploaded to ANAF |
| `uploaded` to `ok` | ANAF accepted the declaration and returned a UIT |
| `uploaded` to `nok` | ANAF rejected the declaration |
| `pending` to `validation_failed` | Entity, XML schema or Schematron validation failed before upload |
| `pending` to `upload_failed` | ANAF API error during upload |
| `uploaded` to `pending_timeout` | ANAF did not answer within the polling window |

### Fields updated
- `etransportStatus` - set to `pending` on the synchronous response
- `etransportSubmittedAt` - set to the current time
- `etransportErrorMessage` - cleared on submit, filled when a later step fails
- `etransportUit` - populated with the UIT string once ANAF returns `ok`

## Validation Rules

### Status requirement
- The delivery note must be in `issued` status. Delivery notes in `draft`, `cancelled` or `converted` status are refused with 422.
- The delivery note must not have `skipEtransport` set.

### Required e-Transport fields
The delivery note needs all mandatory e-Transport fields before submission:

- Vehicle registration number
- Transport route (loading and unloading addresses)
- Declared transport date
- Tariff codes (NC codes) on all lines
- Gross weight per line

If a required field is missing, the background job sets `etransportStatus` to `validation_failed` and does not contact ANAF.

### Re-submission
A delivery note can be submitted again only when `etransportStatus` is empty, `validation_failed`, `upload_failed`, `nok` or `pending_timeout`. Any other status (`pending`, `uploaded`, `ok`) is refused with 422.

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied (requires the e-Factura submit permission) |
| 404 | Delivery note not found or not in the caller's organization |
| 422 | The delivery note is not `issued`, is marked to skip e-Transport, or was already submitted |

## Best Practices

1. **Check status before submitting**: Confirm `status = issued` and `etransportStatus` is empty or one of the failed statuses before calling this endpoint.
2. **Poll for final status**: After receiving `pending`, poll the delivery note until `etransportStatus` transitions to `ok`, `nok`, `validation_failed`, `upload_failed` or `pending_timeout`.
3. **Fill all e-Transport fields first** — Ensure vehicle number, route, NC tariff codes, and weights are complete before submitting to avoid `validation_failed`.
4. **Handle nok gracefully** — If ANAF returns `nok`, review the error details on the delivery note, correct the data, and resubmit.
5. **Store the UIT** — Once `etransportStatus = ok`, persist the `etransportUit` value; it is required to accompany the physical transport.
