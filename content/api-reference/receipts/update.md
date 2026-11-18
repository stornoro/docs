---
title: Update Receipt
description: Update an existing receipt (draft or issued status)
method: PUT
endpoint: /api/v1/receipts/{uuid}
---

# Update Receipt

Updates an existing fiscal receipt. Receipts in `draft` and `issued` status can be updated. Once a receipt is invoiced or cancelled, it can no longer be updated.

Only the fields present in the body are changed. When `lines` is present, it replaces all existing lines.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Company UUID. Not used to find the receipt; access is checked against your organization |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the receipt to update |

## Request Body

All fields are optional.

| Field | Type | Description |
|-------|------|-------------|
| `documentSeriesId` | string \| null | UUID of the receipt document series. `null` removes the series. A series of another company is ignored |
| `issueDate` | string | Date of issue (YYYY-MM-DD) |
| `currency` | string | Currency code |
| `exchangeRate` | string \| null | Exchange rate |
| `cashRegisterName` | string \| null | Name or label of the cash register |
| `fiscalNumber` | string \| null | Fiscal serial number of the cash register |
| `paymentMethod` | string \| null | Payment method, stored as sent |
| `cashPayment` | number \| null | Amount paid in cash |
| `cardPayment` | number \| null | Amount paid by card |
| `otherPayment` | number \| null | Amount paid by other method |
| `customerName` | string \| null | Customer name |
| `customerCif` | string \| null | Customer CIF/CUI |
| `clientId` | string | UUID of a linked client of the company |
| `notes` | string \| null | Public notes |
| `mentions` | string \| null | Additional mentions |
| `internalNote` | string \| null | Internal note |
| `projectReference` | string \| null | Project reference |
| `issuerName` | string \| null | Issuer name |
| `issuerId` | string \| null | Issuer identifier |
| `salesAgent` | string \| null | Sales agent |
| `lines` | array | Array of line items. Replaces all existing lines |

### Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Item description |
| `quantity` | number | Yes | Quantity |
| `unitPrice` | number | Yes | Price per unit. Excludes VAT unless `vatIncluded` is true |
| `vatRate` | number | No | VAT rate percentage. Default 21.00 when neither `vatRate` nor `vatRateId` is sent, whatever the VAT status of the company |
| `vatCategoryCode` | string | No | UBL VAT category code (default `S`; a 0% rate becomes `Z` on its own) |
| `vatRateId` | string | No | Id of one of the company's VAT rates (`GET /api/v1/vat-rates`). The line takes its percentage and category. Ignored when `vatRate` is sent; an error when it is not a rate of the company |
| `vatIncluded` | boolean | No | Whether `unitPrice` includes VAT (default false) |
| `discount` | number | No | Line discount amount (default 0) |
| `discountPercent` | number | No | Line discount percentage (default 0) |
| `unitOfMeasure` | string | No | Unit of measure (default `buc`) |
| `productCode` | string | No | Product code printed on the line |

> **VAT on a line.** Send `vatRate` (a percentage) or `vatRateId` (the id of one of the company's rates from `GET /api/v1/vat-rates`; the line takes that rate's percentage and category). When both are sent `vatRate` wins. When neither is sent the line gets **21%**, also when the issuing company is not a VAT payer. For a company that is not a VAT payer send `vatRate: "0.00"` on every line. A `vatRateId` that is not a rate of the company is refused with an error; it never falls back to 21%.

## Request

```bash {% title="cURL" %}
curl -X PUT https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "card",
    "cashPayment": 0.00,
    "cardPayment": 48.49,
    "otherPayment": 0.00,
    "customerName": "Acme SRL",
    "customerCif": "RO12345678",
    "notes": "Updated order",
    "lines": [
      {
        "description": "Coffee - Espresso",
        "quantity": 2,
        "unitPrice": 12.61,
        "unitOfMeasure": "pcs",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000"
      },
      {
        "description": "Pen Blue",
        "quantity": 5,
        "unitPrice": 4.20,
        "unitOfMeasure": "pcs",
        "vatRate": 19
      }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    paymentMethod: 'card',
    cashPayment: 0.00,
    cardPayment: 48.49,
    otherPayment: 0.00,
    customerName: 'Acme SRL',
    customerCif: 'RO12345678',
    notes: 'Updated order',
    lines: [
      {
        description: 'Coffee - Espresso',
        quantity: 2,
        unitPrice: 12.61,
        unitOfMeasure: 'pcs',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000'
      },
      {
        description: 'Pen Blue',
        quantity: 5,
        unitPrice: 4.20,
        unitOfMeasure: 'pcs',
        vatRate: 19
      }
    ]
  })
});

const data = await response.json();
```

## Response

Returns the updated receipt with recalculated totals, in the same shape as [Get receipt](/api-reference/receipts/get):

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "BON-3f9c2a10",
  "documentSeries": {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "prefix": "BON",
    "nextNumber": "BON0043"
  },
  "status": "draft",
  "currency": "RON",
  "issueDate": "2026-02-18T00:00:00+02:00",
  "subtotal": "42.87",
  "vatTotal": "5.62",
  "total": "48.49",
  "discount": "0.00",
  "paymentMethod": "card",
  "cashPayment": "0.00",
  "cardPayment": "48.49",
  "otherPayment": "0.00",
  "customerName": "Acme SRL",
  "customerCif": "RO12345678",
  "notes": "Updated order",
  "lines": [
    {
      "id": "g7h8i9j0-k1l2-3456-mnop-678901234567",
      "position": 1,
      "description": "Coffee - Espresso",
      "quantity": "2.0000",
      "unitOfMeasure": "pcs",
      "unitPrice": "12.61",
      "vatRate": "9.00",
      "vatCategoryCode": "S",
      "vatAmount": "2.27",
      "lineTotal": "25.22",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false
    },
    {
      "id": "h8i9j0k1-l2m3-4567-nopq-789012345678",
      "position": 2,
      "description": "Pen Blue",
      "quantity": "5.0000",
      "unitOfMeasure": "pcs",
      "unitPrice": "4.20",
      "vatRate": "19.00",
      "vatCategoryCode": "S",
      "vatAmount": "3.35",
      "lineTotal": "17.65",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false
    }
  ],
  "convertedInvoice": null,
  "issuedAt": null,
  "cancelledAt": null,
  "refundOf": null,
  "refundedBy": []
}
```

## Line Item Behavior

When `lines` is sent:
- All existing lines are deleted and the lines in the request are created, so every line gets a new `id`
- Positions are assigned sequentially from 1

When `lines` is omitted, the existing lines stay as they are.

## Validation Rules

- The receipt must be in `draft` or `issued` status
- `clientId`, when sent, must be a client of the company
- `vatRateId`, when sent without `vatRate`, must be a VAT rate of the company

The request is not checked further. Line values and payment amounts are stored as sent, and payment amounts are not compared with `total`.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Receipt not found or not in your organization |
| 422 | The receipt cannot be edited (invoiced or cancelled), the client was not found, or a `vatRateId` is not a rate of the company |

Error responses have the form `{"error": "message"}`.

## Best Practices

1. **Update before printing** - Make corrections while the receipt is still a draft
2. **Verify payment totals** - Check that the payment amounts add up to the receipt total, because the API does not
3. **Match fiscal device** - The `fiscalNumber` and `cashRegisterName` should match the device that printed the receipt
