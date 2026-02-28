---
title: Export invoices to CSV
description: Export a filtered list of invoices to CSV format
---

# Export invoices to CSV

Exports invoices to a CSV (Comma-Separated Values) file. Supports the same filtering options as the list endpoint for customized exports.

```
GET /api/v1/invoices/export/csv
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Query parameters

Accepts the same filter parameters as the [list invoices](/api-reference/invoices/list) endpoint:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `search` | string | - | Search term for invoice number or client name |
| `status` | string | - | Filter by document status |
| `direction` | string | - | Filter by direction: `incoming` or `outgoing` |
| `from` | string | - | Start date filter (ISO 8601 format: YYYY-MM-DD) |
| `to` | string | - | End date filter (ISO 8601 format: YYYY-MM-DD) |
| `clientId` | string | - | Filter by client UUID |
| `sort` | string | issueDate | Field to sort by |
| `order` | string | desc | Sort order: `asc` or `desc` |

{% callout type="warning" %}
Large exports (>1000 invoices) may take several seconds. For exports with >5000 invoices, consider using the [ZIP export endpoint](/api-reference/invoices/export-zip) instead.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl "https://api.storno.ro/api/v1/invoices/export/csv?from=2024-01-01&to=2024-12-31&status=issued" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -o invoices-2024.csv
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const params = new URLSearchParams({
  from: '2024-01-01',
  to: '2024-12-31',
  status: 'issued'
});

const response = await fetch(`https://api.storno.ro/api/v1/invoices/export/csv?${params}`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'invoices-2024.csv';
a.click();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns a CSV file with `Content-Type: text/csv; charset=utf-8`.

### Response headers

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | text/csv; charset=utf-8 | CSV with UTF-8 encoding |
| `Content-Disposition` | attachment; filename="invoices-2024-01-01.csv" | Suggested filename |
| `X-Total-Records` | 156 | Number of invoices exported |

### CSV structure

```csv
Invoice Number,Client Name,Client CIF,Issue Date,Due Date,Status,Currency,Subtotal,VAT Total,Total,Amount Paid,Balance,Direction,Series,Notes
FAC-2024-001,Acme Corporation SRL,RO98765432,2024-02-15,2024-03-15,issued,RON,1000.00,190.00,1190.00,500.00,690.00,outgoing,FAC,Payment terms: 30 days net
FAC-2024-002,Beta Industries SRL,RO11223344,2024-02-16,2024-03-16,validated,RON,2500.00,475.00,2975.00,2975.00,0.00,outgoing,FAC,
FAC-2024-003,Gamma Trading SRL,RO55667788,2024-02-17,2024-03-17,sent_to_provider,EUR,1200.00,228.00,1428.00,0.00,1428.00,outgoing,FAC,International client
```

## CSV columns

| Column | Description |
|--------|-------------|
| Invoice Number | Full invoice number |
| Client Name | Client company name |
| Client CIF | Client tax ID (CIF/VAT number) |
| Issue Date | Invoice issue date (YYYY-MM-DD) |
| Due Date | Payment due date (YYYY-MM-DD) |
| Status | Current invoice status |
| Currency | ISO currency code |
| Subtotal | Total before VAT |
| VAT Total | Total VAT amount |
| Total | Final total including VAT |
| Amount Paid | Total payments received |
| Balance | Remaining balance due |
| Direction | incoming/outgoing |
| Series | Invoice series name |
| Notes | Invoice notes/description |

### Additional columns

| Column | Description |
|--------|-------------|
| Project Reference | Project reference number |
| Order Number | Purchase order number |
| Contract Number | Contract reference |
| Sales Agent | Sales agent name |
| Payment Terms | Payment terms description |
| ANAF Submission ID | E-invoice provider submission identifier |
| Internal Note | Internal notes |
| Created At | When invoice was created |
| Updated At | Last modification date |

## CSV formatting

- **Encoding** - UTF-8 with BOM for Excel compatibility
- **Delimiter** - Comma (,)
- **Quote character** - Double quote (")
- **Line ending** - CRLF (\r\n) for Windows compatibility
- **Numbers** - Decimal point (.), no thousands separator
- **Dates** - ISO 8601 format (YYYY-MM-DD)
- **Boolean** - true/false (lowercase)

### Excel compatibility

The CSV is formatted for optimal Excel compatibility:
- UTF-8 BOM for automatic encoding detection
- Proper quoting of fields containing commas
- Date format recognized by Excel
- Numbers formatted as numbers (not text)

## Use cases

- **Accounting import** - Import into accounting software
- **Reporting** - Create custom reports in Excel/Google Sheets
- **Data analysis** - Analyze invoice patterns and trends
- **Backup** - Archive invoice data
- **Audits** - Provide invoice data to auditors
- **Integration** - Feed data to other systems

## Performance

| Invoice count | Typical response time |
|--------------|----------------------|
| < 100 | < 1 second |
| 100-500 | 1-3 seconds |
| 500-1000 | 3-5 seconds |
| 1000-5000 | 5-15 seconds |
| > 5000 | Use ZIP export |

## Limitations

- **Maximum records** - 10,000 invoices per export
- **Timeout** - 30 second timeout
- **Rate limiting** - 10 exports per hour

For larger exports, use the [ZIP export endpoint](/api-reference/invoices/export-zip).

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `413` | Too many invoices to export (use ZIP export) |
| `422` | Invalid filter parameters |
| `504` | Export timeout (reduce date range or use filters) |

## Related endpoints

- [Export to ZIP](/api-reference/invoices/export-zip) - Export with PDF/XML files
- [List invoices](/api-reference/invoices/list) - Preview data before export
- [Get invoice details](/api-reference/invoices/get) - Get full invoice data
