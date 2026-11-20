---
title: Get invoice details
description: Retrieve complete details for a specific invoice
---

# Get invoice details

Retrieves the complete details for a specific invoice, including its lines, client, series and attachments. Payments are listed by [List payments](/api-reference/payments/list) and the timeline by [Invoice events](/api-reference/invoices/events).

```
GET /api/v1/invoices/{uuid}
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not used on this route: the invoice is found by its UUID |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const invoice = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the invoice object directly (no wrapper key). Decimal amounts are strings, dates are ISO 8601 date-times, and `createdAt` and `updatedAt` are not included.

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "number": "FAC0001",
  "documentType": "invoice",
  "status": "issued",
  "direction": "outgoing",
  "currency": "RON",
  "exchangeRate": null,
  "language": "ro",
  "issueDate": "2024-02-15T00:00:00+00:00",
  "dueDate": "2024-03-15T00:00:00+00:00",
  "subtotal": "1000.00",
  "vatTotal": "210.00",
  "discount": "0.00",
  "total": "1210.00",
  "amountPaid": "500.00",
  "balance": "710.00",
  "paidAt": null,
  "paymentMethod": null,
  "invoiceTypeCode": "standard",
  "notes": "Payment terms: 30 days net",
  "paymentTerms": "Net 30",
  "deliveryLocation": "Bucharest, Romania",
  "projectReference": "PRJ-2024-001",
  "orderNumber": "PO-12345",
  "contractNumber": "CNT-2024-005",
  "issuerName": "John Doe",
  "issuerId": "123456789",
  "mentions": "Late payment penalty applies",
  "internalNote": "VIP client",
  "salesAgent": "Jane Smith",
  "deputyName": "Ion Popescu",
  "deputyIdentityCard": "AB123456",
  "deputyAuto": "B-123-ABC",
  "penaltyEnabled": true,
  "penaltyPercentPerDay": "0.05",
  "penaltyGraceDays": 5,
  "overdueRemindersDisabled": false,
  "lastOverdueReminderDays": 7,
  "lastOverdueReminderAt": "2026-11-12T09:30:04+02:00",
  "parentDocumentId": null,
  "parentDocumentNumber": null,
  "parentDocumentDate": null,
  "senderName": "Your Company SRL",
  "senderCif": "12345678",
  "receiverName": "Acme Corporation SRL",
  "receiverCif": "98765432",
  "client": {
    "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "type": "company",
    "name": "Acme Corporation SRL",
    "cui": "98765432",
    "registrationNumber": "J40/1234/2020",
    "address": "Strada Exemplu 123",
    "city": "Bucharest",
    "country": "RO",
    "email": "billing@acme.example",
    "phone": "+40123456789"
  },
  "supplier": null,
  "documentSeries": {
    "id": "f8e7d6c5-b4a3-4c5d-9e8f-7a6b5c4d3e2f",
    "prefix": "FAC",
    "nextNumber": "FAC0002"
  },
  "lines": [
    {
      "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "position": 1,
      "description": "Web Development Services",
      "quantity": "10.0000",
      "unitPrice": "100.00",
      "unitOfMeasure": "hours",
      "vatRate": "21.00",
      "vatCategoryCode": "S",
      "vatAmount": "210.00",
      "lineTotal": "1000.00",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "productCode": "SRV-001",
      "productId": "9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f"
    }
  ],
  "attachments": [],
  "anafUploadId": null,
  "anafDownloadId": null,
  "anafStatus": null,
  "anafErrorMessage": null,
  "scheduledSendAt": null,
  "scheduledEmailAt": null,
  "cancelledAt": null,
  "cancellationReason": null
}
```

### Notes on the fields

| Field | Description |
|-------|-------------|
| `invoiceTypeCode` | One of the values listed in [Create invoice](/api-reference/invoices/create), or null |
| `supplier` | Set on received invoices; null on outgoing ones |
| `documentSeries.nextNumber` | The next number the series would assign, formatted with the prefix |
| `lines[].lineTotal` | Line amount before VAT |
| `attachments` | Files attached to a received invoice: each has `id`, `filename`, `mimeType`, `description` and `size`. Download one with [Download attachment](/api-reference/invoices/attachments) |
| `anafUploadId`, `anafDownloadId`, `anafStatus`, `anafErrorMessage` | e-Factura submission identifiers and the last error from ANAF |
| `overdueRemindersDisabled` | `true` when the automatic [overdue reminders](/concepts/overdue-reminders) skip this invoice. Change it with [Overdue reminders for an invoice](/api-reference/invoices/overdue-reminders) |
| `lastOverdueReminderDays`, `lastOverdueReminderAt` | The latest reminder step sent for this invoice (days after the due date) and when it was sent. Both are null until a reminder goes out |
| `scheduledSendAt` | When the automatic e-Factura submission is due, if one is scheduled |
| `refundInvoices` | Present when the invoice has credit notes or stornos: a list of `{id, number, issueDate, status}` for each of them |

The XML and PDF files are not part of the object; use [Download XML](/api-reference/invoices/xml) and [Download PDF](/api-reference/invoices/pdf).

## Error codes

Error bodies have the form `{"error": "message"}`.

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | The invoice belongs to another organization, or the user cannot view invoices |
| `404` | Invoice not found |
