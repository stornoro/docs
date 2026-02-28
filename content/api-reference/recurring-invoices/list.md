---
title: List recurring invoices
description: Retrieve a paginated list of recurring invoices with optional filtering.
---

# List recurring invoices

Retrieves a paginated list of recurring invoices for the authenticated company. Results can be filtered by status, frequency, and search terms.

```http
GET /api/v1/recurring-invoices
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20, max: 100) |
| `search` | string | No | Search term to filter by reference or notes |
| `isActive` | boolean | No | Filter by active status (true/false) |
| `frequency` | string | No | Filter by frequency: `weekly`, `biweekly`, `monthly`, `bimonthly`, `quarterly`, `semiannual`, `annual` |

## Response

Returns a paginated list of recurring invoice objects.

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of recurring invoice objects |
| `total` | integer | Total number of matching recurring invoices |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `pages` | integer | Total number of pages |

### Recurring Invoice Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `reference` | string | Human-readable reference |
| `clientId` | string | UUID of the client |
| `clientName` | string | Client display name |
| `seriesId` | string | UUID of the document series |
| `seriesPrefix` | string | Series prefix for generated invoices |
| `documentType` | string | `invoice` or `credit_note` |
| `currency` | string | ISO 4217 currency code |
| `invoiceTypeCode` | string | e-Factura invoice type code |
| `frequency` | string | Generation frequency |
| `frequencyDay` | integer | Day of month for generation (1-31) |
| `frequencyMonth` | integer | Month for annual generation (1-12) |
| `nextIssuanceDate` | string | ISO 8601 date of next generation |
| `stopDate` | string \| null | ISO 8601 date to stop generation |
| `dueDateType` | string | `fixed` or `relative` |
| `dueDateDays` | integer \| null | Days after issue for relative due date |
| `dueDateFixedDay` | integer \| null | Fixed day of month (1-31) |
| `isActive` | boolean | Whether generation is enabled |
| `notes` | string \| null | Internal notes |
| `paymentTerms` | string \| null | Payment terms text |
| `autoEmailEnabled` | boolean | Auto-send email on generation |
| `autoEmailTime` | string \| null | Time to send (HH:mm) |
| `autoEmailDayOffset` | integer | Days offset for email sending |
| `penaltyEnabled` | boolean | Late payment penalty enabled |
| `penaltyPercentPerDay` | number \| null | Daily penalty percentage |
| `penaltyGraceDays` | integer \| null | Grace period before penalties |
| `totalAmount` | number | Template total amount |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/recurring-invoices?page=1&limit=20&isActive=true' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "data": [
    {
      "uuid": "rec-inv-uuid-1",
      "reference": "MONTHLY-001",
      "clientId": "client-uuid-1",
      "clientName": "Acme Corporation SRL",
      "seriesId": "series-uuid-1",
      "seriesPrefix": "FRE",
      "documentType": "invoice",
      "currency": "RON",
      "invoiceTypeCode": "380",
      "frequency": "monthly",
      "frequencyDay": 1,
      "frequencyMonth": null,
      "nextIssuanceDate": "2026-03-01",
      "stopDate": null,
      "dueDateType": "relative",
      "dueDateDays": 30,
      "dueDateFixedDay": null,
      "isActive": true,
      "notes": "Monthly hosting services",
      "paymentTerms": "Payment due within 30 days",
      "autoEmailEnabled": true,
      "autoEmailTime": "09:00",
      "autoEmailDayOffset": 0,
      "penaltyEnabled": true,
      "penaltyPercentPerDay": 0.05,
      "penaltyGraceDays": 5,
      "totalAmount": 1499.00,
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-02-10T14:20:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 422 | validation_error | Invalid query parameters |

## Related Endpoints

- [Get recurring invoice](/api-reference/recurring-invoices/get)
- [Create recurring invoice](/api-reference/recurring-invoices/create)
- [Update recurring invoice](/api-reference/recurring-invoices/update)
