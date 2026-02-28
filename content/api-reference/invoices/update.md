---
title: Update invoice
description: Update an existing draft invoice
---

# Update invoice

Updates an existing draft invoice. Only invoices with status `draft` can be updated. Once an invoice is issued, it cannot be modified.

```
PUT /api/v1/invoices/{uuid}
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Request body

The request body accepts the same fields as the [create invoice](/api-reference/invoices/create) endpoint. All fields are optional - only include the fields you want to update.

| Name | Type | Description |
|------|------|-------------|
| `clientId` | string | Client UUID |
| `seriesId` | string | Invoice series UUID |
| `issueDate` | string | Invoice issue date (ISO 8601: YYYY-MM-DD) |
| `dueDate` | string | Payment due date (ISO 8601: YYYY-MM-DD) |
| `currency` | string | ISO 4217 currency code |
| `exchangeRate` | number | Exchange rate |
| `invoiceTypeCode` | string | UBL invoice type code |
| `notes` | string | Public notes visible to client |
| `paymentTerms` | string | Payment terms description |
| `deliveryLocation` | string | Delivery address |
| `projectReference` | string | Project reference number |
| `orderNumber` | string | Purchase order number |
| `contractNumber` | string | Contract reference number |
| `issuerName` | string | Name of person issuing the invoice |
| `issuerId` | string | Issuer ID number |
| `mentions` | string | Additional legal mentions |
| `internalNote` | string | Internal note (not visible to client) |
| `salesAgent` | string | Sales agent name |
| `deputyName` | string | Deputy/representative name |
| `deputyIdentityCard` | string | Deputy ID card number |
| `deputyAuto` | string | Deputy vehicle registration |
| `penaltyEnabled` | boolean | Enable late payment penalty |
| `penaltyPercentPerDay` | number | Daily penalty percentage |
| `penaltyGraceDays` | integer | Grace period before penalty applies |
| `language` | string | Document language for PDF generation: `ro`, `en`, `de`, `fr` (default: `ro`) |
| `lines` | array | Array of invoice line items (replaces all lines) |

{% callout type="warning" %}
When updating `lines`, the entire array is replaced. Include all line items you want to keep, not just the ones you're changing.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X PUT https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "dueDate": "2024-03-30",
    "notes": "Payment terms: 45 days net",
    "lines": [
      {
        "description": "Web Development Services - Updated",
        "quantity": 15,
        "unitPrice": 100.00,
        "unitOfMeasure": "hours",
        "vatIncluded": false
      }
    ]
  }'
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    dueDate: '2024-03-30',
    notes: 'Payment terms: 45 days net',
    lines: [
      {
        description: 'Web Development Services - Updated',
        quantity: 15,
        unitPrice: 100.00,
        unitOfMeasure: 'hours',
        vatIncluded: false
      }
    ]
  })
});

const invoice = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the updated invoice object.

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "number": "FAC-2024-001",
  "status": "draft",
  "direction": "outgoing",
  "currency": "RON",
  "exchangeRate": 1.0,
  "issueDate": "2024-02-15",
  "dueDate": "2024-03-30",
  "subtotal": 1500.00,
  "vatTotal": 285.00,
  "total": 1785.00,
  "amountPaid": 0.00,
  "balance": 1785.00,
  "notes": "Payment terms: 45 days net",
  "lines": [
    {
      "id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
      "description": "Web Development Services - Updated",
      "quantity": 15.0,
      "unitPrice": 100.00,
      "unitOfMeasure": "hours",
      "vatRate": 19.0,
      "vatAmount": 285.00,
      "subtotal": 1500.00,
      "total": 1785.00
    }
  ],
  "updatedAt": "2024-02-15T10:45:00Z"
}
```

## Error codes

| Code | Description |
|------|-------------|
| `400` | Validation error - invalid data format |
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Invoice not found |
| `409` | Cannot update non-draft invoice |
| `422` | Business validation error |
