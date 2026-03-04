---
title: Create Delivery Note
description: Create a new delivery note to document delivery of goods or completion of services
method: POST
endpoint: /api/v1/delivery-notes
---

# Create Delivery Note

Creates a new delivery note in draft status. Delivery notes document the physical delivery of goods or completion of services, and can later be converted into invoices for payment.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clientId` | string | Yes | UUID of the client |
| `documentSeriesId` | string | No | UUID of the delivery note series. If not provided, the default `delivery_note` series for the company is auto-assigned |
| `issueDate` | string | Yes | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | Yes | Due date for invoicing (YYYY-MM-DD) |
| `currency` | string | Yes | Currency code (RON, EUR, USD, etc.) |
| `exchangeRate` | number | No | Exchange rate (defaults to 1.0 for RON) |
| `deliveryLocation` | string | No | Full address where goods delivered |
| `projectReference` | string | No | Related project or order reference |
| `issuerName` | string | No | Name of person issuing the delivery note |
| `issuerId` | string | No | UUID of the issuer user |
| `salesAgent` | string | No | Sales agent name |
| `deputyName` | string | No | Name of person receiving the delivery |
| `deputyIdentityCard` | string | No | ID card number of deputy |
| `deputyAuto` | string | No | Vehicle registration number |
| `notes` | string | No | Public notes about the delivery |
| `mentions` | string | No | Additional mentions or instructions |
| `internalNote` | string | No | Internal note (not visible to client) |
| `lines` | array | Yes | Array of line items (minimum 1 item) |

### e-Transport Fields

These fields are required for ANAF e-Transport submission. They can be set at creation time or updated later before submission.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `etransportOperationType` | number | No | Operation type: `10` (intra-EU acquisition), `12` (intra-EU delivery), `20` (domestic transaction), `30` (TTN — domestic transport document), `40` (import), `50` (export), `60` (goods not released for circulation) |
| `etransportPostIncident` | boolean | No | Post-incident declaration (after the transport was completed) |
| `etransportVehicleNumber` | string | No | Vehicle registration number (3-20 uppercase alphanumeric chars per BR-031, e.g., `"BC01ABC"`) |
| `etransportTrailer1` | string | No | First trailer registration number |
| `etransportTrailer2` | string | No | Second trailer registration number |
| `etransportTransporterCountry` | string | No | Transporter country code (ISO 3166-1 alpha-2). Must be `"RO"` for TTN (opType 30) per BR-005 |
| `etransportTransporterCode` | string | No | Transporter CUI/CIF (numeric only, e.g., `"31385365"`). Must match ANAF format per BR-002 |
| `etransportTransporterName` | string | No | Transporter legal name |
| `etransportTransportDate` | string | No | Transport start date (YYYY-MM-DD) |
| `etransportStartCounty` | number | No | Start county code (1-52 per ANAF nomenclature, e.g., `4`=Bacau, `40`=Bucuresti). Required per BR-210 |
| `etransportStartLocality` | string | No | Start locality name (2-100 chars per BR-214) |
| `etransportStartStreet` | string | No | Start street name (2-100 chars per BR-215) |
| `etransportStartNumber` | string | No | Start street number |
| `etransportStartOtherInfo` | string | No | Start additional address info |
| `etransportStartPostalCode` | string | No | Start postal code |
| `etransportEndCounty` | number | No | End county code (1-52). Required per BR-211 |
| `etransportEndLocality` | string | No | End locality name (2-100 chars) |
| `etransportEndStreet` | string | No | End street name (2-100 chars) |
| `etransportEndNumber` | string | No | End street number |
| `etransportEndOtherInfo` | string | No | End additional address info |
| `etransportEndPostalCode` | string | No | End postal code |

### Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Item description |
| `quantity` | number | Yes | Quantity delivered (must be > 0) |
| `unitPrice` | number | Yes | Price per unit |
| `vatRateId` | string | Yes | UUID of the VAT rate |
| `unitOfMeasure` | string | No | Unit of measure (e.g., piece, kg, hour) |
| `productId` | string | No | UUID of related product |
| `tariffCode` | string | No | 8-digit HS/CN tariff code (e.g., `"84131100"`). Required for e-Transport per BR-206 |
| `purposeCode` | number | No | Purpose code. For TTN (opType 30): `101` (commercial), `704`, `705`, `9901` (other) per BR-070 |
| `unitOfMeasureCode` | string | No | UN/ECE Rec 20 unit code (e.g., `"H87"`=piece, `"KGM"`=kg, `"SET"`=set, `"MTR"`=meter) |
| `netWeight` | string | No | Net weight in kg as decimal (e.g., `"120.00"`). Required for e-Transport per BR-207 |
| `grossWeight` | string | No | Gross weight in kg as decimal (e.g., `"140.00"`) |
| `valueWithoutVat` | string | No | Line value without VAT as decimal (e.g., `"15000.00"`). Required for e-Transport per BR-208 |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/delivery-notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "750e8400-e29b-41d4-a716-446655440000",
    "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-18",
    "dueDate": "2026-03-18",
    "currency": "RON",
    "exchangeRate": 1.0,
    "deliveryLocation": "Client warehouse - Str. Depozit 5, București, Sector 2",
    "projectReference": "PROJECT-2026-002",
    "issuerName": "John Doe",
    "salesAgent": "Jane Smith",
    "deputyName": "Maria Ionescu",
    "deputyIdentityCard": "AB123456",
    "deputyAuto": "B-123-ABC",
    "notes": "Handle with care - fragile items",
    "mentions": "Special delivery instructions: Use loading dock B",
    "internalNote": "Priority client - ensure careful handling",
    "lines": [
      {
        "description": "Laptop Dell Latitude 7420",
        "quantity": 10,
        "unitPrice": 450,
        "unitOfMeasure": "piece",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "productId": "B50e8400-e29b-41d4-a716-446655440000"
      },
      {
        "description": "Wireless Mouse Logitech MX Master 3",
        "quantity": 10,
        "unitPrice": 50,
        "unitOfMeasure": "piece",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "productId": "B60e8400-e29b-41d4-a716-446655440000"
      }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientId: '750e8400-e29b-41d4-a716-446655440000',
    documentSeriesId: '850e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-18',
    dueDate: '2026-03-18',
    currency: 'RON',
    exchangeRate: 1.0,
    deliveryLocation: 'Client warehouse - Str. Depozit 5, București, Sector 2',
    projectReference: 'PROJECT-2026-002',
    issuerName: 'John Doe',
    salesAgent: 'Jane Smith',
    deputyName: 'Maria Ionescu',
    deputyIdentityCard: 'AB123456',
    deputyAuto: 'B-123-ABC',
    notes: 'Handle with care - fragile items',
    mentions: 'Special delivery instructions: Use loading dock B',
    internalNote: 'Priority client - ensure careful handling',
    lines: [
      {
        description: 'Laptop Dell Latitude 7420',
        quantity: 10,
        unitPrice: 450,
        unitOfMeasure: 'piece',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        productId: 'B50e8400-e29b-41d4-a716-446655440000'
      },
      {
        description: 'Wireless Mouse Logitech MX Master 3',
        quantity: 10,
        unitPrice: 50,
        unitOfMeasure: 'piece',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000',
        productId: 'B60e8400-e29b-41d4-a716-446655440000'
      }
    ]
  })
});

const data = await response.json();
```

## Response

```json
{
  "uuid": "950e8400-e29b-41d4-a716-446655440000",
  "number": "DN-2026-012",
  "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
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
    "address": "Str. Exemplu 123, București",
    "email": "contact@client.ro"
  },
  "status": "draft",
  "issueDate": "2026-02-18",
  "dueDate": "2026-03-18",
  "currency": "RON",
  "exchangeRate": 1.0,
  "deliveryLocation": "Client warehouse - Str. Depozit 5, București, Sector 2",
  "projectReference": "PROJECT-2026-002",
  "issuerName": "John Doe",
  "salesAgent": "Jane Smith",
  "deputyName": "Maria Ionescu",
  "deputyIdentityCard": "AB123456",
  "deputyAuto": "B-123-ABC",
  "notes": "Handle with care - fragile items",
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
  "issuedAt": null,
  "convertedAt": null,
  "convertedInvoiceId": null,
  "cancelledAt": null,
  "createdAt": "2026-02-18T09:00:00Z",
  "updatedAt": "2026-02-18T09:00:00Z"
}
```

## Validation Rules

### Dates
- `issueDate` must be a valid date in YYYY-MM-DD format
- `issueDate` should not be in the future
- `dueDate` must be equal to or after `issueDate`

### Currency
- Must be a valid 3-letter currency code (ISO 4217)
- `exchangeRate` must be greater than 0
- For RON (base currency), `exchangeRate` defaults to 1.0

### Line Items
- Minimum 1 line item required
- `quantity` must be greater than 0
- `unitPrice` must be greater than or equal to 0
- `vatRateId` must reference an existing VAT rate
- If `productId` is provided, it must reference an existing product

### References
- `clientId` must reference an existing client
- If `documentSeriesId` is provided, it must reference an existing series configured for `delivery_note` type; if omitted, the company's default `delivery_note` series is auto-assigned
- If `issuerId` is provided, it must reference an existing user

### Deputy Information
- Optional but recommended for proof of delivery
- `deputyIdentityCard` should be valid ID format
- `deputyAuto` should be valid vehicle registration format

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request body structure |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Referenced entity not found (client, series, VAT rate, product, user) |
| 422 | `validation_error` | Validation failed (see error details for specific field errors) |
| 500 | `internal_error` | Server error occurred |

## Example Validation Error Response

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "clientId": ["Client not found"],
      "lines.0.quantity": ["Quantity must be greater than 0"],
      "lines.1.vatRateId": ["VAT rate not found"],
      "dueDate": ["Due date must be after issue date"]
    }
  }
}
```

## Common Scenarios

### Physical Goods Delivery
```javascript
{
  deliveryLocation: "Client warehouse - Str. Depozit 5",
  deputyName: "Maria Ionescu",
  deputyIdentityCard: "AB123456",
  deputyAuto: "B-123-ABC",
  notes: "Delivery completed, all items verified",
  lines: [
    { description: "Product A", quantity: 50, unitPrice: 10, ... }
  ]
}
```

### Service Completion
```javascript
{
  deliveryLocation: "Client office - Str. Birouri 10",
  deputyName: "John Manager",
  notes: "IT support services completed successfully",
  lines: [
    { description: "IT Support - 8 hours", quantity: 8, unitPrice: 75, ... }
  ]
}
```

### Batch Delivery (Multiple Items)
```javascript
{
  deliveryLocation: "Construction site - Bd. Constructorilor 50",
  deputyName: "Site Manager",
  deputyAuto: "B-TRUCK-123",
  lines: [
    { description: "Cement bags", quantity: 100, unitPrice: 25, ... },
    { description: "Steel bars", quantity: 50, unitPrice: 120, ... },
    { description: "Paint buckets", quantity: 20, unitPrice: 45, ... }
  ]
}
```

### e-Transport Ready (TTN Domestic)
```javascript
{
  clientId: "750e8400...",
  issueDate: "2026-03-04",
  dueDate: "2026-04-04",
  currency: "RON",
  deliveryLocation: "Depozit Bacau, Str. Industriei 15",
  deputyName: "Vasile Popescu",
  deputyIdentityCard: "BC123456",
  deputyAuto: "BC01ABC",
  // e-Transport header
  etransportOperationType: 30,
  etransportVehicleNumber: "BC01ABC",
  etransportTransporterCountry: "RO",
  etransportTransporterCode: "31385365",
  etransportTransporterName: "UNIVERSAL EQUIPMENT PROJECTS SRL",
  etransportTransportDate: "2026-03-04",
  // Route start
  etransportStartCounty: 4,
  etransportStartLocality: "Bacau",
  etransportStartStreet: "Str. Nicolae Balcescu 5 B",
  etransportStartNumber: "5B",
  etransportStartPostalCode: "600001",
  // Route end
  etransportEndCounty: 40,
  etransportEndLocality: "SECTOR6",
  etransportEndStreet: "Sos. Virtutii 148",
  etransportEndNumber: "148",
  etransportEndPostalCode: "060784",
  lines: [
    {
      description: "Echipament hidraulic EH-200",
      quantity: 2, unitPrice: 15000,
      vatRateId: "...",
      tariffCode: "84131100",
      purposeCode: 101,
      unitOfMeasureCode: "H87",
      netWeight: "240.00",
      grossWeight: "280.00",
      valueWithoutVat: "30000.00"
    }
  ]
}
```

### International Delivery
```javascript
{
  deliveryLocation: "Budapest warehouse - Warehouse District 15",
  currency: "EUR",
  exchangeRate: 4.97,
  deputyName: "Import Manager",
  deputyIdentityCard: "HU-12345678",
  deputyAuto: "HU-AB-1234",
  mentions: "Customs clearance completed",
  lines: [
    { description: "Equipment Model X", quantity: 5, unitPrice: 2000, ... }
  ]
}
```

## Best Practices

1. **Create at delivery time** - Issue delivery note when delivery occurs, not before
2. **Complete deputy info** - Always capture who received the delivery
3. **Specific locations** - Use exact delivery address, not just client's billing address
4. **Clear descriptions** - Detailed line item descriptions for verification
5. **Link to orders** - Use `projectReference` to link to purchase orders
6. **Track vehicles** - Record `deputyAuto` for logistics tracking
7. **Prompt issuing** - Mark as issued immediately after delivery
8. **Convert timely** - Don't delay invoicing after successful delivery
9. **Photo evidence** - Keep photos of signed physical delivery notes
10. **Internal notes** - Use `internalNote` for logistics or special handling notes

## Delivery Note vs Proforma vs Invoice

### Delivery Note
- **Purpose:** Document physical delivery or service completion
- **Timing:** Created at delivery time
- **Legal status:** Proof of delivery, not a payment request
- **Next step:** Convert to invoice for payment

### Proforma Invoice
- **Purpose:** Quote or offer before delivery
- **Timing:** Created before delivery
- **Legal status:** Not legally binding
- **Next step:** Convert to invoice after acceptance

### Invoice
- **Purpose:** Request payment for delivered goods/services
- **Timing:** Created after delivery (or from delivery note)
- **Legal status:** Legally binding payment request
- **Next step:** Upload to ANAF, send to client

## Next Steps

After creating a delivery note:
1. Mark as issued when delivery occurs (`POST /api/v1/delivery-notes/{uuid}/issue`)
2. Get client signature on physical copy
3. Convert to invoice when ready to bill (`POST /api/v1/delivery-notes/{uuid}/convert`)
4. Upload invoice to ANAF
5. Send invoice to client for payment
