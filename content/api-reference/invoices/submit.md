---
title: Submit invoice to e-invoice provider
description: Submit an issued invoice to the e-invoice provider
---

# Submit invoice to e-invoice provider

Submits an issued invoice to the e-invoice provider. The invoice must be issued before it can be submitted. Changes the invoice status to `sent_to_provider`.

```
POST /api/v1/invoices/{uuid}/submit
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Prerequisites

Before submitting an invoice to the e-invoice provider, ensure:

1. The invoice has been [issued](/api-reference/invoices/issue)
2. The company has valid provider credentials configured
3. The invoice XML has been generated
4. The company has an active connection to the e-invoice provider

{% callout type="info" %}
After submission, the e-invoice provider will validate the invoice asynchronously. You can check the validation status by polling the [invoice details](/api-reference/invoices/get) endpoint or by listening to webhook events.
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

Returns the updated invoice object with status `sent_to_provider` and submission details.

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "number": "FAC-2024-001",
  "status": "sent_to_provider",
  "direction": "outgoing",
  "currency": "RON",
  "issueDate": "2024-02-15",
  "dueDate": "2024-03-15",
  "subtotal": 1000.00,
  "vatTotal": 190.00,
  "total": 1190.00,
  "xmlGenerated": true,
  "xmlPath": "/storage/invoices/2024/02/7c9e6679-xml.xml",
  "anafSubmissionId": "ANAF-2024-123456",
  "anafDownloadId": "DL-987654",
  "anafValidationErrors": null,
  "events": [
    {
      "id": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
      "type": "status_change",
      "status": "sent_to_provider",
      "timestamp": "2024-02-15T09:15:00Z",
      "details": "Invoice submitted to e-invoice provider successfully",
      "metadata": {
        "submissionId": "ANAF-2024-123456",
        "downloadId": "DL-987654"
      }
    }
  ],
  "updatedAt": "2024-02-15T09:15:00Z"
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `anafSubmissionId` | string | ANAF submission identifier |
| `anafDownloadId` | string | ANAF download identifier for the uploaded file |
| `anafValidationErrors` | array\|null | Validation errors from ANAF (populated after validation) |

## Provider validation process

After submission, the e-invoice provider validates the invoice in the background:

1. **Submitted** (`sent_to_provider`) - Invoice uploaded to the provider
2. **Validating** - The provider is processing the invoice
3. **Validated** (`validated`) - Invoice passed provider validation
4. **Rejected** (`rejected`) - Invoice failed provider validation

You can monitor the validation status through:
- Polling the [invoice details endpoint](/api-reference/invoices/get)
- Webhooks (if configured)
- [Invoice events endpoint](/api-reference/invoices/events)

## Error codes

| Code | Description |
|------|-------------|
| `400` | Missing provider credentials or invalid configuration |
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Invoice not found |
| `409` | Invoice is not issued yet or already submitted |
| `422` | XML generation failed or invalid XML format |
| `503` | E-invoice provider service temporarily unavailable |

## Common submission errors

| Error | Cause | Solution |
|-------|-------|----------|
| No provider token | Company has not connected to the e-invoice provider | Complete provider OAuth flow |
| Token expired | Provider OAuth token has expired | Refresh provider token |
| XML not generated | Invoice was not properly issued | Re-issue the invoice |
| Provider service down | E-invoice provider is unavailable | Retry later |
| Invalid XML format | Data validation failed | Check invoice data and re-issue |

## Related endpoints

- [Issue invoice](/api-reference/invoices/issue) - Issue invoice before submitting
- [Get invoice details](/api-reference/invoices/get) - Check submission status
- [Invoice events](/api-reference/invoices/events) - View submission timeline
- [Download XML](/api-reference/invoices/xml) - Download submitted XML
