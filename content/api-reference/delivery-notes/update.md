---
title: Update Delivery Note
description: Update an existing delivery note (draft or issued status)
method: PUT
endpoint: /api/v1/delivery-notes/{uuid}
---

# Update Delivery Note

Updates an existing delivery note. Delivery notes in both `draft` and `issued` status can be updated. Once converted or cancelled, the delivery note cannot be edited.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `Content-Type` | string | Yes | Must be `application/json` |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note to update |

## Request Body

This is a partial update. Only the fields present in the body change; omitted fields keep their value. When `lines` is sent, all existing lines are deleted and replaced by the lines in the body.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clientId` | string | No | UUID of a client of the company |
| `documentSeriesId` | string | No | UUID of the delivery note series. Can be changed to any active `delivery_note` series; if omitted, the existing series is preserved |
| `issueDate` | string | No | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | No | Due date for invoicing (YYYY-MM-DD) |
| `currency` | string | No | Currency code |
| `exchangeRate` | number | No | Exchange rate |
| `deliveryLocation` | string | No | Delivery address |
| `projectReference` | string | No | Project reference |
| `issuerName` | string | No | Issuer name |
| `issuerId` | string | No | Issuer identifier, stored as sent |
| `salesAgent` | string | No | Sales agent name |
| `deputyName` | string | No | Deputy name |
| `deputyIdentityCard` | string | No | Deputy ID card |
| `deputyAuto` | string | No | Vehicle registration |
| `notes` | string | No | Public notes |
| `mentions` | string | No | Additional mentions |
| `internalNote` | string | No | Internal note |
| `lines` | array | No | Array of line items (replaces all existing lines) |
| `skipEtransport` | boolean | No | Exclude the delivery note from e-Transport |

### e-Transport Fields

All e-Transport fields from the [Create endpoint](/api-reference/delivery-notes/create#e-transport-fields) are accepted. Key fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `etransportOperationType` | number | No | Operation type (10, 12, 20, 30, 40, 50, 60) |
| `etransportVehicleNumber` | string | No | Vehicle registration (3-20 uppercase alphanumeric) |
| `etransportTransporterCountry` | string | No | Transporter country code (e.g., "RO") |
| `etransportTransporterCode` | string | No | Transporter CUI/CIF (numeric only) |
| `etransportTransporterName` | string | No | Transporter legal name |
| `etransportTransportDate` | string | No | Transport start date (YYYY-MM-DD) |
| `etransportPostIncident` | string | No | Post-incident declaration, one character (`"D"` for a declaration made after the transport) |
| `etransportTrailer1` | string | No | First trailer registration |
| `etransportTrailer2` | string | No | Second trailer registration |
| `etransportStartCounty` | number | No | Start county code (1-52) |
| `etransportStartLocality` | string | No | Start locality (2-100 chars) |
| `etransportStartStreet` | string | No | Start street (2-100 chars) |
| `etransportStartNumber` | string | No | Start street number |
| `etransportStartOtherInfo` | string | No | Start additional info |
| `etransportStartPostalCode` | string | No | Start postal code |
| `etransportEndCounty` | number | No | End county code (1-52) |
| `etransportEndLocality` | string | No | End locality (2-100 chars) |
| `etransportEndStreet` | string | No | End street (2-100 chars) |
| `etransportEndNumber` | string | No | End street number |
| `etransportEndOtherInfo` | string | No | End additional info |
| `etransportEndPostalCode` | string | No | End postal code |

### Line Item Object

The lines sent replace all existing lines, so send every line the delivery note should keep. Lines are not matched by id: each line is created again.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | No | Item description |
| `quantity` | number | No | Quantity (default 1) |
| `unitPrice` | number | No | Price per unit (default 0) |
| `vatRate` | number | No | VAT rate percentage. Default 21.00 when neither `vatRate` nor `vatRateId` is sent, whatever the VAT status of the company |
| `vatCategoryCode` | string | No | UBL VAT category code (default `S`; a 0% rate becomes `Z` on its own) |
| `vatRateId` | string | No | Id of one of the company's VAT rates (`GET /api/v1/vat-rates`). The line takes its percentage and category. Ignored when `vatRate` is sent; an error when it is not a rate of the company |
| `unitOfMeasure` | string | No | Unit of measure |
| `productCode` | string | No | Product code printed on the line |
| `tariffCode` | string | No | 8-digit HS/CN tariff code (required for e-Transport, BR-206) |
| `purposeCode` | number | No | Purpose code (for TTN: 101, 704, 705, 9901 per BR-070) |
| `unitOfMeasureCode` | string | No | UN/ECE Rec 20 code (e.g., "H87", "KGM", "SET") |
| `netWeight` | string | No | Net weight in kg (required for e-Transport, BR-207) |
| `grossWeight` | string | No | Gross weight in kg |
| `valueWithoutVat` | string | No | Value without VAT (required for e-Transport, BR-208) |

> **VAT on a line.** Send `vatRate` (a percentage) or `vatRateId` (the id of one of the company's rates from `GET /api/v1/vat-rates`; the line takes that rate's percentage and category). When both are sent `vatRate` wins. When neither is sent the line gets **21%**, also when the issuing company is not a VAT payer. For a company that is not a VAT payer send `vatRate: "0.00"` on every line. A `vatRateId` that is not a rate of the company is refused with an error; it never falls back to 21%.

## Request

```bash {% title="cURL" %}
curl -X PUT https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "750e8400-e29b-41d4-a716-446655440000",
    "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-18",
    "dueDate": "2026-03-20",
    "currency": "RON",
    "deliveryLocation": "Updated: Client new warehouse - Str. Nou 10",
    "projectReference": "PROJECT-2026-002",
    "issuerName": "John Doe",
    "deputyName": "Updated Deputy Name",
    "deputyIdentityCard": "CD789012",
    "deputyAuto": "B-456-XYZ",
    "notes": "Updated delivery notes",
    "lines": [
      {
        "description": "Laptop Dell Latitude 7420 (Updated qty)",
        "quantity": 12,
        "unitPrice": 450,
        "unitOfMeasure": "piece",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000"
      },
      {
        "description": "USB-C Cable 2m",
        "quantity": 12,
        "unitPrice": 15,
        "unitOfMeasure": "piece",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000"
      }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientId: '750e8400-e29b-41d4-a716-446655440000',
    documentSeriesId: '850e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-18',
    dueDate: '2026-03-20',
    currency: 'RON',
    deliveryLocation: 'Updated: Client new warehouse - Str. Nou 10',
    projectReference: 'PROJECT-2026-002',
    issuerName: 'John Doe',
    deputyName: 'Updated Deputy Name',
    deputyIdentityCard: 'CD789012',
    deputyAuto: 'B-456-XYZ',
    notes: 'Updated delivery notes',
    lines: [
      {
        description: 'Laptop Dell Latitude 7420 (Updated qty)',
        quantity: 12,
        unitPrice: 450,
        unitOfMeasure: 'piece',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000'
      },
      {
        description: 'USB-C Cable 2m',
        quantity: 12,
        unitPrice: 15,
        unitOfMeasure: 'piece',
        vatRateId: '350e8400-e29b-41d4-a716-446655440000'
      }
    ]
  })
});

const data = await response.json();
```

## Response

Returns the updated delivery note with recalculated totals, and the e-Transport validation result:

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
      "name": "Client SRL",
      "cui": "12345678"
    },
    "status": "draft",
    "issueDate": "2026-02-18",
    "dueDate": "2026-03-20",
    "currency": "RON",
    "deliveryLocation": "Updated: Client new warehouse - Str. Nou 10",
    "projectReference": "PROJECT-2026-002",
    "issuerName": "John Doe",
    "deputyName": "Updated Deputy Name",
    "deputyIdentityCard": "CD789012",
    "deputyAuto": "B-456-XYZ",
    "notes": "Updated delivery notes",
    "lines": [
      {
        "id": "a30e8400-e29b-41d4-a716-446655440000",
        "position": 1,
        "description": "Laptop Dell Latitude 7420 (Updated qty)",
        "quantity": "12",
        "unitOfMeasure": "piece",
        "unitPrice": "450",
        "vatRate": "21.00",
        "vatCategoryCode": "S",
        "vatAmount": "1134.00",
        "lineTotal": "5400.00"
      },
      {
        "id": "a40e8400-e29b-41d4-a716-446655440000",
        "position": 2,
        "description": "USB-C Cable 2m",
        "quantity": "12",
        "unitOfMeasure": "piece",
        "unitPrice": "15",
        "vatRate": "21.00",
        "vatCategoryCode": "S",
        "vatAmount": "37.80",
        "lineTotal": "180.00"
      }
    ],
    "subtotal": "5580.00",
    "vatTotal": "1171.80",
    "total": "6751.80"
  },
  "validation": null
}
```

The object has the same fields as the [create](/api-reference/delivery-notes/create#response) response (abridged here). `validation` is `null` when `skipEtransport` is true or `etransportOperationType` is not set; otherwise it holds `valid`, `errors`, `warnings` and `schematronAvailable`.

## Line Item Behavior

When `lines` is sent:
- All existing lines are deleted and the lines in the body are created, with new ids
- `position` is assigned sequentially from 1
- When `lines` is omitted, the existing lines are kept

## Validation Rules

- The delivery note must be in `draft` or `issued` status
- `clientId`, if sent, must be a client of the company
- `vatRateId`, if sent without `vatRate`, must be a VAT rate of the company
- Line fields are not checked for missing values on update; omitted `quantity` becomes 1 and omitted `unitPrice` becomes 0

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Delivery note not found or not in the caller's organization |
| 422 | The delivery note is not editable (converted or cancelled), the client is not found, or a `vatRateId` is not a rate of the company |

### Example error response

```json
{
  "error": "This delivery note cannot be edited."
}
```

## Common Update Scenarios

### Update Quantities Before Delivery
```javascript
// Adjust quantities to match actual stock
lines: [
  { description: "Item 1", quantity: 12, ... },  // Was 10, now 12
  { description: "Item 2", quantity: 10, ... }   // Unchanged, sent again
]
```

### Add Items to Delivery
```javascript
// Send the existing lines again + the new one
lines: [
  { description: "Item 1", ... },
  { description: "New Item", quantity: 5, ... }
]
```

### Remove Items from Delivery
```javascript
// Only include items being delivered
lines: [
  { description: "Item 1", ... }   // Keep only this
  // Item 2 removed by omitting it
]
```

### Update Delivery Details
```javascript
// Change delivery location or deputy
{
  deliveryLocation: "New warehouse address",
  deputyName: "Different person receiving",
  deputyIdentityCard: "New ID number"
}
```

### Correct Data Entry Errors
```javascript
// Fix mistakes before issuing
{
  projectReference: "Corrected project code",
  notes: "Corrected delivery notes",
  lines: [{ ...corrected line data }]
}
```

## Best Practices

1. **Update before issuing** - Make all corrections while in draft status
2. **Verify totals** - Check calculated totals after updating quantities
3. **Track changes** - Log what was changed and why in your system
4. **Confirm with client** - If delivery details change, notify client
5. **Update promptly** - Make changes as soon as discrepancies are discovered
6. **Check inventory** - Ensure updated quantities match available stock
7. **Issue when ready** - Once finalized, mark as issued immediately

## When to Update vs Create New

### Update Existing
- Delivery note is in `draft` or `issued` status
- Fixing errors before or after issue
- Adjusting quantities to match stock
- Correcting client or location details

### Create New Delivery Note
- Need to document an additional, separate delivery
- Delivery note is already converted or cancelled
- Separate shipment or delivery event
- Historical record of the original must remain unchanged

## Next Steps

After updating a delivery note:
1. Review all changes carefully
2. Verify totals and calculations
3. Confirm inventory availability
4. Mark as issued when ready for delivery
5. Convert to invoice after successful delivery
