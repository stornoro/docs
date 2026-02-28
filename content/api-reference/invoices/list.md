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
| `X-Company` | string | Yes | Company UUID to scope the request |

## Query parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `limit` | integer | 20 | Number of items per page (max 100) |
| `search` | string | - | Search term for invoice number or client name |
| `status` | string | - | Filter by document status (see DocumentStatus enum) |
| `direction` | string | - | Filter by direction: `incoming` or `outgoing` |
| `from` | string | - | Start date filter (ISO 8601 format: YYYY-MM-DD) |
| `to` | string | - | End date filter (ISO 8601 format: YYYY-MM-DD) |
| `clientId` | string | - | Filter by client UUID |
| `sort` | string | issueDate | Field to sort by (issueDate, number, total, dueDate) |
| `order` | string | desc | Sort order: `asc` or `desc` |

### DocumentStatus enum values

- `draft` - Invoice is being edited
- `issued` - Invoice has been issued
- `sent_to_provider` - Submitted to e-invoice provider
- `validated` - Provider validation successful
- `rejected` - Provider validation failed
- `cancelled` - Invoice has been cancelled

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl https://api.storno.ro/api/v1/invoices?page=1&limit=20&status=issued&direction=outgoing \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices?page=1&limit=20&status=issued&direction=outgoing', {
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

Returns a paginated list of invoices with summary information.

```json
{
  "data": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "number": "FAC-2024-001",
      "status": "issued",
      "direction": "outgoing",
      "currency": "RON",
      "issueDate": "2024-02-15",
      "dueDate": "2024-03-15",
      "subtotal": 1000.00,
      "vatTotal": 190.00,
      "total": 1190.00,
      "clientName": "Acme Corporation SRL",
      "amountPaid": 500.00,
      "balance": 690.00,
      "supplier": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Your Company SRL",
        "cif": "RO12345678"
      }
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 20,
  "pages": 8
}
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of invoice objects |
| `total` | integer | Total number of invoices matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `pages` | integer | Total number of pages |

### Invoice object fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Invoice UUID |
| `number` | string | Invoice number (series-formatted) |
| `status` | string | Current invoice status |
| `direction` | string | Invoice direction (incoming/outgoing) |
| `currency` | string | ISO 4217 currency code |
| `issueDate` | string | Date invoice was issued |
| `dueDate` | string | Payment due date |
| `subtotal` | number | Total before VAT |
| `vatTotal` | number | Total VAT amount |
| `total` | number | Final total including VAT |
| `clientName` | string | Client/customer name |
| `amountPaid` | number | Total amount paid |
| `balance` | number | Remaining balance due |
| `supplier` | object | Supplier information |

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `422` | Invalid query parameters |
