---
title: List Receipts
description: Retrieve a paginated list of receipts with optional filtering
method: GET
endpoint: /api/v1/receipts
---

# List Receipts

Retrieves a paginated list of fiscal receipts (bonuri fiscale) for the authenticated company. Receipts document point-of-sale transactions and can optionally be converted into invoices when customers request a formal tax document.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request (optional when the organization has a single company; `?company=` is also accepted) |

## Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10, maximum: 20; larger values are reduced to 20) |
| `search` | string | No | Search term for receipt number, client name, customer name, or fiscal number |
| `status` | string | No | Filter by status: `draft`, `issued`, `invoiced`, `cancelled`. Send only these values |
| `dateFrom` | string | No | Issue date on or after this date (YYYY-MM-DD) |
| `dateTo` | string | No | Issue date on or before this date (YYYY-MM-DD) |
| `paymentMethod` | string | No | Filter by payment method: `cash`, `card`, `meal_ticket`, `mixed`, `other` |
| `currency` | string | No | Filter by currency code |
| `hasCustomer` | string | No | `yes` for receipts with a customer name, CIF or client, `no` for receipts without |
| `sort` | string | No | One of `number`, `issueDate`, `total`, `status`, `createdAt` (default `createdAt`) |
| `order` | string | No | `ASC` or `DESC` (default `DESC`) |

## Request

```bash {% title="cURL" %}
curl -X GET "https://api.storno.ro/api/v1/receipts?page=1&limit=10&status=issued" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts?page=1&limit=10&status=issued', {
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
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "number": "BON0042",
      "status": "issued",
      "currency": "RON",
      "issueDate": "2026-02-18T00:00:00+02:00",
      "subtotal": "210.92",
      "vatTotal": "40.08",
      "total": "251.00",
      "paymentMethod": "mixed",
      "fiscalNumber": "AAAA123456",
      "customerName": "Acme SRL",
      "client": {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "name": "Acme SRL",
        "cui": "12345678"
      },
      "clientName": "Acme SRL"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "currency": "RON",
  "distinctCurrencies": ["RON", "EUR"],
  "totals": {
    "subtotal": "8850.10",
    "vatTotal": "1681.51",
    "total": "10531.61"
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of receipt objects |
| `total` | integer | Total number of receipts matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `currency` | string | The `currency` filter, or the company default currency |
| `distinctCurrencies` | string[] | Currencies used by the company's receipts |
| `totals` | object | Sums of `subtotal`, `vatTotal` and `total` over all receipts matching the filters |

### Receipt Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `number` | string | Receipt number (for example `BON0042`). A draft carries a temporary number until it is issued |
| `status` | string | Status: `draft`, `issued`, `invoiced`, `cancelled` |
| `currency` | string | Currency code |
| `issueDate` | string | Issue date (ISO 8601) |
| `subtotal` | string | Subtotal amount (excluding VAT) |
| `vatTotal` | string | Total VAT amount |
| `total` | string | Total amount (including VAT) |
| `paymentMethod` | string \| null | Payment method |
| `fiscalNumber` | string \| null | Fiscal serial number of the cash register |
| `customerName` | string \| null | Customer name |
| `client` | object \| null | Linked client (`id`, `name`, `cui`) |
| `clientName` | string \| null | Name of the linked client |

The list returns this summary only. Payment amounts, cash register name, series, customer CIF, lines and timestamps are returned by [Get receipt](/api-reference/receipts/get).

## Status Lifecycle

Receipts follow this status flow:

- **draft** — Initial state when created
- **issued** — Receipt printed and handed to customer
- **invoiced** — Customer requested an invoice; receipt was converted
- **cancelled** — Receipt was voided

Once a receipt is `invoiced` or `cancelled`, it cannot be modified.

## Error Codes

| Status Code | Code | Description |
|-------------|------------|-------------|
| 401 | | Missing or invalid authentication token |
| 403 | | Permission denied (`{"error": "Permission denied."}`) |
| 404 | | Company not found (`{"error": "Company not found."}`) |

Error responses have the form `{"error": "message"}`.

## Use Cases

### Daily Sales Summary
Retrieve all receipts issued on a specific day:
```
GET /api/v1/receipts?dateFrom=2026-02-18&dateTo=2026-02-18&status=issued
```

### Month Audit
List all receipts of a month, paid by card:
```
GET /api/v1/receipts?dateFrom=2026-02-01&dateTo=2026-02-28&paymentMethod=card
```

### Pending Invoice Conversions
Find all issued receipts that have not yet been converted:
```
GET /api/v1/receipts?status=issued
```

## Best Practices

1. **Filter by date range** - Use `dateFrom` and `dateTo` for daily reporting to keep response sizes manageable
2. **Monitor invoiced status** - Track which receipts have been converted to invoices for VAT reporting
3. **Regular reconciliation** - Compare receipt totals against POS system daily totals
