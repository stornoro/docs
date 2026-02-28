---
title: Get invoice details
description: Retrieve complete details for a specific invoice
---

# Get invoice details

Retrieves the complete details for a specific invoice, including all line items, events, payments, and attachments.

```
GET /api/v1/invoices/{uuid}
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

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

Returns the complete invoice object with all details.

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "number": "FAC-2024-001",
  "status": "issued",
  "direction": "outgoing",
  "currency": "RON",
  "exchangeRate": 1.0,
  "issueDate": "2024-02-15",
  "dueDate": "2024-03-15",
  "subtotal": 1000.00,
  "vatTotal": 190.00,
  "total": 1190.00,
  "amountPaid": 500.00,
  "balance": 690.00,
  "invoiceTypeCode": "380",
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
  "penaltyPercentPerDay": 0.05,
  "penaltyGraceDays": 5,
  "client": {
    "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "name": "Acme Corporation SRL",
    "cif": "RO98765432",
    "registrationNumber": "J40/1234/2020",
    "address": "Strada Exemplu 123",
    "city": "Bucharest",
    "country": "RO",
    "email": "billing@acme.ro",
    "phone": "+40123456789"
  },
  "supplier": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Your Company SRL",
    "cif": "RO12345678",
    "registrationNumber": "J40/5678/2019",
    "address": "Bulevardul Principal 456",
    "city": "Bucharest",
    "country": "RO",
    "email": "contact@yourcompany.ro",
    "phone": "+40987654321"
  },
  "series": {
    "id": "f8e7d6c5-b4a3-4c5d-9e8f-7a6b5c4d3e2f",
    "name": "FAC",
    "prefix": "FAC-2024-",
    "nextNumber": 2
  },
  "lines": [
    {
      "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "description": "Web Development Services",
      "quantity": 10.0,
      "unitPrice": 100.00,
      "unitOfMeasure": "hours",
      "vatRate": 19.0,
      "vatAmount": 190.00,
      "subtotal": 1000.00,
      "total": 1190.00,
      "discount": 0.00,
      "discountPercent": 0.00,
      "vatIncluded": false,
      "productCode": "SRV-001",
      "product": {
        "id": "9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f",
        "name": "Web Development",
        "code": "SRV-001"
      }
    }
  ],
  "payments": [
    {
      "id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
      "amount": 500.00,
      "paymentDate": "2024-02-20",
      "paymentMethod": "bank_transfer",
      "notes": "Partial payment received",
      "createdAt": "2024-02-20T10:30:00Z"
    }
  ],
  "events": [
    {
      "id": "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
      "type": "status_change",
      "status": "issued",
      "timestamp": "2024-02-15T09:00:00Z",
      "details": "Invoice issued successfully",
      "user": "John Doe"
    }
  ],
  "attachments": [
    {
      "id": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
      "filename": "contract.pdf",
      "mimeType": "application/pdf",
      "size": 245678,
      "uploadedAt": "2024-02-15T08:45:00Z"
    }
  ],
  "xmlGenerated": true,
  "xmlPath": "/storage/invoices/2024/02/7c9e6679-xml.xml",
  "pdfGenerated": true,
  "pdfPath": "/storage/invoices/2024/02/7c9e6679-pdf.pdf",
  "anafSubmissionId": "ANAF-2024-123456",
  "anafDownloadId": "DL-987654",
  "anafValidationErrors": null,
  "createdAt": "2024-02-15T08:30:00Z",
  "updatedAt": "2024-02-20T10:30:00Z"
}
```

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Invoice not found |
