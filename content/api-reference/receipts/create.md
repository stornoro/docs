---
title: Create Receipt
description: Create a new fiscal receipt (bon fiscal)
method: POST
endpoint: /api/v1/receipts
---

# Create Receipt

Creates a new fiscal receipt (bon fiscal) in draft status. Receipts document point-of-sale transactions and can later be converted into formal invoices when customers request a tax document.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request (optional when the organization has a single company; `?company=` is also accepted) |
| `Content-Type` | string | Yes | Must be `application/json` |
| `Idempotency-Key` | string | No | Client-generated unique key. Repeat submissions with the same key return the originally created receipt instead of creating a duplicate. Equivalent to passing `idempotencyKey` in the body. |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `documentSeriesId` | string | No | UUID of the receipt document series. If not provided, the default `receipt` series for the company is used. A series of another company is ignored |
| `issueDate` | string | No | Date of issue (YYYY-MM-DD). Defaults to the creation date |
| `currency` | string | No | Currency code (RON, EUR, USD, etc.). Defaults to the company default currency |
| `exchangeRate` | string | No | Exchange rate |
| `cashRegisterName` | string | No | Name or label of the cash register |
| `fiscalNumber` | string | No | Fiscal serial number of the cash register |
| `paymentMethod` | string | No | Payment method, stored as sent. The list filter knows `cash`, `card`, `meal_ticket`, `mixed`, `other` |
| `cashPayment` | number | No | Amount paid in cash |
| `cardPayment` | number | No | Amount paid by card |
| `otherPayment` | number | No | Amount paid by other method |
| `customerName` | string | No | Customer name (for B2B receipts) |
| `customerCif` | string | No | Customer CIF/CUI (for B2B receipts) |
| `clientId` | string | No | UUID of a linked client of the company. An unknown id is refused with 400 `Client not found.` |
| `notes` | string | No | Public notes on the receipt |
| `internalNote` | string | No | Internal note (not printed on receipt) |
| `mentions` | string | No | Additional mentions |
| `projectReference` | string | No | Project reference |
| `issuerName` | string | No | Issuer name |
| `issuerId` | string | No | Issuer identifier |
| `salesAgent` | string | No | Sales agent |
| `idempotencyKey` | string | No | Client-generated key, unique within the company, for retry-safe submissions. Same effect as the `Idempotency-Key` header; the header takes precedence if both are sent. Up to 255 chars. |
| `lines` | array | Yes | Array of line items (minimum 1 item) |

### Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Item description |
| `quantity` | number | Yes | Quantity sold (must be > 0) |
| `unitPrice` | number | Yes | Price per unit, zero or more. Excludes VAT unless `vatIncluded` is true |
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
curl -X POST https://api.storno.ro/api/v1/receipts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-18",
    "currency": "RON",
    "cashRegisterName": "Casa 1 - Front Desk",
    "fiscalNumber": "AAAA123456",
    "paymentMethod": "mixed",
    "cashPayment": 100.00,
    "cardPayment": 151.00,
    "otherPayment": 0.00,
    "customerName": "Acme SRL",
    "customerCif": "RO12345678",
    "clientId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "notes": "Thank you for your purchase!",
    "internalNote": "Loyalty card customer",
    "lines": [
      {
        "description": "Coffee - Espresso",
        "quantity": 2,
        "unitPrice": 12.61,
        "unitOfMeasure": "pcs",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000"
      },
      {
        "description": "Notebook A5",
        "quantity": 2,
        "unitPrice": 41.18,
        "unitOfMeasure": "pcs",
        "vatRateId": "360e8400-e29b-41d4-a716-446655440000"
      }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    documentSeriesId: '850e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-18',
    currency: 'RON',
    cashRegisterName: 'Casa 1 - Front Desk',
    fiscalNumber: 'AAAA123456',
    paymentMethod: 'mixed',
    cashPayment: 100.00,
    cardPayment: 151.00,
    otherPayment: 0.00,
    customerName: 'Acme SRL',
    customerCif: 'RO12345678',
    clientId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    notes: 'Thank you for your purchase!',
    internalNote: 'Loyalty card customer',
    lines: [
      {
        description: 'Coffee - Espresso',
        quantity: 2,
        unitPrice: 12.61,
        unitOfMeasure: 'pcs',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000'
      },
      {
        description: 'Notebook A5',
        quantity: 2,
        unitPrice: 41.18,
        unitOfMeasure: 'pcs',
        vatRateId: '360e8400-e29b-41d4-a716-446655440000'
      }
    ]
  })
});

const data = await response.json();
```

## Response

`201 Created` with the receipt in draft status. The body has the same shape as [Get receipt](/api-reference/receipts/get). A repeated `Idempotency-Key` returns the existing receipt, also with `201`.

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "BON-3f9c2a10",
  "documentSeries": {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "prefix": "BON",
    "nextNumber": "BON0043"
  },
  "client": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Acme SRL",
    "cui": "12345678"
  },
  "status": "draft",
  "currency": "RON",
  "issueDate": "2026-02-18T00:00:00+02:00",
  "subtotal": "107.58",
  "vatTotal": "17.92",
  "total": "125.50",
  "discount": "0.00",
  "paymentMethod": "mixed",
  "cashPayment": "100.00",
  "cardPayment": "151.00",
  "otherPayment": "0.00",
  "cashRegisterName": "Casa 1 - Front Desk",
  "fiscalNumber": "AAAA123456",
  "customerName": "Acme SRL",
  "customerCif": "RO12345678",
  "notes": "Thank you for your purchase!",
  "internalNote": "Loyalty card customer",
  "lines": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
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
      "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
      "position": 2,
      "description": "Notebook A5",
      "quantity": "2.0000",
      "unitOfMeasure": "pcs",
      "unitPrice": "41.18",
      "vatRate": "19.00",
      "vatCategoryCode": "S",
      "vatAmount": "15.65",
      "lineTotal": "82.36",
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

A draft receipt carries a temporary number (`BON-` followed by eight characters). The final number is assigned when the receipt is issued.

## Validation Rules

The request is checked for the following only:

- `lines` is present and has at least one item
- every line has a `description`, a `quantity` greater than 0 and a `unitPrice` of 0 or more
- `clientId`, when sent, is a client of the company
- `vatRateId`, when sent without `vatRate`, is a VAT rate of the company

The payment amounts are stored as sent. The API does not check that `cashPayment + cardPayment + otherPayment` equals `total`, or that `paymentMethod` matches the amounts.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | A validation rule above failed, or the manager refused the data (unknown client, unknown `vatRateId`, invalid date) |
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Company not found |

## Example Validation Error Response

```json
{
  "error": "Line 0: quantity must be positive."
}
```

## Common Scenarios

### Cash-Only Purchase
```javascript
{
  paymentMethod: 'cash',
  cashPayment: 50.00,
  cardPayment: 0.00,
  otherPayment: 0.00
}
```

### Card-Only Purchase
```javascript
{
  paymentMethod: 'card',
  cashPayment: 0.00,
  cardPayment: 150.00,
  otherPayment: 0.00
}
```

### Meal Ticket + Cash
```javascript
{
  paymentMethod: 'mixed',
  cashPayment: 10.00,
  cardPayment: 0.00,
  otherPayment: 20.00   // meal ticket value
}
```

### B2B Receipt Without Client Link
```javascript
{
  customerName: 'Firm Anonima SRL',
  customerCif: 'RO99887766'
  // no clientId — customer data recorded directly
}
```

### B2B Receipt With Client Link
```javascript
{
  clientId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  customerName: 'Acme SRL',
  customerCif: 'RO12345678'
  // linked to existing Client — enables clean invoice conversion
}
```

## Idempotency

Send a unique `Idempotency-Key` header (or `idempotencyKey` body field) when retrying receipt creation in scenarios where the original response was lost — for example, a network timeout mid-request or a queued offline POS sale. The backend records the key on the receipt; subsequent submissions with the same key return the originally-created receipt instead of inserting a duplicate.

The key is a free-form string up to 255 characters; UUIDs are recommended. Keys are unique within the company: the same key sent for another company creates that company's own receipt.

```bash {% title="Idempotent retry" %}
curl -X POST https://api.storno.ro/api/v1/receipts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Idempotency-Key: pos-1761417321-7k3xq2v9" \
  -H "Content-Type: application/json" \
  -d '{ ... receipt body ... }'
```

## Next Steps

After creating a receipt:
1. Mark as issued when the receipt is printed and handed to the customer (`POST /api/v1/receipts/{uuid}/issue`)
2. If the customer requests an invoice, convert to invoice (`POST /api/v1/receipts/{uuid}/convert`)
