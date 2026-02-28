---
title: Toggle recurring invoice
description: Enable or disable automatic invoice generation for a recurring invoice.
---

# Toggle recurring invoice

Toggles the `isActive` flag of a recurring invoice, enabling or disabling automatic invoice generation. This provides a way to pause and resume recurring invoices without deleting them.

```http
POST /api/v1/recurring-invoices/{uuid}/toggle
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the recurring invoice |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns the updated recurring invoice object with the toggled `isActive` status.

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/recurring-invoices/rec-inv-uuid-1/toggle' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "uuid": "rec-inv-uuid-1",
  "reference": "MONTHLY-HOSTING-001",
  "clientId": "client-uuid-1",
  "seriesId": "series-uuid-1",
  "documentType": "invoice",
  "currency": "RON",
  "invoiceTypeCode": "380",
  "frequency": "monthly",
  "frequencyDay": 1,
  "frequencyMonth": null,
  "nextIssuanceDate": "2026-03-01",
  "stopDate": null,
  "dueDateType": "relative",
  "dueDateDays": 30,
  "dueDateFixedDay": null,
  "isActive": false,
  "notes": "Monthly hosting services",
  "paymentTerms": "Payment due within 30 days",
  "autoEmailEnabled": true,
  "autoEmailTime": "09:00",
  "autoEmailDayOffset": 0,
  "penaltyEnabled": true,
  "penaltyPercentPerDay": 0.05,
  "penaltyGraceDays": 5,
  "lines": [
    {
      "uuid": "line-uuid-1",
      "description": "Cloud Hosting - Business Plan",
      "quantity": 1,
      "unitPrice": 1499.00,
      "vatRateId": "vat-uuid-1",
      "vatRate": 19,
      "vatAmount": 284.81,
      "totalAmount": 1783.81,
      "unitOfMeasure": "buc",
      "productId": "product-uuid-1",
      "priceRule": "fixed",
      "referenceCurrency": null,
      "markupPercent": null,
      "position": 1
    }
  ],
  "subtotal": 1499.00,
  "vatTotal": 284.81,
  "totalAmount": 1783.81,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-02-16T12:15:00Z"
}
```

## Behavior

- If `isActive` is `true`, it will be set to `false` (pausing generation)
- If `isActive` is `false`, it will be set to `true` (resuming generation)
- The `updatedAt` timestamp is updated
- The `nextIssuanceDate` is not modified
- When re-enabled, if `nextIssuanceDate` is in the past, the next scheduled job will generate the invoice immediately

## Use Cases

### Temporary Pause

When a client requests a temporary suspension of service, toggle the recurring invoice off instead of deleting it. Toggle it back on when service resumes.

### Seasonal Services

For services that are seasonal or have scheduled breaks, toggle recurring invoices instead of creating and deleting them repeatedly.

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Recurring invoice not found or doesn't belong to company |

## Related Endpoints

- [Get recurring invoice](/api-reference/recurring-invoices/get)
- [Update recurring invoice](/api-reference/recurring-invoices/update)
- [Delete recurring invoice](/api-reference/recurring-invoices/delete)
