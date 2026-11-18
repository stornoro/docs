---
title: List invoices
description: Retrieve a paginated list of invoices with optional filtering and sorting
---

# List invoices

Retrieves a paginated list of invoices for the specified company. Supports filtering by status, date range, client, and search terms.

```
GET /api/v1/invoices
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request. Optional only when the account has a single company |

## Query parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `limit` | integer | 10 | Number of items per page (max 20; larger values are reduced to 20) |
| `search` | string | - | Search term for invoice number or client name |
| `status` | string | - | Filter by document status (see the values below). An unknown value is not rejected cleanly and returns `500` |
| `direction` | string | - | Filter by direction: `incoming` or `outgoing` |
| `from` | string | - | Start date filter (ISO 8601 format: YYYY-MM-DD) |
| `to` | string | - | End date filter (ISO 8601 format: YYYY-MM-DD) |
| `clientId` | string | - | Filter by client UUID |
| `type` | string | - | Filter by document type: `invoice`, `credit_note` or `proforma` |
| `sort` | string | issueDate | Field to sort by: `number`, `issueDate`, `total`, `status`, `direction`, `createdAt`. Other values fall back to `issueDate` |
| `order` | string | desc | Sort order: `asc` or `desc` |

### Status values

- `draft` - Invoice is being edited
- `issued` - Invoice has been issued
- `sent_to_provider` - Submitted to the e-invoice provider
- `validated` - Provider validation successful
- `rejected` - Provider validation failed
- `cancelled` - Invoice has been cancelled
- `synced` - Received invoice synced from the provider
- `refund` - Issued credit note or storno
- `refunded` - Invoice that has been refunded
- `converted` - Converted into another document
- `paid`, `partially_paid`, `overdue` - Accepted by the filter, but the API never sets them on invoices it creates or pays; use `isPaid` or `isOverdue`

The list also accepts `isPaid`, `isOverdue`, `isDuplicate`, `isLateSubmission`, `currency`, `supplierId`, `totalMin`, `totalMax`, `vatTotalMin` and `vatTotalMax`.

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl https://api.storno.ro/api/v1/invoices?page=1&limit=10&status=issued&direction=outgoing \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices?page=1&limit=10&status=issued&direction=outgoing', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const data = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns a page of invoices with summary information. Decimal amounts are strings and dates are ISO 8601 date-times.

```json
{
  "data": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "number": "FAC0001",
      "documentType": "invoice",
      "status": "issued",
      "direction": "outgoing",
      "currency": "RON",
      "issueDate": "2024-02-15T00:00:00+00:00",
      "dueDate": "2024-03-15T00:00:00+00:00",
      "subtotal": "1000.00",
      "vatTotal": "210.00",
      "total": "1210.00",
      "amountPaid": "500.00",
      "balance": "710.00",
      "paidAt": null,
      "clientName": "Acme Corporation SRL",
      "client": {
        "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        "name": "Acme Corporation SRL",
        "cui": "98765432"
      },
      "supplier": null,
      "parentDocumentId": null,
      "scheduledSendAt": null
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 10,
  "currency": "RON",
  "distinctCurrencies": ["RON", "EUR"],
  "totals": {
    "subtotal": "1000.00",
    "vatTotal": "210.00",
    "total": "1210.00",
    "receivable": "710.00",
    "payable": "0.00"
  }
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Invoices on this page |
| `total` | integer | Number of invoices matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `currency` | string | Currency used for `totals` (the `currency` filter, else the company default) |
| `distinctCurrencies` | array | Currencies used by the company's invoices |
| `totals` | object | Sums over all matching invoices, cancelled ones excluded: `subtotal`, `vatTotal`, `total`, `receivable`, `payable` |

The number of pages is `ceil(total / limit)`.

### Invoice object fields

Each item holds, among others, the following fields. See [Get invoice details](/api-reference/invoices/get) for the full object.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Invoice UUID |
| `number` | string | Invoice number |
| `documentType` | string | `invoice`, `credit_note` or `proforma` |
| `status` | string | Current status |
| `direction` | string | `incoming` or `outgoing` |
| `currency` | string | ISO 4217 currency code |
| `issueDate`, `dueDate` | string | ISO 8601 date-time |
| `subtotal`, `vatTotal`, `total` | string | Decimal amounts |
| `amountPaid`, `balance` | string | Amount paid and remaining balance |
| `paidAt` | string or null | When the invoice was fully paid |
| `clientName` | string | Client name |
| `client` | object | Client summary |
| `supplier` | object or null | Supplier, set on received invoices |
| `parentDocumentId` | string or null | Invoice a credit note refers to |
| `scheduledSendAt` | string or null | When the automatic e-Factura submission is due |

## Error codes

Error bodies have the form `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | The user does not have the permission to view invoices |
| `404` | Company not found, or the token has no access to it |
