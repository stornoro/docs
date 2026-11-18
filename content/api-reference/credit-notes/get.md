---
title: Get Credit Note
description: Retrieve the details of a credit note, including line items and the reference to the original invoice
method: GET
endpoint: /api/v1/invoices/{uuid}
---

# Get Credit Note

Retrieves a credit note with its line items, client and the reference to the original invoice. A credit note is an invoice with `documentType: "credit_note"`, so it is read with the invoice endpoint.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not used by this endpoint. The credit note is found by its id |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The id of the credit note |

## Request

```bash {% title="cURL" %}
curl -X GET https://api.storno.ro/api/v1/invoices/850e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/invoices/850e8400-e29b-41d4-a716-446655440000', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
const creditNote = await response.json();
```

## Response

The response is the invoice object itself, without a wrapper. Amounts are strings and dates are ISO 8601 date-times.

```json
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
  "documentSeries": {
    "id": "760e8400-e29b-41d4-a716-446655440000",
    "prefix": "CN",
    "nextNumber": "CN0006"
  },
  "client": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "type": "company",
    "name": "Client SRL",
    "cui": "87654321",
    "country": "RO",
    "email": "contact@client.ro"
  },
  "parentDocumentId": "650e8400-e29b-41d4-a716-446655440111",
  "parentDocumentNumber": "FAC0045",
  "parentDocumentDate": "2026-02-18",
  "issueDate": "2026-02-20T00:00:00+00:00",
  "dueDate": "2026-03-20T00:00:00+00:00",
  "currency": "RON",
  "invoiceTypeCode": null,
  "notes": "Partial refund - hosting services cancelled",
  "paymentTerms": "Immediate refund",
  "lines": [
    {
      "id": "910e8400-e29b-41d4-a716-446655440000",
      "position": 1,
      "description": "Hosting Services - Annual (CREDIT)",
      "quantity": "-1.0000",
      "unitOfMeasure": "service",
      "unitPrice": "1000.00",
      "vatRate": "19.00",
      "vatCategoryCode": "S",
      "vatAmount": "-190.00",
      "lineTotal": "-1000.00",
      "discount": "0.00",
      "discountPercent": "0.00",
      "vatIncluded": false,
      "productId": "460e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "subtotal": "-1000.00",
  "vatTotal": "-190.00",
  "discount": "0.00",
  "total": "-1190.00",
  "amountPaid": "-1190.00",
  "balance": "0.00",
  "paidAt": "2026-02-20T09:00:00+00:00",
  "anafUploadId": null,
  "anafDownloadId": null,
  "anafStatus": null,
  "anafErrorMessage": null,
  "cancelledAt": null,
  "scheduledSendAt": null,
  "payments": [],
  "attachments": []
}
```

## Response fields

Fields are the fields of the [invoice object](/api-reference/invoices/get). Those that matter for a credit note:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Credit note id |
| `number` | string | `DRAFT-xxxxxxxx` while it is a draft, the series number once issued |
| `documentType` | string | `credit_note` |
| `status` | string | `draft`, then `refund` once issued, then the e-Factura statuses after submission (`sent_to_provider`, `validated`, `rejected`). `cancelled` for a cancelled draft |
| `direction` | string | `outgoing` |
| `parentDocumentId` | string \| null | Id of the original invoice. Null when the credit note has no parent |
| `parentDocumentNumber` | string \| null | Number of the original invoice |
| `parentDocumentDate` | string \| null | Issue date of the original invoice (YYYY-MM-DD) |
| `documentSeries` | object | `id`, `prefix` and `nextNumber` (the next number of the series, as a string) |
| `client` | object | Client of the credit note |
| `subtotal`, `vatTotal`, `discount`, `total` | string | Amounts. Negative when the lines have negative quantities |
| `amountPaid`, `balance`, `paidAt` | string \| null | A credit note with a negative or zero total is settled: `amountPaid` equals `total`, `balance` is `"0.00"` and `paidAt` is set when it is issued |
| `anafUploadId`, `anafDownloadId`, `anafStatus`, `anafErrorMessage` | string \| null | e-Factura submission data |
| `scheduledSendAt` | string \| null | When the automatic submission to ANAF is scheduled, set on issue. See [Issue invoice](/api-reference/invoices/issue) |
| `lines` | array | Line items |
| `payments`, `attachments` | array | Present on the detail response |

### Line items

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Line id |
| `position` | integer | Display order |
| `description` | string | Line description |
| `quantity` | string | Negative when the line credits goods or services |
| `unitOfMeasure` | string | Unit of measure |
| `unitPrice` | string | Unit price |
| `vatRate` | string | VAT percentage |
| `vatCategoryCode` | string | UBL VAT category code |
| `vatAmount` | string | VAT of the line |
| `lineTotal` | string | Line amount without VAT |
| `discount` | string | Fixed discount |
| `discountPercent` | string | Discount percentage |
| `vatIncluded` | boolean | Whether the unit price includes VAT |
| `productId` | string \| null | Linked product id |

## Original invoice

`parentDocumentId`, `parentDocumentNumber` and `parentDocumentDate` identify the original invoice. Fetch it with `GET /api/v1/invoices/{parentDocumentId}`. On the original invoice, `refundInvoices` lists the documents created against it as an array of `{id, number, issueDate, status}`; the field is present only when there is at least one.

## Amount sign convention

Credit note amounts are negative: `subtotal`, `vatTotal` and `total` have a minus sign when the lines have negative quantities.

## Error codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | The invoice belongs to another organization or the user lacks the permission |
| `404` | `Invoice not found.` |
