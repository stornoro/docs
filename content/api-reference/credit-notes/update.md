---
title: Update Credit Note
description: Update a credit note that has not been uploaded to ANAF
method: PUT
endpoint: /api/v1/invoices/{uuid}
---

# Update Credit Note

Updates a credit note. Credit notes use the invoice endpoint. Only the fields you send are changed; `lines`, when sent, replaces all the lines.

A credit note is editable while it is not cancelled, not `sent_to_provider` and has not been uploaded to ANAF. A document rejected by ANAF is editable again. Otherwise the request fails with `422`.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not used by this endpoint. The credit note is found by its id |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The id of the credit note |

## Request Body

All fields are optional. The fields are those of [Create credit note](/api-reference/credit-notes/create), with these differences:

- `parentDocumentId` cannot be changed. It is ignored on update.
- `documentSeriesId` is applied only while the status is `draft`.
- `invoiceTypeCode` accepts `null` to clear the value.
- `ublExtensions` accepts `null` to clear the value.

| Field | Type | Description |
|-------|------|-------------|
| `documentType` | string | `credit_note` or `invoice` |
| `clientId` | string | Id of the client |
| `documentSeriesId` | string | Id of the series (draft only) |
| `issueDate` | string | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | Due date (YYYY-MM-DD) |
| `currency` | string | Currency code |
| `exchangeRate` | number | Exchange rate |
| `invoiceTypeCode` | string \| null | One of the values listed in Create credit note |
| `notes` | string \| null | Public notes |
| `paymentTerms` | string \| null | Payment or refund terms |
| `issuerName` | string \| null | Name of the person issuing the credit note |
| `issuerId` | string \| null | Issuer identification number |
| `mentions` | string \| null | Additional mentions |
| `internalNote` | string \| null | Internal note |
| `lines` | array | Line items. Replaces all the existing lines |

### Line Item Object

The same as in Create credit note: `description`, `quantity` (not zero), `unitPrice` (not negative), `vatRate`, `vatCategoryCode`, `vatRateId`, `unitOfMeasure`, `productId`, `discount`, `discountPercent`, `vatIncluded`. A line `id` is not read: the lines are always recreated.

> **VAT on a line.** Send `vatRate` (a percentage) or `vatRateId` (the id of one of the company's rates from `GET /api/v1/vat-rates`; the line takes that rate's percentage and category). When both are sent `vatRate` wins. When neither is sent the line gets **21%**, also when the issuing company is not a VAT payer. For a company that is not a VAT payer send `vatRate: "0.00"` on every line. A `vatRateId` that is not a rate of the company is refused with an error; it never falls back to 21%.

## Request

```bash {% title="cURL" %}
curl -X PUT https://api.storno.ro/api/v1/invoices/850e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Partial refund - annual hosting cancelled",
    "lines": [
      {
        "description": "Hosting Services - Annual (CREDIT)",
        "quantity": -1,
        "unitPrice": 800,
        "vatRate": "19.00"
      }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/invoices/850e8400-e29b-41d4-a716-446655440000', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    notes: 'Partial refund - annual hosting cancelled',
    lines: [
      {
        description: 'Hosting Services - Annual (CREDIT)',
        quantity: -1,
        unitPrice: 800,
        vatRate: '19.00'
      }
    ]
  })
});
const data = await response.json();
```

## Response

`200 OK` with the updated invoice object and the UBL validation result. The invoice has the shape described in [Get credit note](/api-reference/credit-notes/get).

```json
{
  "invoice": {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "number": "DRAFT-0a1b2c3d",
    "documentType": "credit_note",
    "status": "draft",
    "direction": "outgoing",
    "parentDocumentId": "650e8400-e29b-41d4-a716-446655440111",
    "notes": "Partial refund - annual hosting cancelled",
    "lines": [
      {
        "id": "920e8400-e29b-41d4-a716-446655440000",
        "position": 1,
        "description": "Hosting Services - Annual (CREDIT)",
        "quantity": "-1",
        "unitPrice": "800",
        "vatRate": "19.00",
        "vatAmount": "-152.00",
        "lineTotal": "-800.00"
      }
    ],
    "subtotal": "-800.00",
    "vatTotal": "-152.00",
    "total": "-952.00",
    "amountPaid": "-952.00",
    "balance": "0.00"
  },
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "schematronAvailable": true
  }
}
```

Updating clears the cached XML so it is regenerated from the new data.

## Error codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | The invoice belongs to another organization or the user lacks the permission to edit |
| `404` | `Invoice not found.` |
| `422` | `Invoice is not editable.`, `Client not found.`, or a `vatRateId` that is not a rate of the company |
| `500` | `invoiceTypeCode` is not one of the accepted values |

## Next steps

- [Issue invoice](/api-reference/invoices/issue)
- [Delete credit note](/api-reference/credit-notes/delete)
