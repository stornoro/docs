---
title: Get client
description: Retrieve detailed information about a specific client including document history.
---

# Get client

Retrieves detailed information about a specific client, including paginated invoice history, delivery note history, and receipt history.

```http
GET /api/v1/clients/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the client |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number for invoice history (default: 1) |
| `limit` | integer | No | Items per page for invoice history (default: 50, max: 200) |

## Response

Returns the full client object with document history.

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `client` | object | Full [client object](/objects/client) with all detail fields |
| `invoiceHistory` | array | Paginated array of outgoing invoices for this client |
| `invoiceTotal` | integer | Total number of outgoing invoices |
| `invoiceCount` | integer | Total invoice count |
| `deliveryNoteHistory` | array | Recent delivery notes (last 5) |
| `deliveryNoteCount` | integer | Total delivery note count |
| `receiptHistory` | array | Recent receipts (last 5) |
| `receiptCount` | integer | Total receipt count |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/clients/b2c3d4e5-f6a7-8901-bcde-f12345678901' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "client": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "type": "company",
    "name": "Acme Corporation SRL",
    "cui": "12345678",
    "cnp": null,
    "vatCode": "RO12345678",
    "isVatPayer": true,
    "registrationNumber": "J40/1234/2020",
    "address": "Strada Exemplu, nr. 10",
    "city": "Bucuresti Sectorul 1",
    "county": "Bucuresti",
    "country": "RO",
    "postalCode": "010101",
    "email": "billing@acme.ro",
    "phone": "+40 21 123 4567",
    "bankName": "Banca Transilvania",
    "bankAccount": "RO49AAAA1B31007593840000",
    "defaultPaymentTermDays": 30,
    "contactPerson": "Ion Popescu",
    "notes": null,
    "source": "manual",
    "viesValid": null,
    "viesValidatedAt": null,
    "viesName": null,
    "lastSyncedAt": null,
    "createdAt": "2025-06-10T09:00:00+02:00",
    "updatedAt": "2026-02-10T14:30:00+02:00"
  },
  "invoiceHistory": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "number": "FAC0245",
      "issueDate": "2026-02-10",
      "total": "2380.00",
      "currency": "RON",
      "status": "issued",
      "direction": "outgoing"
    }
  ],
  "invoiceTotal": 24,
  "invoiceCount": 24,
  "deliveryNoteHistory": [],
  "deliveryNoteCount": 0,
  "receiptHistory": [],
  "receiptCount": 0
}
```

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Client not found |

## Related Endpoints

- [List clients](/api-reference/clients/list)
- [Update client](/api-reference/clients/update)
- [Delete client](/api-reference/clients/delete)
