---
title: List Proforma Invoices
description: Retrieve a paginated list of proforma invoices with optional filtering and search
method: GET
endpoint: /api/v1/proforma-invoices
---

# List Proforma Invoices

Retrieves a paginated list of proforma invoices for the authenticated company. Supports filtering by status, date range, client, and full-text search across invoice numbers and client names.

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
| `search` | string | No | Search term for invoice number or client name |
| `status` | string | No | Filter by status: `draft`, `sent`, `accepted`, `rejected`, `converted`, `cancelled` |
| `from` | string | No | Start date filter (ISO 8601 format: YYYY-MM-DD) |
| `to` | string | No | End date filter (ISO 8601 format: YYYY-MM-DD) |
| `clientId` | string | No | Filter by client UUID |

## Request

```bash {% title="cURL" %}
curl -X GET https://api.storno.ro/api/v1/proforma-invoices?page=1&limit=20&status=sent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices?page=1&limit=20&status=sent', {
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
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "number": "PRO-2026-001",
      "seriesId": "650e8400-e29b-41d4-a716-446655440000",
      "series": {
        "uuid": "650e8400-e29b-41d4-a716-446655440000",
        "name": "PRO",
        "nextNumber": 2
      },
      "clientId": "750e8400-e29b-41d4-a716-446655440000",
      "client": {
        "uuid": "750e8400-e29b-41d4-a716-446655440000",
        "name": "Client SRL",
        "registrationNumber": "RO12345678",
        "address": "Str. Exemplu 123, București"
      },
      "status": "sent",
      "issueDate": "2026-02-16",
      "dueDate": "2026-03-16",
      "validUntil": "2026-03-16",
      "currency": "RON",
      "exchangeRate": 1.0,
      "subtotal": "1000.00",
      "vatAmount": "190.00",
      "total": "1190.00",
      "notes": "Payment terms: 30 days",
      "paymentTerms": "Net 30",
      "deliveryLocation": "Client warehouse",
      "projectReference": "PROJECT-2026-001",
      "orderNumber": "PO-2026-123",
      "contractNumber": "CONTRACT-2026-456",
      "issuerName": "John Doe",
      "issuerId": "850e8400-e29b-41d4-a716-446655440000",
      "mentions": "Special delivery instructions",
      "internalNote": "Internal reference note",
      "salesAgent": "Jane Smith",
      "sentAt": "2026-02-16T10:30:00Z",
      "acceptedAt": null,
      "rejectedAt": null,
      "cancelledAt": null,
      "convertedAt": null,
      "convertedInvoiceId": null,
      "createdAt": "2026-02-16T09:00:00Z",
      "updatedAt": "2026-02-16T10:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of proforma invoice objects |
| `total` | integer | Total number of proforma invoices matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `pages` | integer | Total number of pages |

### Proforma Invoice Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `number` | string | Proforma invoice number (e.g., PRO-2026-001) |
| `status` | string | Status: `draft`, `sent`, `accepted`, `rejected`, `converted`, `cancelled` |
| `issueDate` | string | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | Payment due date (YYYY-MM-DD) |
| `validUntil` | string | Valid until date (YYYY-MM-DD) |
| `currency` | string | Currency code (e.g., RON, EUR, USD) |
| `exchangeRate` | number | Exchange rate to company base currency |
| `subtotal` | string | Subtotal amount (excluding VAT) |
| `vatAmount` | string | Total VAT amount |
| `total` | string | Total amount (including VAT) |
| `client` | object | Client details |
| `series` | object | Series details |
| `sentAt` | string \| null | ISO 8601 timestamp when marked as sent |
| `acceptedAt` | string \| null | ISO 8601 timestamp when accepted |
| `rejectedAt` | string \| null | ISO 8601 timestamp when rejected |
| `cancelledAt` | string \| null | ISO 8601 timestamp when cancelled |
| `convertedAt` | string \| null | ISO 8601 timestamp when converted to invoice |
| `convertedInvoiceId` | string \| null | UUID of the created invoice (if converted) |

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 422 | `validation_error` | Invalid query parameters (e.g., invalid status value, invalid date format) |
| 500 | `internal_error` | Server error occurred |

## Status Lifecycle

Proforma invoices follow this status flow:

- **draft** → Initial state when created
- **sent** → Marked as sent to client
- **accepted** → Client accepted the proforma
- **rejected** → Client rejected the proforma
- **converted** → Converted to a final invoice
- **cancelled** → Proforma was cancelled

Once a proforma is `converted`, `cancelled`, `accepted`, or `rejected`, it cannot be modified.
