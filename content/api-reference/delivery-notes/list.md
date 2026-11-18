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
| `X-Company` | string | No | Company UUID to scope the request. Can be omitted when the organization has exactly one company; the `company` query parameter is accepted too |

## Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10, maximum: 20; larger values are clamped to 20) |
| `search` | string | No | Search term for delivery note number or client name |
| `status` | string | No | Filter by status: `draft`, `issued`, `converted`, `cancelled` |
| `dateFrom` | string | No | Issue date from (YYYY-MM-DD) |
| `dateTo` | string | No | Issue date up to (YYYY-MM-DD) |
| `currency` | string | No | Filter by currency code. Also selects the currency of the `totals` block |
| `convertedToInvoice` | string | No | `yes` for delivery notes linked to an invoice, `no` for the others |
| `sort` | string | No | Sort field: `number`, `issueDate`, `total`, `status`, `createdAt` (default: `createdAt`) |
| `order` | string | No | `asc` or `desc` (default: `desc`) |

## Request

```bash {% title="cURL" %}
curl -X GET "https://api.storno.ro/api/v1/delivery-notes?page=1&limit=10&status=issued" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes?page=1&limit=10&status=issued', {
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
      "id": "950e8400-e29b-41d4-a716-446655440000",
      "number": "DN0012",
      "client": {
        "id": "750e8400-e29b-41d4-a716-446655440000",
        "name": "Client SRL",
        "cui": "12345678"
      },
      "clientName": "Client SRL",
      "status": "issued",
      "issueDate": "2026-02-18",
      "dueDate": "2026-03-18",
      "currency": "RON",
      "subtotal": "5000.00",
      "vatTotal": "950.00",
      "total": "5950.00",
      "skipEtransport": false,
      "etransportUit": null,
      "etransportStatus": null
    }
  ],
  "total": 35,
  "page": 1,
  "limit": 10,
  "currency": "RON",
  "distinctCurrencies": ["RON", "EUR"],
  "totals": {
    "subtotal": "175000.00",
    "vatTotal": "33250.00",
    "total": "208250.00"
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of delivery note objects |
| `total` | integer | Total number of delivery notes matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `currency` | string | The `currency` filter, or the company default currency |
| `distinctCurrencies` | string[] | Currencies used by the company's delivery notes |
| `totals` | object | Sums of `subtotal`, `vatTotal` and `total` over all delivery notes matching the filters (not converted between currencies) |

### Delivery Note Object

The list returns a summary. Use [Get delivery note](/api-reference/delivery-notes/get) for the full document.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `number` | string | Delivery note number (e.g., DN0012). Drafts carry a temporary `AVIZ-` number |
| `status` | string | Status: `draft`, `issued`, `converted`, `cancelled` |
| `client` | object \| null | Client summary: `id`, `name`, `cui` |
| `clientName` | string \| null | Client name |
| `issueDate` | string | Date of issue (YYYY-MM-DD) |
| `dueDate` | string \| null | Due date for invoicing (YYYY-MM-DD) |
| `currency` | string | Currency code |
| `subtotal` | string | Subtotal amount (excluding VAT) |
| `vatTotal` | string | Total VAT amount |
| `total` | string | Total amount (including VAT) |
| `skipEtransport` | boolean | Whether the delivery note is excluded from e-Transport |
| `etransportUit` | string \| null | UIT returned by ANAF |
| `etransportStatus` | string \| null | e-Transport status (see [Submit to e-Transport](/api-reference/delivery-notes/submit-etransport)) |

## Status Lifecycle

Delivery notes follow this status flow:

- **draft** → Initial state when created
- **issued** → Issued and delivered to client
- **converted** → Converted to an invoice
- **cancelled** → Delivery note was cancelled

Once a delivery note is `converted` or `cancelled`, it cannot be modified.

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Company not found or not accessible |

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
