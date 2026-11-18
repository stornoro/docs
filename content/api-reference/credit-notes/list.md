---
title: List Credit Notes
description: Retrieve a paginated list of credit notes with optional filtering
method: GET
endpoint: /api/v1/invoices?type=credit_note
---

# List Credit Notes

Lists the credit notes of the company. Credit notes are invoices with `documentType: "credit_note"`, so they are listed with the invoice endpoint and the `type=credit_note` filter. Without `type` the endpoint returns every document.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request. Optional when the organization has a single company |

## Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | No | Send `credit_note` to list credit notes |
| `direction` | string | No | `outgoing` or `incoming` |
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10, maximum: 20; a larger value is reduced to 20) |
| `search` | string | No | Search in the number, client name, sender and receiver names and tax ids |
| `status` | string | No | A document status: `draft`, `issued`, `sent_to_provider`, `validated`, `rejected`, `cancelled`, `paid`, `partially_paid`, `overdue`, `converted`, `refund`, `refunded`, `synced`. An unknown value makes the request fail with `500` |
| `from` | string | No | Issue date from (YYYY-MM-DD). `dateFrom` is the same filter |
| `to` | string | No | Issue date to (YYYY-MM-DD). `dateTo` is the same filter |
| `clientId` | string | No | Filter by client id |
| `currency` | string | No | Filter by currency code |
| `isPaid` | boolean | No | `true` for documents with `paidAt` set, `false` for the others |
| `sort` | string | No | `number`, `issueDate` (default), `total`, `status`, `direction` or `createdAt` |
| `order` | string | No | `asc` or `desc` (default) |

There is no filter by parent invoice. The credit notes of one invoice are read from `refundInvoices` on the [invoice detail](/api-reference/credit-notes/get).

## Request

```bash {% title="cURL" %}
curl -X GET "https://api.storno.ro/api/v1/invoices?type=credit_note&direction=outgoing&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/invoices?type=credit_note&direction=outgoing&page=1&limit=10', {
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
      "id": "850e8400-e29b-41d4-a716-446655440000",
      "number": "CN0005",
      "documentType": "credit_note",
      "status": "refund",
      "direction": "outgoing",
      "senderName": "Your Company SRL",
      "senderCif": "12345678",
      "receiverName": "Client SRL",
      "receiverCif": "87654321",
      "client": {
        "id": "750e8400-e29b-41d4-a716-446655440000",
        "name": "Client SRL",
        "cui": "87654321",
        "isVatPayer": true,
        "country": "RO"
      },
      "clientName": "Client SRL",
      "parentDocumentId": "650e8400-e29b-41d4-a716-446655440111",
      "issueDate": "2026-02-20T00:00:00+00:00",
      "dueDate": "2026-03-20T00:00:00+00:00",
      "currency": "RON",
      "subtotal": "-1000.00",
      "vatTotal": "-190.00",
      "total": "-1190.00",
      "amountPaid": "-1190.00",
      "balance": "0.00",
      "paidAt": "2026-02-20T09:00:00+00:00",
      "paymentMethod": null,
      "invoiceTypeCode": null,
      "anafErrorMessage": null,
      "scheduledSendAt": null,
      "scheduledEmailAt": null,
      "cancelledAt": null,
      "isDuplicate": false,
      "isLateSubmission": false
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 10,
  "currency": "RON",
  "distinctCurrencies": ["RON"],
  "totals": {
    "subtotal": "-1000.00",
    "vatTotal": "-190.00",
    "total": "-1190.00",
    "receivable": "0.00",
    "payable": "0.00"
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Credit notes of the page |
| `total` | integer | Number of documents matching the filters |
| `page` | integer | Current page |
| `limit` | integer | Items per page |
| `currency` | string | The `currency` filter, or the company default currency |
| `distinctCurrencies` | array | Currencies used by the documents of the company |
| `totals` | object | Sums over all filtered documents, excluding cancelled ones: `subtotal`, `vatTotal`, `total`, `receivable`, `payable` |

There is no `pages` field. Compute the number of pages as `ceil(total / limit)`.

### Credit note object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Credit note id |
| `number` | string | Number, or `DRAFT-xxxxxxxx` for a draft |
| `documentType` | string | `credit_note` |
| `status` | string | Document status |
| `direction` | string | `outgoing` or `incoming` |
| `parentDocumentId` | string \| null | Id of the original invoice |
| `client`, `clientName` | object, string | Client summary and its name |
| `senderName`, `senderCif`, `receiverName`, `receiverCif` | string | Parties of the document |
| `issueDate`, `dueDate` | string | ISO 8601 date-times |
| `currency` | string | Currency code |
| `subtotal`, `vatTotal`, `total` | string | Amounts, negative for a credit note |
| `amountPaid`, `balance` | string | Settlement amounts |
| `paidAt`, `paymentMethod` | string \| null | Settlement data |
| `anafErrorMessage` | string \| null | e-Factura error, if any |
| `scheduledSendAt`, `scheduledEmailAt` | string \| null | Scheduled automatic submission and email |
| `cancelledAt` | string \| null | Set when cancelled |
| `isDuplicate`, `isLateSubmission` | boolean | e-Factura flags |

## Status values

A credit note starts as `draft`. Issuing it sets `refund` (and sets the original invoice to `refunded`). After submission to ANAF the status follows the invoice statuses: `sent_to_provider`, `validated`, `rejected`.

## Error codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | The user lacks the permission to view invoices |
| `404` | `Company not found.` |
| `500` | `status` or `type` has an unknown value |
