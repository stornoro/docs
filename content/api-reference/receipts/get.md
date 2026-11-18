---
title: Get Receipt
description: Retrieve detailed information for a specific receipt including line items
method: GET
endpoint: /api/v1/receipts/{uuid}
---

# Get Receipt

Retrieves complete details for a specific fiscal receipt, including all line items, payment breakdown, customer information, and calculated totals.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Company UUID. Not used to find the receipt; access is checked against your organization |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the receipt to retrieve |

## Request

```bash {% title="cURL" %}
curl -X GET https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts/a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "BON0042",
  "documentSeries": {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "prefix": "BON",
    "nextNumber": "BON0043"
  },
  "status": "issued",
  "currency": "RON",
  "issueDate": "2026-02-18T00:00:00+02:00",
  "subtotal": "210.92",
  "vatTotal": "40.08",
  "total": "251.00",
  "discount": "0.00",
  "paymentMethod": "mixed",
  "cashPayment": "100.00",
  "cardPayment": "151.00",
  "otherPayment": "0.00",
  "cashRegisterName": "Casa 1 - Front Desk",
  "fiscalNumber": "AAAA123456",
  "deviceSerial": null,
  "customerName": "Acme SRL",
  "customerCif": "RO12345678",
  "client": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "type": "company",
    "name": "Acme SRL",
    "cui": "12345678",
    "cnp": null,
    "registrationNumber": "J12/345/2020",
    "address": "Strada Principala, nr. 10",
    "city": "Cluj-Napoca",
    "county": "Cluj",
    "country": "RO",
    "postalCode": "400000",
    "email": "office@acme.example",
    "phone": "+40721234567"
  },
  "notes": "Thank you for your purchase!",
  "mentions": null,
  "internalNote": "Loyalty card customer",
  "projectReference": null,
  "issuerName": null,
  "issuerId": null,
  "salesAgent": null,
  "exchangeRate": null,
  "lines": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "position": 1,
      "description": "Coffee - Espresso",
      "quantity": "2.0000",
      "unitOfMeasure": "buc",
      "unitPrice": "12.61",
      "vatRate": "9.00",
      "vatCategoryCode": "S",
      "vatAmount": "2.27",
      "lineTotal": "25.22",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "productCode": "COF-ESP"
    },
    {
      "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
      "position": 2,
      "description": "Notebook A5",
      "quantity": "2.0000",
      "unitOfMeasure": "buc",
      "unitPrice": "41.18",
      "vatRate": "19.00",
      "vatCategoryCode": "S",
      "vatAmount": "15.65",
      "lineTotal": "82.36",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "productCode": "NOTE-A5"
    }
  ],
  "convertedInvoice": null,
  "issuedAt": "2026-02-18T10:15:00+00:00",
  "cancelledAt": null,
  "refundOf": null,
  "refundedBy": []
}
```

Dates and timestamps are ISO 8601 strings. Amounts are decimal strings. The response has no `createdAt` or `updatedAt`.

## Response Fields

### Core Information

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `number` | string | Receipt number. A draft carries a temporary number until it is issued |
| `status` | string | Current status (draft/issued/invoiced/cancelled) |
| `documentSeries` | object \| null | Series with `id`, `prefix` and `nextNumber` (a formatted string, for example `BON0043`) |
| `client` | object \| null | Linked client details (if associated) |
| `refundOf` | object \| null | `{id, number}` of the receipt this one refunds, when this receipt is a refund |
| `refundedBy` | array | `{id, number}` of the active (not cancelled) refunds of this receipt |

### Payment Information

| Field | Type | Description |
|-------|------|-------------|
| `paymentMethod` | string \| null | Payment method as stored (for example `cash`, `card`, `meal_ticket`, `mixed`, `other`) |
| `cashPayment` | string \| null | Amount paid in cash |
| `cardPayment` | string \| null | Amount paid by card |
| `otherPayment` | string \| null | Amount paid by other method (voucher, meal ticket, etc.) |

### Cash Register Information

| Field | Type | Description |
|-------|------|-------------|
| `cashRegisterName` | string \| null | User-defined label for the cash register |
| `fiscalNumber` | string \| null | Fiscal serial number of the cash register |
| `deviceSerial` | string \| null | Serial number of the fiscal device |

### Customer Information

| Field | Type | Description |
|-------|------|-------------|
| `customerName` | string \| null | Customer name (for B2B receipts) |
| `customerCif` | string \| null | Customer CIF/CUI (for B2B receipts) |

### Financial Information

| Field | Type | Description |
|-------|------|-------------|
| `currency` | string | Currency code (e.g., RON, EUR) |
| `subtotal` | string | Subtotal before VAT |
| `vatTotal` | string | Total VAT amount |
| `total` | string | Grand total including VAT |
| `discount` | string | Total of the line discounts |
| `exchangeRate` | string \| null | Exchange rate |
| `lines` | array | Array of line items |

### Dates and Status

| Field | Type | Description |
|-------|------|-------------|
| `issueDate` | string | Issue date |
| `issuedAt` | string \| null | Timestamp when issued |
| `cancelledAt` | string \| null | Timestamp when cancelled |
| `convertedInvoice` | object \| null | The invoice created from this receipt, when status is `invoiced`. The object carries no fields at the moment, so read the invoice id from the response of the convert call |

### Additional Information

| Field | Type | Description |
|-------|------|-------------|
| `notes` | string \| null | Public notes about the purchase |
| `mentions` | string \| null | Additional mentions |
| `internalNote` | string \| null | Internal note (not visible on printed receipt) |
| `projectReference` | string \| null | Project reference |
| `issuerName` | string \| null | Issuer name |
| `issuerId` | string \| null | Issuer identifier |
| `salesAgent` | string \| null | Sales agent |

### Line Item Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Line item unique identifier |
| `position` | integer | Sequential line number, starting at 1 |
| `description` | string | Item description |
| `quantity` | string | Quantity sold (decimal string) |
| `unitPrice` | string | Price per unit |
| `unitOfMeasure` | string | Unit of measure (default `buc`) |
| `vatRate` | string | VAT percentage, for example `"19.00"` |
| `vatCategoryCode` | string | UBL VAT category code |
| `vatIncluded` | boolean | Whether `unitPrice` includes VAT |
| `discount` | string | Line discount amount |
| `discountPercent` | string | Line discount percentage |
| `vatAmount` | string | Line VAT amount |
| `lineTotal` | string | Line total before VAT |
| `productCode` | string \| null | Product code |

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Receipt not found or not in your organization |

Error responses have the form `{"error": "message"}`.

## B2B Receipts and Client Linking

When a business customer purchases goods and needs a tax document, the receipt can be associated with a Client object in two ways:

1. **Via customerName / customerCif** — The customer's company data is recorded directly on the receipt without linking to an existing Client record
2. **Via clientId** — The receipt is linked to an existing Client object in the system, enabling conversion to a formal invoice

Both approaches are valid. Linking to a Client object is recommended if the receipt will be converted to an invoice, as it pre-fills all required client data.

## Conversion to Invoice

When the receipt is converted to an invoice:
- `status` changes to `invoiced`
- `convertedInvoice` is set
- Receipt lines and notes are copied to the new draft invoice
