---
title: List Proforma Invoices
description: Retrieve a paginated list of proforma invoices with optional filtering and search
method: GET
endpoint: /api/v1/proforma-invoices
---

# List Proforma Invoices

Retrieves a paginated list of proforma invoices for the company. Supports filtering by status, issue date range and search across the proforma number and client name.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request. Optional only when the organization has a single company |

## Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10, max: 20; larger values are reduced to 20) |
| `search` | string | No | Search term for the proforma number or client name |
| `status` | string | No | Filter by status: `draft`, `sent`, `accepted`, `rejected`, `converted`, `cancelled`, `expired` |
| `dateFrom` | string | No | Issue date from, inclusive (YYYY-MM-DD) |
| `dateTo` | string | No | Issue date to, inclusive (YYYY-MM-DD) |
| `currency` | string | No | Filter by currency code |
| `convertedToInvoice` | string | No | `yes` for converted proformas only, `no` for the others |
| `expired` | string | No | `yes` for proformas whose `validUntil` is in the past, `no` for the others |
| `sort` | string | No | `number`, `issueDate`, `total`, `status`, `createdAt` (default) or `validUntil` |
| `order` | string | No | `asc` or `desc` (default: `desc`) |

Other query parameters, including `from`, `to` and `clientId`, are ignored.

## Request

```bash {% title="cURL" %}
curl -X GET "https://api.storno.ro/api/v1/proforma-invoices?page=1&limit=10&status=sent" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/proforma-invoices?page=1&limit=10&status=sent', {
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
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "client": {
        "name": "Client SRL",
        "cui": "12345678"
      },
      "number": "PRO0001",
      "status": "sent",
      "currency": "RON",
      "issueDate": "2026-02-16T00:00:00+00:00",
      "dueDate": "2026-03-16T00:00:00+00:00",
      "validUntil": "2026-03-16T00:00:00+00:00",
      "subtotal": "1000.00",
      "vatTotal": "190.00",
      "total": "1190.00",
      "expiredAt": null,
      "clientName": "Client SRL"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "currency": "RON",
  "distinctCurrencies": [
    "RON",
    "EUR"
  ],
  "totals": {
    "subtotal": "45000.00",
    "vatTotal": "8550.00",
    "total": "53550.00"
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of proforma invoice objects |
| `total` | integer | Total number of proformas matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `currency` | string | Currency of `totals` (the `currency` filter, else the company default) |
| `distinctCurrencies` | array | Currencies used by the company's proformas |
| `totals` | object | `subtotal`, `vatTotal` and `total` summed over all proformas matching the filters, as strings |

There is no page count. Request pages until `data` is empty or `page * limit` reaches `total`.

### Proforma Invoice Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Proforma UUID |
| `number` | string | Proforma number. A temporary `PRO-xxxxxxxx` number when no series was set |
| `status` | string | `draft`, `sent`, `accepted`, `rejected`, `converted`, `cancelled` or `expired` |
| `client` | object | `name` and `cui` of the client |
| `clientName` | string | Client name |
| `currency` | string | Currency code (e.g., RON, EUR, USD) |
| `issueDate` | string | Date of issue, ISO 8601 date-time |
| `dueDate` | string \| null | Payment due date |
| `validUntil` | string \| null | Valid until date |
| `subtotal` | string | Subtotal amount (excluding VAT) |
| `vatTotal` | string | Total VAT amount |
| `total` | string | Total amount (including VAT) |
| `expiredAt` | string \| null | ISO 8601 timestamp when the proforma expired |

The list returns this summary. Use [Get proforma invoice](/api-reference/proforma-invoices/get) for the lines and all other fields.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the invoice view permission |
| 404 | Company not found (`X-Company` missing, unknown or not accessible) |

Errors return a JSON body with a single `error` message, for example `{"error": "Proforma not found."}`.

## Status Lifecycle

- `draft`: initial state when created
- `sent`: marked as sent to the client
- `accepted`: the client accepted the proforma
- `rejected`: the client rejected the proforma
- `converted`: converted to an invoice
- `cancelled`: the proforma was cancelled
- `expired`: a status value that exists on the document. No endpoint in this section sets it

Only a `draft` proforma can be edited.
