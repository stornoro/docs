---
title: List Credit Notes
description: Retrieve a paginated list of credit notes with optional filtering
method: GET
endpoint: /api/v1/invoices?direction=outgoing&isCreditNote=true
---

# List Credit Notes

Retrieves a paginated list of credit notes for the authenticated company. Credit notes are special invoices that reverse or partially reverse original invoices. They share the same endpoint as invoices but are filtered using `isCreditNote=true`.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `direction` | string | Yes | Must be `outgoing` for credit notes |
| `isCreditNote` | boolean | Yes | Must be `true` to filter for credit notes |
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20, max: 100) |
| `search` | string | No | Search term for credit note number or client name |
| `status` | string | No | Filter by status: `draft`, `uploaded`, `validated`, `error` |
| `from` | string | No | Start date filter (ISO 8601 format: YYYY-MM-DD) |
| `to` | string | No | End date filter (ISO 8601 format: YYYY-MM-DD) |
| `clientId` | string | No | Filter by client UUID |
| `parentDocumentId` | string | No | Filter by parent invoice UUID |

## Request

```bash {% title="cURL" %}
curl -X GET "https://api.storno.ro/api/v1/invoices?direction=outgoing&isCreditNote=true&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/invoices?direction=outgoing&isCreditNote=true&page=1&limit=20', {
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
      "uuid": "850e8400-e29b-41d4-a716-446655440000",
      "number": "CN-2026-005",
      "direction": "outgoing",
      "isCreditNote": true,
      "seriesId": "750e8400-e29b-41d4-a716-446655440000",
      "series": {
        "uuid": "750e8400-e29b-41d4-a716-446655440000",
        "name": "CN",
        "nextNumber": 6,
        "prefix": "CN-",
        "year": 2026
      },
      "clientId": "750e8400-e29b-41d4-a716-446655440000",
      "client": {
        "uuid": "750e8400-e29b-41d4-a716-446655440000",
        "name": "Client SRL",
        "registrationNumber": "RO12345678",
        "address": "Str. Exemplu 123, București"
      },
      "parentDocumentId": "650e8400-e29b-41d4-a716-446655440111",
      "parentDocument": {
        "uuid": "650e8400-e29b-41d4-a716-446655440111",
        "number": "FAC-2026-045",
        "issueDate": "2026-02-18",
        "total": "8330.00"
      },
      "status": "uploaded",
      "anafStatus": "validated",
      "issueDate": "2026-02-20",
      "dueDate": "2026-03-20",
      "currency": "RON",
      "exchangeRate": 1.0,
      "subtotal": "-1000.00",
      "vatAmount": "-190.00",
      "total": "-1190.00",
      "notes": "Partial refund - hosting services cancelled",
      "anafUploadIndex": 2026000234,
      "createdAt": "2026-02-20T09:00:00Z",
      "updatedAt": "2026-02-20T10:15:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of credit note objects |
| `total` | integer | Total number of credit notes matching the filters |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `pages` | integer | Total number of pages |

### Credit Note Object

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier |
| `number` | string | Credit note number (e.g., CN-2026-005) |
| `isCreditNote` | boolean | Always `true` for credit notes |
| `direction` | string | Always `outgoing` for credit notes |
| `parentDocumentId` | string | UUID of the original invoice being credited |
| `parentDocument` | object | Details of the original invoice |
| `status` | string | Status: `draft`, `uploaded`, `validated`, `error` |
| `anafStatus` | string | ANAF validation status |
| `issueDate` | string | Date of issue (YYYY-MM-DD) |
| `dueDate` | string | Due date (YYYY-MM-DD) |
| `currency` | string | Currency code |
| `subtotal` | string | Negative subtotal amount |
| `vatAmount` | string | Negative VAT amount |
| `total` | string | Negative total amount |
| `client` | object | Client details |
| `series` | object | Series details |
| `anafUploadIndex` | integer \| null | ANAF upload index number |

## Credit Note Amounts

Credit notes have **negative amounts** to indicate they reverse the original invoice:
- `subtotal`, `vatAmount`, and `total` are negative
- Line item amounts are negative
- When applied, they reduce the client's outstanding balance

## Status Values

Credit notes use the same statuses as invoices:
- **draft** - Created but not yet uploaded to ANAF
- **uploaded** - Uploaded to ANAF, awaiting validation
- **validated** - ANAF validated the credit note
- **error** - ANAF validation failed

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 422 | `validation_error` | Invalid query parameters |
| 500 | `internal_error` | Server error occurred |

## Use Cases

### Full Refund
Credit note with same amount as original invoice (negative):
- Original invoice: 1,190.00 RON
- Credit note: -1,190.00 RON
- Net result: 0.00 RON

### Partial Refund
Credit note with portion of original amount:
- Original invoice: 8,330.00 RON
- Credit note: -1,190.00 RON (one line item)
- Net result: 7,140.00 RON

### Error Correction
Credit original invoice, issue new corrected invoice:
1. Credit note: -8,330.00 RON (reverses entire original)
2. New invoice: 8,530.00 RON (correct amount)
3. Net result: +200.00 RON difference

## Best Practices

1. **Always reference parent** - Link credit note to original invoice
2. **Include clear notes** - Explain reason for credit note
3. **Upload promptly** - Submit to ANAF within required timeframe
4. **Track against original** - Monitor total credited amount vs original
5. **Notify client** - Send credit note to client with explanation
6. **Update accounting** - Sync to accounting system for proper recording
