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
| `X-Company` | string | Yes | Company UUID to scope the request |

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
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "number": "BON-2026-042",
  "seriesId": "850e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "850e8400-e29b-41d4-a716-446655440000",
    "name": "BON",
    "nextNumber": 43,
    "prefix": "BON-",
    "year": 2026
  },
  "status": "issued",
  "issueDate": "2026-02-18",
  "currency": "RON",
  "subtotal": "210.92",
  "vatAmount": "40.08",
  "total": "251.00",
  "paymentMethod": "mixed",
  "cashPayment": "100.00",
  "cardPayment": "151.00",
  "otherPayment": "0.00",
  "cashRegisterName": "Casa 1 - Front Desk",
  "fiscalNumber": "AAAA123456",
  "customerName": "Acme SRL",
  "customerCif": "RO12345678",
  "clientId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "client": {
    "uuid": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Acme SRL",
    "registrationNumber": "RO12345678",
    "address": "Strada Principala, nr. 10",
    "city": "Cluj-Napoca",
    "county": "Cluj",
    "country": "RO",
    "postalCode": "400000",
    "email": "office@acme.ro",
    "phone": "+40721234567"
  },
  "notes": "Thank you for your purchase!",
  "internalNote": "Loyalty card customer",
  "lines": [
    {
      "uuid": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "lineNumber": 1,
      "description": "Coffee - Espresso",
      "quantity": "2.00",
      "unitPrice": "12.61",
      "unitOfMeasure": "pcs",
      "productId": "d4e5f6a7-b8c9-0123-defa-234567890123",
      "product": {
        "uuid": "d4e5f6a7-b8c9-0123-defa-234567890123",
        "name": "Coffee - Espresso",
        "code": "COF-ESP",
        "unitOfMeasure": "pcs"
      },
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "uuid": "350e8400-e29b-41d4-a716-446655440000",
        "name": "VAT 9%",
        "percentage": "9.00"
      },
      "subtotal": "25.22",
      "vatAmount": "2.27",
      "total": "27.49"
    },
    {
      "uuid": "e5f6a7b8-c9d0-1234-efab-345678901234",
      "lineNumber": 2,
      "description": "Notebook A5",
      "quantity": "2.00",
      "unitPrice": "41.18",
      "unitOfMeasure": "pcs",
      "productId": "f6a7b8c9-d0e1-2345-fabc-456789012345",
      "product": {
        "uuid": "f6a7b8c9-d0e1-2345-fabc-456789012345",
        "name": "Notebook A5",
        "code": "NOTE-A5",
        "unitOfMeasure": "pcs"
      },
      "vatRateId": "360e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "uuid": "360e8400-e29b-41d4-a716-446655440000",
        "name": "Standard VAT",
        "percentage": "19.00"
      },
      "subtotal": "82.36",
      "vatAmount": "15.65",
      "total": "98.01"
    }
  ],
  "convertedInvoiceId": null,
  "convertedInvoiceNumber": null,
  "issuedAt": "2026-02-18T10:15:00Z",
  "cancelledAt": null,
  "createdAt": "2026-02-18T10:14:00Z",
  "updatedAt": "2026-02-18T10:15:00Z"
}
```

## Response Fields

### Core Information

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `number` | string | Receipt number |
| `status` | string | Current status (draft/issued/invoiced/cancelled) |
| `series` | object | Series information with prefix and year |
| `client` | object \| null | Linked client details (if associated) |

### Payment Information

| Field | Type | Description |
|-------|------|-------------|
| `paymentMethod` | string | Overall payment method: `cash`, `card`, `mixed`, `other` |
| `cashPayment` | string | Amount paid in cash |
| `cardPayment` | string | Amount paid by card |
| `otherPayment` | string | Amount paid by other method (voucher, meal ticket, etc.) |

### Cash Register Information

| Field | Type | Description |
|-------|------|-------------|
| `cashRegisterName` | string | User-defined label for the cash register |
| `fiscalNumber` | string | Official fiscal serial number from ANAF registration |

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
| `vatAmount` | string | Total VAT amount |
| `total` | string | Grand total including VAT |
| `lines` | array | Array of line items with products and pricing |

### Dates and Status

| Field | Type | Description |
|-------|------|-------------|
| `issueDate` | string | Date when receipt was issued |
| `issuedAt` | string \| null | Timestamp when issued |
| `cancelledAt` | string \| null | Timestamp when cancelled |
| `convertedInvoiceId` | string \| null | UUID of created invoice (if invoiced) |
| `convertedInvoiceNumber` | string \| null | Number of created invoice (if invoiced) |

### Additional Information

| Field | Type | Description |
|-------|------|-------------|
| `notes` | string \| null | Public notes about the purchase |
| `internalNote` | string \| null | Internal note (not visible on printed receipt) |

### Line Item Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Line item unique identifier |
| `lineNumber` | integer | Sequential line number |
| `description` | string | Item description |
| `quantity` | string | Quantity sold (decimal string) |
| `unitPrice` | string | Price per unit (excluding VAT) |
| `unitOfMeasure` | string | Unit of measure (e.g., pcs, kg, l) |
| `product` | object \| null | Related product details |
| `vatRate` | object | VAT rate details with percentage |
| `subtotal` | string | Line subtotal (before VAT) |
| `vatAmount` | string | Line VAT amount |
| `total` | string | Line total (including VAT) |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Receipt not found or doesn't belong to the company |
| 500 | `internal_error` | Server error occurred |

## B2B Receipts and Client Linking

When a business customer purchases goods and needs a tax document, the receipt can be associated with a Client object in two ways:

1. **Via customerName / customerCif** — The customer's company data is recorded directly on the receipt without linking to an existing Client record
2. **Via clientId** — The receipt is linked to an existing Client object in the system, enabling conversion to a formal invoice

Both approaches are valid. Linking to a Client object is recommended if the receipt will be converted to an invoice, as it pre-fills all required client data.

## Conversion to Invoice

When the receipt is converted to an invoice:
- `status` changes to `invoiced`
- `convertedInvoiceId` is set to the new invoice UUID
- `convertedInvoiceNumber` is set to the new invoice number
- Receipt data is copied to the invoice
- Receipt reference is added to the invoice notes
