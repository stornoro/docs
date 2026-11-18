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

The endpoint takes no body.

## Response

Returns the recurring invoice with the toggled `isActive` value, in the shape described on [Get recurring invoice](/api-reference/recurring-invoices/get).

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/recurring-invoices/rec-inv-uuid-1/toggle' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Example Response

```json
{
  "id": "rec-inv-uuid-1",
  "client": {
    "id": "client-uuid-1",
    "type": "company",
    "name": "Acme Corporation SRL",
    "cui": "12345678",
    "city": "Bucuresti",
    "country": "RO",
    "email": "contact@acme.ro"
  },
  "reference": "MONTHLY-HOSTING-001",
  "documentType": "invoice",
  "currency": "RON",
  "invoiceTypeCode": null,
  "frequency": "monthly",
  "frequencyDay": 1,
  "frequencyMonth": null,
  "nextIssuanceDate": "2026-03-01T00:00:00+00:00",
  "stopDate": null,
  "dueDateType": "days",
  "dueDateDays": 30,
  "dueDateFixedDay": null,
  "isActive": false,
  "lastIssuedAt": null,
  "lastInvoiceNumber": null,
  "lastInvoiceId": null,
  "lastDocumentType": null,
  "notes": "Monthly hosting services",
  "paymentTerms": "Payment due within 30 days",
  "balance": null,
  "balanceStep": null,
  "autoEmailEnabled": true,
  "autoEmailTime": "09:00",
  "autoEmailDayOffset": 0,
  "penaltyEnabled": true,
  "penaltyPercentPerDay": "0.05",
  "penaltyGraceDays": 5,
  "lines": [
    {
      "id": "line-uuid-1",
      "productId": "product-uuid-1",
      "productName": "Cloud Hosting",
      "position": 1,
      "description": "Cloud Hosting - Business Plan",
      "quantity": "1.0000",
      "unitOfMeasure": "buc",
      "unitPrice": "1499.00",
      "vatRate": "19",
      "vatCategoryCode": "S",
      "vatAmount": "284.81",
      "lineTotal": "1499.00",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "priceRule": "fixed",
      "referenceCurrency": null,
      "markupPercent": null,
      "priceExpression": null
    }
  ],
  "subtotal": "1499.00",
  "vatTotal": "284.81",
  "total": "1783.81",
  "estimatedSubtotal": "1499.00",
  "estimatedVatTotal": "284.81",
  "estimatedTotal": "1783.81"
}
```

## Behavior

- If `isActive` is `true`, it is set to `false` (generation paused)
- If `isActive` is `false`, it is set to `true` (generation resumed)
- The `nextIssuanceDate` is not modified
- When re-enabled with a `nextIssuanceDate` in the past, the next scheduled run generates the document

## Use Cases

### Temporary Pause

When a client requests a temporary suspension of service, toggle the recurring invoice off instead of deleting it. Toggle it back on when service resumes.

### Seasonal Services

For services that are seasonal or have scheduled breaks, toggle recurring invoices instead of creating and deleting them repeatedly.

## Errors

Errors have the form `{"error": "message"}`.

| Status | Description |
|--------|-------------|
| 401 | Missing or invalid authentication token |
| 402 | Recurring invoices are not available on the plan. Body has `"code": "PLAN_LIMIT"` |
| 403 | Missing permission |
| 404 | Recurring invoice not found |

## Related Endpoints

- [Get recurring invoice](/api-reference/recurring-invoices/get)
- [Update recurring invoice](/api-reference/recurring-invoices/update)
- [Delete recurring invoice](/api-reference/recurring-invoices/delete)
