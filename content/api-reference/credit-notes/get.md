---
title: Get Credit Note
description: Retrieve detailed information for a specific credit note including line items
method: GET
endpoint: /api/v1/invoices/{uuid}
---

# Get Credit Note

Retrieves complete details for a specific credit note, including all line items, client information, parent invoice reference, and calculated totals. Credit notes use the same endpoint as invoices since they are a special type of invoice.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the credit note to retrieve |

## Request

```bash {% title="cURL" %}
curl -X GET https://api.storno.ro/api/v1/invoices/850e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/invoices/850e8400-e29b-41d4-a716-446655440000', {
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
  "uuid": "850e8400-e29b-41d4-a716-446655440000",
  "number": "CN-2026-005",
  "direction": "outgoing",
  "isCreditNote": true,
  "seriesId": "750e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "750e8400-e29b-41d4-a716-446655440000",
    "name": "CN",
    "nextNumber": 6,
    "prefix": "CN-",
    "year": 2026
  },
  "clientId": "750e8400-e29b-41d4-a716-446655440000",
  "client": {
    "uuid": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "registrationNumber": "RO12345678",
    "address": "Str. Exemplu 123, București, Sector 1",
    "city": "București",
    "county": "București",
    "country": "RO",
    "postalCode": "010101",
    "email": "contact@client.ro",
    "phone": "+40721234567",
    "bankAccount": "RO49AAAA1B31007593840000",
    "bankName": "Banca Comercială Română"
  },
  "parentDocumentId": "650e8400-e29b-41d4-a716-446655440111",
  "parentDocument": {
    "uuid": "650e8400-e29b-41d4-a716-446655440111",
    "number": "FAC-2026-045",
    "issueDate": "2026-02-18",
    "dueDate": "2026-03-18",
    "currency": "RON",
    "subtotal": "7000.00",
    "vatAmount": "1330.00",
    "total": "8330.00",
    "status": "validated",
    "anafUploadIndex": 2026000230
  },
  "status": "validated",
  "anafStatus": "validated",
  "anafUploadIndex": 2026000234,
  "anafCif": 2026000234,
  "issueDate": "2026-02-20",
  "dueDate": "2026-03-20",
  "currency": "RON",
  "exchangeRate": 1.0,
  "invoiceTypeCode": "381",
  "notes": "Partial refund - hosting services cancelled by client request",
  "paymentTerms": "Immediate refund",
  "issuerName": "John Doe",
  "issuerId": "850e8400-e29b-41d4-a716-446655440000",
  "mentions": "Credit note for invoice FAC-2026-045",
  "internalNote": "Client cancelled annual hosting, refund via original payment method",
  "lines": [
    {
      "uuid": "910e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 1,
      "description": "Hosting Services - Annual (CREDIT)",
      "quantity": "-1.00",
      "unitPrice": "1200.00",
      "unitOfMeasure": "service",
      "productId": "460e8400-e29b-41d4-a716-446655440000",
      "product": {
        "uuid": "460e8400-e29b-41d4-a716-446655440000",
        "name": "Hosting Services",
        "code": "HOST-001",
        "unitOfMeasure": "service"
      },
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "uuid": "350e8400-e29b-41d4-a716-446655440000",
        "name": "Standard VAT",
        "percentage": "19.00"
      },
      "discount": "200.00",
      "discountPercent": "16.67",
      "vatIncluded": false,
      "subtotal": "-1000.00",
      "vatAmount": "-190.00",
      "total": "-1190.00"
    }
  ],
  "subtotal": "-1000.00",
  "totalDiscount": "200.00",
  "vatAmount": "-190.00",
  "total": "-1190.00",
  "xmlContent": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>...",
  "anafMessages": [],
  "createdAt": "2026-02-20T09:00:00Z",
  "updatedAt": "2026-02-20T10:15:00Z",
  "uploadedAt": "2026-02-20T09:30:00Z",
  "validatedAt": "2026-02-20T10:15:00Z"
}
```

## Response Fields

### Core Fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `number` | string | Credit note number |
| `isCreditNote` | boolean | Always `true` for credit notes |
| `direction` | string | Always `outgoing` for credit notes |
| `parentDocumentId` | string | UUID of the original invoice being credited |
| `parentDocument` | object | Complete details of the original invoice |

### Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Document status: `draft`, `uploaded`, `validated`, `error` |
| `anafStatus` | string | ANAF validation status |
| `anafUploadIndex` | integer \| null | ANAF upload index (CIF) |

### Financial Fields

| Field | Type | Description |
|-------|------|-------------|
| `subtotal` | string | **Negative** subtotal amount |
| `totalDiscount` | string | Discount amount (positive, reduces the credit) |
| `vatAmount` | string | **Negative** VAT amount |
| `total` | string | **Negative** total amount |
| `currency` | string | Currency code (must match parent invoice) |
| `exchangeRate` | number | Exchange rate |

### Line Items

| Field | Type | Description |
|-------|------|-------------|
| `lines` | array | Array of line items with negative amounts |
| `quantity` | string | **Negative** quantity or positive with negative unit price |
| `subtotal` | string | **Negative** line subtotal |
| `vatAmount` | string | **Negative** line VAT |
| `total` | string | **Negative** line total |

### Timestamps

| Field | Type | Description |
|-------|------|-------------|
| `createdAt` | string | When credit note was created |
| `uploadedAt` | string \| null | When uploaded to ANAF |
| `validatedAt` | string \| null | When ANAF validated it |
| `updatedAt` | string | Last update timestamp |

## Parent Document Reference

The `parentDocument` object contains key information from the original invoice:
- Original invoice number
- Original issue date
- Original amounts (positive)
- ANAF upload status

This allows you to:
- Display both documents side-by-side
- Validate the credit doesn't exceed the original
- Track total credited amount per invoice
- Generate reports on credits per invoice

## Credit Note Amounts

### Amount Sign Convention
All financial amounts in credit notes are **negative**:
```json
{
  "subtotal": "-1000.00",   // Negative
  "vatAmount": "-190.00",    // Negative
  "total": "-1190.00"        // Negative
}
```

### Line Item Amounts
Two ways to represent negative line amounts:

**Option 1: Negative quantity**
```json
{
  "quantity": "-1.00",
  "unitPrice": "1200.00",
  "total": "-1190.00"
}
```

**Option 2: Negative unit price**
```json
{
  "quantity": "1.00",
  "unitPrice": "-1200.00",
  "total": "-1190.00"
}
```

Both are valid; negative quantity is more common.

## Invoice Type Code

Credit notes typically use:
- **381** - Credit note (most common)
- **383** - Corrective invoice (for corrections)

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Credit note not found or doesn't belong to the company |
| 500 | `internal_error` | Server error occurred |

## Validation Rules

### Amount Validation
- Total credit amount should not exceed original invoice amount
- Multiple credit notes can reference the same parent invoice
- System tracks cumulative credited amount per invoice

### Date Validation
- Credit note `issueDate` should be after parent invoice `issueDate`
- Cannot create credit note for future-dated invoice
- Must be within fiscal period rules

### Currency Match
- Credit note currency must match parent invoice currency
- Exchange rate should match parent invoice (if applicable)

## Use Cases

### Full Credit
Credit entire original invoice:
```
Original Invoice: 8,330.00 RON
Credit Note:     -8,330.00 RON
Net Balance:          0.00 RON
```

### Partial Credit
Credit specific line items:
```
Original Invoice: 8,330.00 RON (2 items)
Credit Note:     -1,190.00 RON (1 item)
Net Balance:      7,140.00 RON
```

### Multiple Credits
Multiple partial credits on same invoice:
```
Original Invoice: 8,330.00 RON
Credit Note 1:   -1,190.00 RON
Credit Note 2:     -500.00 RON
Net Balance:      6,640.00 RON
```

## Best Practices

1. **Always link to parent** - Set `parentDocumentId` correctly
2. **Clear descriptions** - Explain what is being credited and why
3. **Match line items** - Use same product/description as original
4. **Check ANAF status** - Ensure parent invoice is validated first
5. **Notify client** - Send credit note with clear explanation
6. **Update accounting** - Sync to accounting system promptly
7. **Track totals** - Monitor total credited vs original amount
