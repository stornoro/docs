---
title: Get supplier
description: Retrieve detailed information about a specific supplier including incoming invoice history.
---

# Get supplier

Retrieves a supplier with a paginated list of the incoming invoices received from its CIF.

```http
GET /api/v1/suppliers/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the supplier |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | UUID of the company context. The `company` query parameter is accepted as an alternative, and the header can be omitted when the organization has a single company. Routes addressed by UUID resolve the company from the record |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number for invoice history (default: 1) |
| `limit` | integer | No | Items per page for invoice history (default: 10, maximum: 20) |

## Response

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `supplier` | object | The supplier |
| `invoiceHistory` | array | Incoming invoices from this supplier, for the requested page. Empty when the supplier has no CIF |
| `invoiceCount` | integer | Total number of incoming invoices from this supplier |
| `invoiceTotal` | integer | Same value as `invoiceCount` |

### Supplier Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Supplier name |
| `cif` | string \| null | Tax identification number |
| `vatCode` | string \| null | Full VAT code with country prefix |
| `isVatPayer` | boolean | Whether the supplier is registered for VAT |
| `registrationNumber` | string \| null | Trade register number |
| `address` | string \| null | Street address |
| `city` | string \| null | City |
| `county` | string \| null | County |
| `country` | string | Country code (default: "RO") |
| `postalCode` | string \| null | Postal code |
| `email` | string \| null | Email address |
| `phone` | string \| null | Phone number |
| `bankName` | string \| null | Bank name |
| `bankAccount` | string \| null | Bank account (IBAN) |
| `notes` | string \| null | Internal notes |
| `source` | string | `anaf_sync` or `manual` |
| `lastSyncedAt` | string \| null | Timestamp of the last synchronization |
| `viesValid` | boolean \| null | VIES validation result |
| `affiliated` | boolean | Affiliated party flag |
| `vatStatusCheckedAt`, `vatRegistered`, `vatOnCollection`, `vatOnCollectionFrom`, `vatOnCollectionTo`, `inactive`, `efacturaRegistered`, `verificationNotes` | | Snapshot stored by [partner verification](/api-reference/clients/verify) |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/suppliers/c3d4e5f6-a7b8-9012-cdef-123456789012' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```json
{
  "supplier": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "Energie Exemplu SA",
    "cif": "12345678",
    "vatCode": "RO12345678",
    "isVatPayer": true,
    "registrationNumber": "J40/1234/2020",
    "address": "Bd. Exemplu, Nr. 74",
    "city": "Bucuresti Sectorul 3",
    "county": "Bucuresti",
    "country": "RO",
    "postalCode": "030823",
    "email": "relatii@energie.example",
    "phone": "+40210000000",
    "bankName": "Banca Exemplu",
    "bankAccount": "RO00EXAM0000000000000000",
    "notes": "Plata lunara prin debit direct",
    "source": "anaf_sync",
    "lastSyncedAt": "2026-02-10T10:15:00+02:00",
    "viesValid": null,
    "affiliated": false
  },
  "invoiceHistory": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "number": "2026/FAC00458",
      "issueDate": "2026-02-10",
      "total": "392.40",
      "currency": "RON",
      "status": "issued",
      "direction": "incoming"
    }
  ],
  "invoiceCount": 12,
  "invoiceTotal": 12
}
```

`invoiceHistory` items are invoice list objects, shown here with a subset of their fields.

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Supplier not found |

Error responses have the form `{"error": "message"}`.

## Related Endpoints

- [List suppliers](/api-reference/suppliers/list)
- [Update supplier](/api-reference/suppliers/update)
- [Delete supplier](/api-reference/suppliers/delete)
