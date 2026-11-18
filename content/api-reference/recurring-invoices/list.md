---
title: List recurring invoices
description: Retrieve a paginated list of recurring invoices with optional filtering.
---

# List recurring invoices

Retrieves a paginated list of recurring invoices for the company, newest first.

```http
GET /api/v1/recurring-invoices
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Conditional | UUID of the company. Optional when the organization has one company. `?company=` is accepted too |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10, values above 20 are reduced to 20) |
| `search` | string | No | Search term matched against the reference and the client name |
| `isActive` | boolean | No | Filter by active status (`true` or `false`) |
| `frequency` | string | No | One of `once`, `weekly`, `monthly`, `bimonthly`, `quarterly`, `semi_annually`, `yearly` |

## Response

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Recurring invoice objects |
| `total` | integer | Number of matching recurring invoices |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |

There is no page count; stop when `page * limit` reaches `total`.

### Recurring Invoice Object

Decimal amounts are strings and dates are ISO 8601 date-times. A list item has `id`, not `uuid`, and carries these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Recurring invoice UUID |
| `client` | object \| null | Embedded client with `id`, `name`, `cui` and `country` |
| `clientName` | string \| null | Client name |
| `reference` | string \| null | Human-readable reference |
| `isActive` | boolean | Whether generation is enabled |
| `documentType` | string | `invoice`, `credit_note` or `proforma` |
| `currency` | string | ISO 4217 currency code |
| `invoiceTypeCode` | string \| null | Invoice type copied to generated invoices |
| `frequency` | string | Generation frequency |
| `frequencyDay` | integer | Day of the week (weekly) or of the month |
| `nextIssuanceDate` | string \| null | Date of the next issuance |
| `lastIssuedAt` | string \| null | When the last document was generated |
| `lastInvoiceNumber` | string \| null | Number of the last generated document |
| `lastInvoiceId` | string \| null | Id of the last generated document |
| `lastDocumentType` | string \| null | `invoice` or `proforma` |
| `balance` | string \| null | Running balance |
| `balanceStep` | string \| null | Expression deducted per issuance |
| `subtotal`, `vatTotal`, `total` | string | Template totals |
| `estimatedSubtotal`, `estimatedVatTotal`, `estimatedTotal` | string | Totals with reference-currency lines converted at today's rate |

The other fields (notes, payment terms, due date, auto-email, penalties, `stopDate`, `frequencyMonth` and `lines`) are returned by [Get recurring invoice](/api-reference/recurring-invoices/get).

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/recurring-invoices?page=1&limit=10&isActive=true' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": [
    {
      "id": "rec-inv-uuid-1",
      "client": {
        "id": "client-uuid-1",
        "name": "Acme Corporation SRL",
        "cui": "12345678",
        "country": "RO"
      },
      "clientName": "Acme Corporation SRL",
      "reference": "MONTHLY-001",
      "isActive": true,
      "documentType": "invoice",
      "currency": "RON",
      "invoiceTypeCode": null,
      "frequency": "monthly",
      "frequencyDay": 1,
      "nextIssuanceDate": "2026-03-01T00:00:00+00:00",
      "lastIssuedAt": null,
      "lastInvoiceNumber": null,
      "lastInvoiceId": null,
      "lastDocumentType": null,
      "balance": null,
      "balanceStep": null,
      "subtotal": "1499.00",
      "vatTotal": "284.81",
      "total": "1783.81",
      "estimatedSubtotal": "1499.00",
      "estimatedVatTotal": "284.81",
      "estimatedTotal": "1783.81"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

## Errors

Errors have the form `{"error": "message"}`.

| Status | Description |
|--------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Missing permission |
| 404 | Company not found |

## Related Endpoints

- [Get recurring invoice](/api-reference/recurring-invoices/get)
- [Create recurring invoice](/api-reference/recurring-invoices/create)
- [Update recurring invoice](/api-reference/recurring-invoices/update)
