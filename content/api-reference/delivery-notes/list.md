---
title: List Delivery Notes
description: Retrieve a paginated list of delivery notes with optional filtering
method: GET
endpoint: /api/v1/delivery-notes
---

# List Delivery Notes

Retrieves a paginated list of delivery notes for the authenticated company. Delivery notes document the physical delivery of goods or completion of services, and can later be converted into invoices.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20, max: 100) |
| `search` | string | No | Search term for delivery note number or client name |
| `status` | string | No | Filter by status: `draft`, `issued`, `converted`, `cancelled` |
| `from` | string | No | Start date filter (ISO 8601 format: YYYY-MM-DD) |
| `to` | string | No | End date filter (ISO 8601 format: YYYY-MM-DD) |
| `clientId` | string | No | Filter by client UUID |

## Request

```bash {% title="cURL" %}
curl -X GET "https://api.storno.ro/api/v1/delivery-notes?page=1&limit=20&status=issued" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes?page=1&limit=20&status=issued', {
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
  "data": [
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
        "address": "Str. Exemplu 123, București"
      },
      "status": "issued",
      "issueDate": "2026-02-18",
      "dueDate": "2026-03-18",
      "currency": "RON",
      "exchangeRate": 1.0,
      "subtotal": "5000.00",
      "vatAmount": "950.00",
      "total": "5950.00",
      "deliveryLocation": "Client warehouse - Str. Depozit 5, București",
      "projectReference": "PROJECT-2026-002",
      "issuerName": "John Doe",
      "deputyName": "Jane Smith",
      "deputyIdentityCard": "AB123456",
      "deputyAuto": "B-123-ABC",
      "notes": "Handle with care - fragile items",
      "issuedAt": "2026-02-18T14:30:00Z",
      "convertedAt": null,
      "convertedInvoiceId": null,
      "createdAt": "2026-02-18T09:00:00Z",
      "updatedAt": "2026-02-18T14:30:00Z"
    }
  ],
  "total": 35,
  "page": 1,
  "limit": 20,
  "pages": 2
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of delivery note objects |
| `total` | integer | Total number of delivery notes matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `pages` | integer | Total number of pages |

### Delivery Note Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `number` | string | Delivery note number (e.g., DN-2026-012) |
| `status` | string | Status: `draft`, `issued`, `converted`, `cancelled` |
| `issueDate` | string | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | Due date for invoicing (YYYY-MM-DD) |
| `currency` | string | Currency code |
| `exchangeRate` | number | Exchange rate to company base currency |
| `subtotal` | string | Subtotal amount (excluding VAT) |
| `vatAmount` | string | Total VAT amount |
| `total` | string | Total amount (including VAT) |
| `deliveryLocation` | string | Where goods were delivered |
| `projectReference` | string | Related project reference |
| `deputyName` | string | Name of person who received delivery |
| `deputyIdentityCard` | string | ID card number of deputy |
| `deputyAuto` | string | Vehicle registration number |
| `client` | object | Client details |
| `series` | object | Series details |
| `issuedAt` | string \| null | ISO 8601 timestamp when issued |
| `convertedAt` | string \| null | ISO 8601 timestamp when converted to invoice |
| `convertedInvoiceId` | string \| null | UUID of the created invoice (if converted) |

## Status Lifecycle

Delivery notes follow this status flow:

- **draft** → Initial state when created
- **issued** → Issued and delivered to client
- **converted** → Converted to an invoice
- **cancelled** → Delivery note was cancelled

Once a delivery note is `converted` or `cancelled`, it cannot be modified.

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 422 | `validation_error` | Invalid query parameters (e.g., invalid status value, invalid date format) |
| 500 | `internal_error` | Server error occurred |

## Use Cases

### Goods Delivery Tracking
Document physical delivery of products:
- Record what was delivered
- Who received it (deputy information)
- When and where delivery occurred
- Vehicle used for transport

### Service Completion Documentation
Document completion of services:
- Services performed
- Location where services delivered
- Person who verified completion
- Date of completion

### Pre-Invoice Documentation
Create delivery notes before invoicing:
1. Issue delivery note upon delivery/completion
2. Client verifies and accepts delivery
3. Convert to invoice for payment

### Batch Invoicing
Accumulate multiple delivery notes:
1. Issue delivery notes throughout the month
2. Collect all delivery notes for a client
3. Create single invoice covering all deliveries

## Best Practices

1. **Issue promptly** - Create delivery note at time of delivery
2. **Record deputy details** - Always capture who received delivery
3. **Track conversion** - Monitor which delivery notes need invoicing
4. **Batch strategically** - Group related deliveries for efficient invoicing
5. **Clear locations** - Specify exact delivery addresses
6. **Vehicle tracking** - Record transport vehicle for logistics
7. **Client signatures** - Keep signed copies as proof of delivery
8. **Convert regularly** - Don't let delivery notes age without invoicing
