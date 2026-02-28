---
title: Convert Proforma to Invoice
description: Convert a proforma invoice into a final invoice
method: POST
endpoint: /api/v1/proforma-invoices/{uuid}/convert
---

# Convert Proforma to Invoice

Converts a proforma invoice into a final, legally-binding invoice. This action creates a new invoice with all the proforma's data, marks the proforma as `converted`, and establishes a link between the two documents.

Once converted, the proforma cannot be modified and serves as a historical reference to the original quote.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the proforma invoice to convert |

## Request Body (Optional)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `invoiceSeriesId` | string | No | UUID of invoice series (if different from proforma series) |
| `issueDate` | string | No | Override issue date (default: today) |
| `dueDate` | string | No | Override due date (default: proforma's due date) |
| `overrideFields` | object | No | Fields to override from the proforma data |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceSeriesId": "660e8400-e29b-41d4-a716-446655440000",
    "issueDate": "2026-02-18",
    "dueDate": "2026-03-18"
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices/550e8400-e29b-41d4-a716-446655440000/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    invoiceSeriesId: '660e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-02-18',
    dueDate: '2026-03-18'
  })
});

const data = await response.json();
```

## Response

Returns the newly created invoice object along with updated proforma status:

```json
{
  "invoice": {
    "uuid": "650e8400-e29b-41d4-a716-446655440111",
    "number": "FAC-2026-045",
    "direction": "outgoing",
    "isCreditNote": false,
    "seriesId": "660e8400-e29b-41d4-a716-446655440000",
    "series": {
      "uuid": "660e8400-e29b-41d4-a716-446655440000",
      "name": "FAC",
      "nextNumber": 46,
      "prefix": "FAC-",
      "year": 2026
    },
    "clientId": "750e8400-e29b-41d4-a716-446655440000",
    "client": {
      "uuid": "750e8400-e29b-41d4-a716-446655440000",
      "name": "Client SRL",
      "registrationNumber": "RO12345678",
      "address": "Str. Exemplu 123, București",
      "email": "contact@client.ro",
      "phone": "+40721234567"
    },
    "status": "draft",
    "issueDate": "2026-02-18",
    "dueDate": "2026-03-18",
    "currency": "RON",
    "exchangeRate": 1.0,
    "invoiceTypeCode": "380",
    "notes": "Payment terms: 30 days",
    "paymentTerms": "Net 30",
    "deliveryLocation": "Client warehouse",
    "projectReference": "PROJECT-2026-001",
    "orderNumber": "PO-2026-123",
    "contractNumber": "CONTRACT-2026-456",
    "proformaReference": "PRO-2026-001",
    "proformaId": "550e8400-e29b-41d4-a716-446655440000",
    "lines": [
      {
        "uuid": "980e8400-e29b-41d4-a716-446655440000",
        "lineNumber": 1,
        "description": "Web Development Services - Phase 1",
        "quantity": "40.00",
        "unitPrice": "150.00",
        "unitOfMeasure": "hour",
        "productId": "450e8400-e29b-41d4-a716-446655440000",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "vatRate": {
          "percentage": "19.00"
        },
        "discount": "0.00",
        "vatIncluded": false,
        "subtotal": "6000.00",
        "vatAmount": "1140.00",
        "total": "7140.00"
      },
      {
        "uuid": "990e8400-e29b-41d4-a716-446655440000",
        "lineNumber": 2,
        "description": "Hosting Services - Annual",
        "quantity": "1.00",
        "unitPrice": "1200.00",
        "unitOfMeasure": "service",
        "productId": "460e8400-e29b-41d4-a716-446655440000",
        "vatRateId": "350e8400-e29b-41d4-a716-446655440000",
        "vatRate": {
          "percentage": "19.00"
        },
        "discount": "200.00",
        "vatIncluded": false,
        "subtotal": "1000.00",
        "vatAmount": "190.00",
        "total": "1190.00"
      }
    ],
    "subtotal": "7000.00",
    "totalDiscount": "200.00",
    "vatAmount": "1330.00",
    "total": "8330.00",
    "anafStatus": null,
    "anafUploadIndex": null,
    "createdAt": "2026-02-18T15:00:00Z",
    "updatedAt": "2026-02-18T15:00:00Z"
  },
  "proforma": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "number": "PRO-2026-001",
    "status": "converted",
    "convertedAt": "2026-02-18T15:00:00Z",
    "convertedInvoiceId": "650e8400-e29b-41d4-a716-446655440111",
    "convertedInvoiceNumber": "FAC-2026-045",
    "updatedAt": "2026-02-18T15:00:00Z"
  }
}
```

## State Changes

### Proforma Changes
- **Status:** Changed from `draft`, `sent`, or `accepted` → `converted`
- **convertedAt:** Set to current UTC timestamp
- **convertedInvoiceId:** Set to the UUID of the created invoice
- **convertedInvoiceNumber:** Set to the invoice number for easy reference

### Invoice Creation
- New invoice created with status `draft`
- All line items copied from proforma
- Client, pricing, and terms copied from proforma
- `proformaId` and `proformaReference` fields set to link back to proforma
- Ready to be uploaded to ANAF

## Data Mapping

The following fields are copied from proforma to invoice:

### Basic Information
- `clientId` - Same client
- `currency` and `exchangeRate` - Same currency settings
- `invoiceTypeCode` - Same invoice type

### Dates
- `issueDate` - Defaults to today (can be overridden)
- `dueDate` - Defaults to proforma's due date (can be overridden)

### References
- `notes` - Public notes
- `paymentTerms` - Payment terms
- `deliveryLocation` - Delivery location
- `projectReference` - Project reference
- `orderNumber` - PO number
- `contractNumber` - Contract number
- `issuerName` and `issuerId` - Issuer information
- `mentions` - Additional mentions
- `salesAgent` - Sales agent

### Line Items
- All line items with same details:
  - Description, quantity, unit price
  - VAT rate, unit of measure
  - Product reference
  - Discounts
  - VAT calculation method

### New Fields Added to Invoice
- `proformaId` - UUID of source proforma
- `proformaReference` - Proforma number for display

## Validation Rules

### Proforma Status
Can convert proforma in these statuses:
- `draft` - Can convert immediately
- `sent` - Can convert without explicit acceptance
- `accepted` - Recommended path for conversion

Cannot convert proforma in these statuses:
- `rejected` - Client declined
- `cancelled` - Offer withdrawn
- `converted` - Already converted

### Data Validation
- All proforma data must be valid
- Client must still exist
- VAT rates must still exist
- Products (if referenced) must still exist
- Series must be valid for invoices

### Series Selection
- If `invoiceSeriesId` not provided, uses proforma's series (if valid for invoices)
- Series must be configured for outgoing invoices
- Series must belong to the same company

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 404 | `not_found` | Proforma invoice not found or doesn't belong to the company |
| 409 | `conflict` | Proforma status prevents conversion or already converted |
| 422 | `validation_error` | Invalid request body or proforma data cannot be converted |
| 500 | `internal_error` | Server error occurred |

## Example Error Responses

### Status Conflict - Already Converted

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be converted",
    "details": {
      "status": "converted",
      "reason": "Proforma invoice has already been converted to an invoice",
      "convertedAt": "2026-02-18T15:00:00Z",
      "convertedInvoiceId": "650e8400-e29b-41d4-a716-446655440111",
      "convertedInvoiceNumber": "FAC-2026-045"
    }
  }
}
```

### Status Conflict - Rejected

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be converted",
    "details": {
      "status": "rejected",
      "reason": "Cannot convert rejected proforma to invoice",
      "rejectedAt": "2026-02-17T11:20:00Z"
    }
  }
}
```

### Status Conflict - Cancelled

```json
{
  "error": {
    "code": "conflict",
    "message": "Proforma invoice cannot be converted",
    "details": {
      "status": "cancelled",
      "reason": "Cannot convert cancelled proforma to invoice",
      "cancelledAt": "2026-02-17T14:45:00Z"
    }
  }
}
```

## Workflow Integration

### Standard Conversion Flow
1. Create proforma (`POST /api/v1/proforma-invoices`)
2. Send to client (`POST /api/v1/proforma-invoices/{uuid}/send`)
3. Client accepts (`POST /api/v1/proforma-invoices/{uuid}/accept`)
4. **Convert to invoice** (`POST /api/v1/proforma-invoices/{uuid}/convert`) ← You are here
5. Upload invoice to ANAF (`POST /api/v1/invoices/{uuid}/upload`)
6. Send invoice to client

### Fast-Track Flow
For trusted clients or standard orders:
1. Create proforma
2. **Convert immediately** (skip send/accept steps)
3. Upload to ANAF
4. Send to client

## Post-Conversion Actions

After conversion, you should:
1. **Upload to ANAF** - Submit the invoice to ANAF e-Factura system
2. **Generate PDF** - Create PDF version for client
3. **Send to client** - Email invoice to client
4. **Update CRM** - Sync invoice status to CRM
5. **Track payment** - Monitor payment against this invoice
6. **Archive proforma** - Keep proforma as reference

## Best Practices

1. **Review before converting** - Ensure all proforma data is correct
2. **Choose correct series** - Use appropriate invoice series
3. **Set correct dates** - Issue date typically = today
4. **Link documents** - Proforma reference is automatically maintained
5. **Upload promptly** - Submit to ANAF within required timeframe
6. **Notify stakeholders** - Alert accounting and sales teams
7. **Monitor conversion metrics** - Track proforma-to-invoice conversion rate

## Conversion Metrics

Track these metrics for sales performance:
- **Conversion rate** - % of proformas converted to invoices
- **Time to conversion** - Days from send to conversion
- **Conversion by status** - Direct vs accepted vs draft
- **Value conversion** - Total value of converted vs rejected proformas
- **Sales agent performance** - Conversion rate by sales agent

## Reversing a Conversion

If the invoice needs to be cancelled after conversion:
1. **Cannot "unconvert"** - The conversion is permanent
2. **Use credit note** - Create a credit note to reverse the invoice
3. **Proforma remains converted** - Original proforma status doesn't change
4. **Create new proforma** - If needed for revised offer

The bidirectional link between proforma and invoice is maintained for audit trail purposes.
