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
| `X-Company` | string | No | Company UUID to scope the request. Can be omitted when the organization has exactly one company; the `company` query parameter is accepted too |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clientId` | string | No | UUID of a client of the company |
| `documentSeriesId` | string | No | UUID of the delivery note series. If not provided, the default `delivery_note` series for the company is auto-assigned |
| `issueDate` | string | No | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | No | Due date for invoicing (YYYY-MM-DD) |
| `currency` | string | No | Currency code (RON, EUR, USD, etc.). Defaults to the company currency |
| `exchangeRate` | number | No | Exchange rate, stored as sent |
| `deliveryLocation` | string | No | Full address where goods delivered |
| `projectReference` | string | No | Related project or order reference |
| `issuerName` | string | No | Name of person issuing the delivery note |
| `issuerId` | string | No | Identifier of the issuer, stored as sent |
| `salesAgent` | string | No | Sales agent name |
| `deputyName` | string | No | Name of person receiving the delivery |
| `deputyIdentityCard` | string | No | ID card number of deputy |
| `deputyAuto` | string | No | Vehicle registration number |
| `notes` | string | No | Public notes about the delivery |
| `mentions` | string | No | Additional mentions or instructions |
| `internalNote` | string | No | Internal note (not visible to client) |
| `lines` | array | Yes | Array of line items (minimum 1 item) |
| `skipEtransport` | boolean | No | Exclude the delivery note from e-Transport |

### e-Transport Fields

These fields are required for ANAF e-Transport submission. They can be set at creation time or updated later before submission.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `etransportOperationType` | number | No | Operation type: `10` (intra-EU acquisition), `12` (intra-EU delivery), `20` (domestic transaction), `30` (TTN — domestic transport document), `40` (import), `50` (export), `60` (goods not released for circulation) |
| `etransportPostIncident` | string | No | Post-incident declaration, one character. `"D"` marks a declaration made after the transport; any other value is treated as not post-incident |
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
| `vatRate` | number | No | VAT rate percentage. Default 21.00 when neither `vatRate` nor `vatRateId` is sent, whatever the VAT status of the company |
| `vatCategoryCode` | string | No | UBL VAT category code (default `S`; a 0% rate becomes `Z` on its own) |
| `vatRateId` | string | No | Id of one of the company's VAT rates (`GET /api/v1/vat-rates`). The line takes its percentage and category. Ignored when `vatRate` is sent; an error when it is not a rate of the company |
| `unitOfMeasure` | string | No | Unit of measure (e.g., piece, kg, hour) |
| `productCode` | string | No | Product code printed on the line |
| `tariffCode` | string | No | 8-digit HS/CN tariff code (e.g., `"84131100"`). Required for e-Transport per BR-206 |
| `purposeCode` | number | No | Purpose code. For TTN (opType 30): `101` (commercial), `704`, `705`, `9901` (other) per BR-070 |
| `unitOfMeasureCode` | string | No | UN/ECE Rec 20 unit code (e.g., `"H87"`=piece, `"KGM"`=kg, `"SET"`=set, `"MTR"`=meter) |
| `netWeight` | string | No | Net weight in kg as decimal (e.g., `"120.00"`). Required for e-Transport per BR-207 |
| `grossWeight` | string | No | Gross weight in kg as decimal (e.g., `"140.00"`) |
| `valueWithoutVat` | string | No | Line value without VAT as decimal (e.g., `"15000.00"`). Required for e-Transport per BR-208 |

> **VAT on a line.** Send `vatRate` (a percentage) or `vatRateId` (the id of one of the company's rates from `GET /api/v1/vat-rates`; the line takes that rate's percentage and category). When both are sent `vatRate` wins. When neither is sent the line gets **21%**, also when the issuing company is not a VAT payer. For a company that is not a VAT payer send `vatRate: "0.00"` on every line. A `vatRateId` that is not a rate of the company is refused with an error; it never falls back to 21%.

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
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000"
      },
      {
        "description": "Wireless Mouse Logitech MX Master 3",
        "quantity": 10,
        "unitPrice": 50,
        "unitOfMeasure": "piece",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000"
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
        vatRateId: '350e8400-e29b-41d4-a716-446655440000'
      },
      {
        description: 'Wireless Mouse Logitech MX Master 3',
        quantity: 10,
        unitPrice: 50,
        unitOfMeasure: 'piece',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000'
      }
    ]
  })
});

const data = await response.json();
```

## Response

Returns `201 Created` with the delivery note and the e-Transport validation result:

```json
{
  "deliveryNote": {
    "id": "950e8400-e29b-41d4-a716-446655440000",
    "number": "AVIZ-0194f3a2",
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
    "status": "draft",
    "issueDate": "2026-02-18",
    "dueDate": "2026-03-18",
    "currency": "RON",
    "subtotal": "5000.00",
    "vatTotal": "1050.00",
    "total": "6050.00",
    "discount": "0.00",
    "notes": "Handle with care - fragile items",
    "mentions": "Special delivery instructions: Use loading dock B",
    "internalNote": "Priority client - ensure careful handling",
    "deliveryLocation": "Client warehouse - Str. Depozit 5, București, Sector 2",
    "projectReference": "PROJECT-2026-002",
    "issuerName": "John Doe",
    "issuerId": null,
    "salesAgent": "Jane Smith",
    "deputyName": "Maria Ionescu",
    "deputyIdentityCard": "AB123456",
    "deputyAuto": "B-123-ABC",
    "exchangeRate": "1.0",
    "convertedInvoice": null,
    "issuedAt": null,
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
        "quantity": "10",
        "unitOfMeasure": "piece",
        "unitPrice": "450",
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
  },
  "validation": null
}
```

The e-Transport fields (`etransport*`) are also part of the object, null until set. `convertedInvoice` is `null` until the delivery note is converted, then an object without fields; read the invoice id from the response of the convert call.

`validation` is `null` when `skipEtransport` is true or `etransportOperationType` is not set. Otherwise it is `{ "valid": boolean, "errors": [...], "warnings": [...], "schematronAvailable": boolean }` (the e-Transport checks of the entity, the XML schema and the Schematron rules). The delivery note is created whatever the result.

A draft carries a temporary number (`AVIZ-` followed by a random string). The final number, the series prefix followed by the counter padded to at least four digits, is assigned when the delivery note is [issued](/api-reference/delivery-notes/issue).

## Validation Rules

- `lines` must be a non-empty array. Each line needs a non-empty `description`, a `quantity` greater than 0 and a `unitPrice` of 0 or more.
- `clientId`, if sent, must be a client of the company.
- `documentSeriesId`, if sent, must be a series of the company; otherwise the default `delivery_note` series is used. A series of another company is ignored.
- `vatRateId`, if sent without `vatRate`, must be a VAT rate of the company.
- Nothing else is validated at creation: dates, currency, exchange rate and the e-Transport fields are stored as sent. The e-Transport checks run in `validation`, and again on submit.

## Error Codes

Errors have the form `{"error": "message"}`. Failures while creating the document, including an unknown client or VAT rate, return 400.

| Status Code | Description |
|-------------|-------------|
| 400 | Missing or invalid lines, unknown client, unknown `vatRateId`, or any other failure while creating |
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Company not found or not accessible |

### Example error response

```json
{
  "error": "Line 0: quantity must be positive."
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
