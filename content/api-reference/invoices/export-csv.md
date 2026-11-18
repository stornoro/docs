---
title: Export invoices to CSV
description: Export a filtered list of invoices to CSV format
---

# Export invoices to CSV

Exports invoices to a CSV (Comma-Separated Values) file. Supports most of the list endpoint filters. The export is not paginated: it contains every matching invoice, and cancelled invoices are always left out.

```
GET /api/v1/invoices/export/csv
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Query parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `search` | string | - | Search term for invoice number, client name, sender or receiver name |
| `direction` | string | - | Filter by direction: `incoming` or `outgoing` |
| `type` | string | - | Filter by document type: `invoice`, `credit_note` or `proforma` |
| `dateFrom` | string | - | Start of the issue date range (YYYY-MM-DD). `from` is accepted as an alias |
| `dateTo` | string | - | End of the issue date range (YYYY-MM-DD). `to` is accepted as an alias |
| `clientId` | string | - | Filter by client UUID |
| `supplierId` | string | - | Filter by supplier UUID |
| `currency` | string | - | ISO 4217 currency code |
| `isPaid` | boolean | - | `true` for invoices with a payment date, `false` for those without |
| `isOverdue` | boolean | - | `true` for unpaid invoices past their due date |
| `isDuplicate` | boolean | - | Filter on the duplicate flag |

The `status`, `sort` and `order` parameters of the list endpoint are not supported here. Rows are ordered by issue date, newest first.

{% callout type="warning" %}
Always pass a date range. Without one the response contains the company's whole invoice history.
{% /callout %}

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl "https://api.storno.ro/api/v1/invoices/export/csv?dateFrom=2024-01-01&dateTo=2024-12-31&direction=outgoing" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -o invoices-2024.csv
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const params = new URLSearchParams({
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  direction: 'outgoing'
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

Returns a CSV file with `Content-Type: text/csv; charset=UTF-8`.

### Response headers

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | text/csv; charset=UTF-8 | CSV with UTF-8 encoding |
| `Content-Disposition` | attachment; filename="facturi-2024-12-31.csv" | `facturi-` followed by the export date |

### CSV structure

The first line is a header row. Column names are in Romanian.

```csv
Numar,Data emitere,Data scadenta,Tip,Directie,Status,Emitent CIF,Emitent,Destinatar CIF,Destinatar,Subtotal,TVA,Total,Moneda,Platita la,Metoda plata,Duplicat,Depusa cu intarziere
FAC-2024-001,2024-02-15,2024-03-15,invoice,outgoing,issued,RO12345678,Your Company SRL,RO98765432,Acme Corporation SRL,1000.00,190.00,1190.00,RON,,,Nu,Nu
```

## CSV columns

| Column | Description |
|--------|-------------|
| Numar | Invoice number |
| Data emitere | Issue date (YYYY-MM-DD) |
| Data scadenta | Due date (YYYY-MM-DD) |
| Tip | Document type: `invoice`, `credit_note` or `proforma` |
| Directie | `incoming` or `outgoing` |
| Status | Document status |
| Emitent CIF | Sender tax ID |
| Emitent | Sender name |
| Destinatar CIF | Receiver tax ID |
| Destinatar | Receiver name |
| Subtotal | Total before VAT |
| TVA | Total VAT amount |
| Total | Final total including VAT |
| Moneda | ISO currency code |
| Platita la | Date the invoice was fully paid, empty when unpaid |
| Metoda plata | Payment method |
| Duplicat | `Da` or `Nu` |
| Depusa cu intarziere | `Da` or `Nu`, whether the invoice was submitted late |

## CSV formatting

- **Encoding** - UTF-8 with a BOM, so Excel detects the encoding
- **Delimiter** - Comma (,)
- **Quote character** - Double quote (")
- **Numbers** - Decimal point (.), no thousands separator
- **Dates** - YYYY-MM-DD
- **Cell values** - Values starting with `=`, `+`, `-` or `@` are prefixed with a single quote so spreadsheets do not evaluate them

## Use cases

- **Accounting import** - Import into accounting software
- **Reporting** - Create custom reports in Excel/Google Sheets
- **Data analysis** - Analyze invoice patterns and trends
- **Backup** - Archive invoice data
- **Audits** - Provide invoice data to auditors
- **Integration** - Feed data to other systems

## Error codes

Error bodies are `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No permission to view invoices |
| `404` | Company not found |

## Related endpoints

- [Export to ZIP](/api-reference/invoices/export-zip) - Export with PDF/XML files
- [List invoices](/api-reference/invoices/list) - Preview data before export
- [Get invoice details](/api-reference/invoices/get) - Get full invoice data
