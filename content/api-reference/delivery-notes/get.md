---
title: Get Delivery Note
description: Retrieve detailed information for a specific delivery note including line items
method: GET
endpoint: /api/v1/delivery-notes/{uuid}
---

# Get Delivery Note

Retrieves complete details for a specific delivery note, including all line items, client information, delivery details, and calculated totals.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note to retrieve |

## Request

```bash {% title="cURL" %}
curl -X GET https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000', {
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
  "uuid": "950e8400-e29b-41d4-a716-446655440000",
  "number": "DN-2026-012",
  "seriesId": "850e8400-e29b-41d4-a716-446655440000",
  "series": {
    "uuid": "850e8400-e29b-41d4-a716-446655440000",
    "name": "DN",
    "nextNumber": 13,
    "prefix": "DN-",
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
  "status": "issued",
  "issueDate": "2026-02-18",
  "dueDate": "2026-03-18",
  "currency": "RON",
  "exchangeRate": 1.0,
  "deliveryLocation": "Client warehouse - Str. Depozit 5, București, Sector 2",
  "projectReference": "PROJECT-2026-002",
  "issuerName": "John Doe",
  "issuerId": "850e8400-e29b-41d4-a716-446655440000",
  "salesAgent": "Jane Smith",
  "deputyName": "Maria Ionescu",
  "deputyIdentityCard": "AB123456",
  "deputyAuto": "B-123-ABC",
  "notes": "Handle with care - fragile items. Delivery completed successfully.",
  "mentions": "Special delivery instructions: Use loading dock B",
  "internalNote": "Priority client - ensure careful handling",
  "lines": [
    {
      "uuid": "A10e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 1,
      "description": "Laptop Dell Latitude 7420",
      "quantity": "10.00",
      "unitPrice": "450.00",
      "unitOfMeasure": "piece",
      "productId": "B50e8400-e29b-41d4-a716-446655440000",
      "product": {
        "uuid": "B50e8400-e29b-41d4-a716-446655440000",
        "name": "Laptop Dell Latitude 7420",
        "code": "LAP-DELL-7420",
        "unitOfMeasure": "piece"
      },
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "uuid": "350e8400-e29b-41d4-a716-446655440000",
        "name": "Standard VAT",
        "percentage": "19.00"
      },
      "subtotal": "4500.00",
      "vatAmount": "855.00",
      "total": "5355.00"
    },
    {
      "uuid": "A20e8400-e29b-41d4-a716-446655440000",
      "lineNumber": 2,
      "description": "Wireless Mouse Logitech MX Master 3",
      "quantity": "10.00",
      "unitPrice": "50.00",
      "unitOfMeasure": "piece",
      "productId": "B60e8400-e29b-41d4-a716-446655440000",
      "product": {
        "uuid": "B60e8400-e29b-41d4-a716-446655440000",
        "name": "Wireless Mouse Logitech MX Master 3",
        "code": "MOUSE-LOG-MX3",
        "unitOfMeasure": "piece"
      },
      "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
      "vatRate": {
        "uuid": "350e8400-e29b-41d4-a716-446655440000",
        "name": "Standard VAT",
        "percentage": "19.00"
      },
      "subtotal": "500.00",
      "vatAmount": "95.00",
      "total": "595.00"
    }
  ],
  "subtotal": "5000.00",
  "vatAmount": "950.00",
  "total": "5950.00",
  "issuedAt": "2026-02-18T14:30:00Z",
  "convertedAt": null,
  "convertedInvoiceId": null,
  "convertedInvoiceNumber": null,
  "cancelledAt": null,
  "createdAt": "2026-02-18T09:00:00Z",
  "updatedAt": "2026-02-18T14:30:00Z"
}
```

## Response Fields

### Core Information

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `number` | string | Delivery note number |
| `status` | string | Current status (draft/issued/converted/cancelled) |
| `series` | object | Series information with prefix and year |
| `client` | object | Complete client details including banking information |

### Delivery Information

| Field | Type | Description |
|-------|------|-------------|
| `deliveryLocation` | string | Full address where goods were delivered |
| `deputyName` | string | Name of person who received the delivery |
| `deputyIdentityCard` | string | ID card number of the deputy |
| `deputyAuto` | string | Vehicle registration number used for delivery |
| `issuerName` | string | Name of person who issued the delivery note |
| `issuerId` | string | UUID of the issuer user |
| `salesAgent` | string | Sales agent responsible for the delivery |

### Financial Information

| Field | Type | Description |
|-------|------|-------------|
| `currency` | string | Currency code (e.g., RON, EUR, USD) |
| `exchangeRate` | number | Exchange rate to base currency |
| `subtotal` | string | Subtotal before VAT |
| `vatAmount` | string | Total VAT amount |
| `total` | string | Grand total including VAT |
| `lines` | array | Array of line items with products and pricing |

### Dates and Status

| Field | Type | Description |
|-------|------|-------------|
| `issueDate` | string | Date when delivery note was created |
| `dueDate` | string | Due date for converting to invoice |
| `issuedAt` | string \| null | Timestamp when issued |
| `convertedAt` | string \| null | Timestamp when converted to invoice |
| `cancelledAt` | string \| null | Timestamp when cancelled |
| `convertedInvoiceId` | string \| null | UUID of created invoice (if converted) |
| `convertedInvoiceNumber` | string \| null | Number of created invoice (if converted) |

### Additional Information

| Field | Type | Description |
|-------|------|-------------|
| `projectReference` | string | Related project or order reference |
| `notes` | string | Public notes about the delivery |
| `mentions` | string | Additional mentions or instructions |
| `internalNote` | string | Internal note (not visible to client) |

### Line Item Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Line item unique identifier |
| `lineNumber` | integer | Sequential line number |
| `description` | string | Item description |
| `quantity` | string | Quantity delivered (decimal string) |
| `unitPrice` | string | Price per unit |
| `unitOfMeasure` | string | Unit of measure (e.g., piece, kg, hour) |
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
| 404 | `not_found` | Delivery note not found or doesn't belong to the company |
| 500 | `internal_error` | Server error occurred |

## Deputy Information

### Why Deputy Details Matter
Deputy information serves as proof of delivery:
- **deputyName** - Who physically received the goods/services
- **deputyIdentityCard** - Legal identification for verification
- **deputyAuto** - Vehicle used (for transport companies or logistics)

This information is especially important for:
- Legal proof of delivery
- Customs documentation
- Transport documentation (CMR)
- Dispute resolution
- Insurance claims

### When Deputy Info is Required
- Physical goods delivery
- High-value items
- Cross-border shipments
- Regulated industries
- Client request

### When Deputy Info is Optional
- Digital services
- Remote services
- Small-value deliveries
- Trusted client relationships

## Delivery Location vs Client Address

The `deliveryLocation` field can differ from the client's registered address:
- **Client address** - Legal/billing address
- **Delivery location** - Physical delivery point (warehouse, job site, etc.)

Always use the specific delivery location for:
- Accurate logistics
- Client verification
- Future deliveries reference
- Customs documentation

## Conversion to Invoice

When the delivery note is converted to an invoice:
- `status` changes to `converted`
- `convertedAt` is set to the conversion timestamp
- `convertedInvoiceId` contains the new invoice UUID
- `convertedInvoiceNumber` contains the new invoice number
- Delivery note data is copied to the invoice
- Delivery note reference is added to invoice

## Use Cases

### Standard Goods Delivery
```
1. Issue delivery note upon shipment
2. Client receives and deputy signs
3. Convert to invoice after verification
```

### Service Completion
```
1. Create delivery note when service complete
2. Record completion location and verifier
3. Convert to invoice for payment
```

### Batch Deliveries
```
1. Multiple delivery notes throughout month
2. Client accumulates deliveries
3. Convert all at month-end to single invoice
```

### International Shipments
```
1. Delivery note with full deputy details
2. Used for customs clearance
3. Convert after successful delivery
```

## Best Practices

1. **Complete deputy information** - Always capture for proof of delivery
2. **Accurate locations** - Use specific delivery addresses, not just client address
3. **Prompt updates** - Mark as issued when delivery occurs
4. **Photo evidence** - Keep photos of signed delivery notes
5. **Vehicle tracking** - Record vehicle registration for logistics
6. **Convert regularly** - Don't delay invoicing after delivery
7. **Link to orders** - Use projectReference to link to purchase orders
8. **Clear descriptions** - Detailed line item descriptions for verification
