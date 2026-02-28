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
| `X-Company` | string | Yes | Company UUID to scope the request |

## Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20, max: 100) |
| `search` | string | No | Search term for receipt number, customer name, or fiscal number |
| `status` | string | No | Filter by status: `draft`, `issued`, `invoiced`, `cancelled` |
| `from` | string | No | Start date filter (ISO 8601 format: YYYY-MM-DD) |
| `to` | string | No | End date filter (ISO 8601 format: YYYY-MM-DD) |
| `paymentMethod` | string | No | Filter by payment method: `cash`, `card`, `mixed`, `other` |
| `cashRegisterName` | string | No | Filter by cash register name |

## Request

```bash {% title="cURL" %}
curl -X GET "https://api.storno.ro/api/v1/receipts?page=1&limit=20&status=issued" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/receipts?page=1&limit=20&status=issued', {
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
      "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "number": "BON-2026-042",
      "seriesId": "850e8400-e29b-41d4-a716-446655440000",
      "series": {
        "uuid": "850e8400-e29b-41d4-a716-446655440000",
        "name": "BON",
        "nextNumber": 43,
        "prefix": "BON-",
        "year": 2026
      },
      "status": "issued",
      "issueDate": "2026-02-18",
      "currency": "RON",
      "subtotal": "210.92",
      "vatAmount": "40.08",
      "total": "251.00",
      "paymentMethod": "mixed",
      "cashPayment": "100.00",
      "cardPayment": "151.00",
      "otherPayment": "0.00",
      "cashRegisterName": "Casa 1 - Front Desk",
      "fiscalNumber": "AAAA123456",
      "customerName": "Acme SRL",
      "customerCif": "RO12345678",
      "issuedAt": "2026-02-18T10:15:00Z",
      "convertedInvoiceId": null,
      "createdAt": "2026-02-18T10:14:00Z",
      "updatedAt": "2026-02-18T10:15:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of receipt objects |
| `total` | integer | Total number of receipts matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `pages` | integer | Total number of pages |

### Receipt Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `number` | string | Receipt number (e.g., BON-2026-042) |
| `status` | string | Status: `draft`, `issued`, `invoiced`, `cancelled` |
| `issueDate` | string | Date of issue (YYYY-MM-DD) |
| `currency` | string | Currency code |
| `subtotal` | string | Subtotal amount (excluding VAT) |
| `vatAmount` | string | Total VAT amount |
| `total` | string | Total amount (including VAT) |
| `paymentMethod` | string | Payment method: `cash`, `card`, `mixed`, `other` |
| `cashPayment` | string | Amount paid in cash |
| `cardPayment` | string | Amount paid by card |
| `otherPayment` | string | Amount paid by other method |
| `cashRegisterName` | string | Name or label of the cash register |
| `fiscalNumber` | string | Fiscal serial number of the cash register |
| `customerName` | string \| null | Customer name (for B2B receipts) |
| `customerCif` | string \| null | Customer CIF/CUI (for B2B receipts) |
| `series` | object | Series details |
| `issuedAt` | string \| null | ISO 8601 timestamp when issued |
| `convertedInvoiceId` | string \| null | UUID of the created invoice (if invoiced) |

## Status Lifecycle

Receipts follow this status flow:

- **draft** — Initial state when created
- **issued** — Receipt printed and handed to customer
- **invoiced** — Customer requested an invoice; receipt was converted
- **cancelled** — Receipt was voided

Once a receipt is `invoiced` or `cancelled`, it cannot be modified.

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 422 | `validation_error` | Invalid query parameters (e.g., invalid status value, invalid date format) |
| 500 | `internal_error` | Server error occurred |

## Use Cases

### Daily Sales Summary
Retrieve all receipts issued on a specific day:
```
GET /api/v1/receipts?from=2026-02-18&to=2026-02-18&status=issued
```

### Cash Register Audit
List all receipts for a specific register:
```
GET /api/v1/receipts?cashRegisterName=Casa%201&from=2026-02-01&to=2026-02-28
```

### Pending Invoice Conversions
Find all issued receipts that have not yet been converted:
```
GET /api/v1/receipts?status=issued
```

## Best Practices

1. **Filter by date range** - Always use `from`/`to` filters for daily reporting to keep response sizes manageable
2. **Monitor invoiced status** - Track which receipts have been converted to invoices for VAT reporting
3. **Audit by register** - Use `cashRegisterName` filter for per-register reconciliation
4. **Regular reconciliation** - Compare receipt totals against POS system daily totals
