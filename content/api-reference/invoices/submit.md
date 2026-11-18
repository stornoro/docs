---
title: Submit invoice to ANAF
description: Send an issued invoice to ANAF e-Factura at once
---

# Submit invoice to ANAF

Sends an issued invoice to ANAF e-Factura now. The status changes to `sent_to_provider` immediately and the upload runs in the background. A scheduled automatic submission (see [Issue invoice](/api-reference/invoices/issue)) is cancelled by this call.

```
POST /api/v1/invoices/{uuid}/submit
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not used on this route: the invoice is found by its UUID |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

The endpoint takes no body.

## Prerequisites

1. The invoice is issued, or was rejected by ANAF and is being sent again. Drafts, cancelled and refunded invoices, and invoices already sent, validated or synced cannot be submitted.
2. The company has a valid ANAF token.
3. The client country is `RO` or not set. Invoices for clients in other countries are not sent to ANAF.

{% callout type="info" %}
ANAF validates the invoice asynchronously. Check the result with [Get invoice details](/api-reference/invoices/get), [Invoice events](/api-reference/invoices/events) or webhooks.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/submit', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const invoice = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns `200 OK` with a short result, not the invoice.

```json
{
  "message": "Factura a fost trimisa la ANAF.",
  "status": "sent_to_provider"
}
```

## After submission

1. `sent_to_provider`: the invoice is queued for upload.
2. `validated`: ANAF accepted the invoice.
3. `rejected`: ANAF rejected it. `anafErrorMessage` on the invoice holds the reason, and you can fix the invoice and submit again.

## Error codes

Error bodies have the form `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | The invoice belongs to another organization, or the user cannot issue invoices |
| `404` | Invoice not found |
| `422` | The invoice cannot be submitted: status not allowed, already sent to ANAF, client outside Romania, or no valid ANAF token for the company |

## Related endpoints

- [Issue invoice](/api-reference/invoices/issue) - Issue invoice before submitting
- [Get invoice details](/api-reference/invoices/get) - Check submission status
- [Invoice events](/api-reference/invoices/events) - View submission timeline
- [Download XML](/api-reference/invoices/xml) - Download the XML
