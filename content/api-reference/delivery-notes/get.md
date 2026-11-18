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
  "id": "950e8400-e29b-41d4-a716-446655440000",
  "number": "DN0012",
  "documentSeries": {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "prefix": "DN",
    "nextNumber": "DN0013"
  },
  "client": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "type": "company",
    "name": "Client SRL",
    "cui": "12345678",
    "cnp": null,
    "registrationNumber": "J40/1234/2020",
    "address": "Str. Exemplu 123",
    "city": "București",
    "county": "București",
    "country": "RO",
    "postalCode": "010101",
    "email": "contact@client.ro",
    "phone": "+40721234567"
  },
  "status": "issued",
  "issueDate": "2026-02-18",
  "dueDate": "2026-03-18",
  "currency": "RON",
  "subtotal": "5000.00",
  "vatTotal": "1050.00",
  "total": "6050.00",
  "discount": "0.00",
  "deliveryLocation": "Client warehouse - Str. Depozit 5, București",
  "projectReference": "PROJECT-2026-002",
  "issuerName": "John Doe",
  "issuerId": null,
  "salesAgent": "Jane Smith",
  "deputyName": "Maria Ionescu",
  "deputyIdentityCard": "AB123456",
  "deputyAuto": "B-123-ABC",
  "notes": "Handle with care - fragile items",
  "mentions": null,
  "internalNote": "Priority client",
  "exchangeRate": null,
  "convertedInvoice": null,
  "issuedAt": "2026-02-18T14:30:00+00:00",
  "cancelledAt": null,
  "skipEtransport": false,
  "etransportOperationType": null,
  "etransportStatus": null,
  "etransportUit": null,
  "lines": [
    {
      "id": "a10e8400-e29b-41d4-a716-446655440000",
      "position": 1,
      "description": "Laptop Dell Latitude 7420",
      "quantity": "10.0000",
      "unitOfMeasure": "piece",
      "unitPrice": "450.00",
      "vatRate": "21.00",
      "vatCategoryCode": "S",
      "vatAmount": "945.00",
      "lineTotal": "4500.00",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "productCode": null,
      "tariffCode": null,
      "purposeCode": null,
      "unitOfMeasureCode": null,
      "netWeight": null,
      "grossWeight": null,
      "valueWithoutVat": null
    }
  ]
}
```

## Response Fields

### Core Information

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `number` | string | Delivery note number. Drafts carry a temporary `AVIZ-` number |
| `status` | string | Current status (draft/issued/converted/cancelled) |
| `documentSeries` | object \| null | Series: `id`, `prefix`, `nextNumber` (the next number as a string, e.g. `"DN0013"`) |
| `client` | object \| null | Client details: `id`, `type`, `name`, `cui`, `cnp`, `registrationNumber`, `address`, `city`, `county`, `country`, `postalCode`, `email`, `phone` |

### Delivery Information

| Field | Type | Description |
|-------|------|-------------|
| `deliveryLocation` | string | Full address where goods were delivered |
| `deputyName` | string | Name of person who received the delivery |
| `deputyIdentityCard` | string | ID card number of the deputy |
| `deputyAuto` | string | Vehicle registration number used for delivery |
| `issuerName` | string | Name of person who issued the delivery note |
| `issuerId` | string | Issuer identifier, stored as sent |
| `salesAgent` | string | Sales agent responsible for the delivery |

### Financial Information

| Field | Type | Description |
|-------|------|-------------|
| `currency` | string | Currency code (e.g., RON, EUR, USD) |
| `exchangeRate` | string \| null | Exchange rate, as sent |
| `subtotal` | string | Subtotal before VAT |
| `vatTotal` | string | Total VAT amount |
| `discount` | string | Total discount |
| `total` | string | Grand total including VAT |
| `lines` | array | Array of line items |

### Dates and Status

| Field | Type | Description |
|-------|------|-------------|
| `issueDate` | string | Date of issue (YYYY-MM-DD) |
| `dueDate` | string \| null | Due date for converting to invoice |
| `issuedAt` | string \| null | Timestamp when issued |
| `cancelledAt` | string \| null | Timestamp when cancelled |
| `convertedInvoice` | object \| null | Set when the delivery note was converted to an invoice. The object carries no fields; use the invoice returned by the convert call |

### Additional Information

| Field | Type | Description |
|-------|------|-------------|
| `projectReference` | string | Related project or order reference |
| `notes` | string | Public notes about the delivery |
| `mentions` | string | Additional mentions or instructions |
| `internalNote` | string | Internal note (not visible to client) |

### e-Transport fields

`skipEtransport`, `etransportOperationType`, `etransportPostIncident`, `etransportVehicleNumber`, `etransportTrailer1`, `etransportTrailer2`, `etransportTransporterCountry`, `etransportTransporterCode`, `etransportTransporterName`, `etransportTransportDate`, `etransportStartCounty`, `etransportStartLocality`, `etransportStartStreet`, `etransportStartNumber`, `etransportStartOtherInfo`, `etransportStartPostalCode`, the same fields with `End` instead of `Start`, `etransportUit`, `etransportStatus`, `etransportErrorMessage` and `etransportSubmittedAt`. They have the meaning described in [Create delivery note](/api-reference/delivery-notes/create#e-transport-fields).

### Line Item Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Line item unique identifier |
| `position` | integer | Sequential line number |
| `description` | string | Item description |
| `quantity` | string | Quantity delivered (decimal string) |
| `unitOfMeasure` | string | Unit of measure (e.g., piece, kg, hour) |
| `unitPrice` | string | Price per unit |
| `vatRate` | string | VAT percentage, e.g. `"21.00"` |
| `vatCategoryCode` | string | UBL VAT category code |
| `vatAmount` | string | Line VAT amount |
| `lineTotal` | string | Line total (excluding VAT) |
| `discount` | string | Line discount amount |
| `discountPercent` | string | Line discount percentage |
| `vatIncluded` | boolean | Whether `unitPrice` includes VAT |
| `productCode` | string \| null | Product code |
| `tariffCode`, `purposeCode`, `unitOfMeasureCode`, `netWeight`, `grossWeight`, `valueWithoutVat` | | e-Transport line fields |

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Delivery note not found or not in the caller's organization |

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
- `convertedInvoice` is set
- Delivery note data is copied to the invoice

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
