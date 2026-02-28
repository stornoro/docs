---
title: Quickstart
description: Make your first API call to the Storno.ro API in under 5 minutes.
---

# Quickstart

This guide walks you through making your first API call — from authentication to creating an invoice.

## Prerequisites

- An Storno.ro account ([register here](https://app.storno.ro/register))
- At least one company added to your account
- A valid e-invoice provider token (e.g., ANAF for Romania) if you plan to submit electronically

## Step 1: Authenticate

```bash
curl -X POST https://api.storno.ro/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

Save the `token` from the response. You'll use it in all subsequent requests.

## Step 2: List Your Companies

```bash
curl https://api.storno.ro/api/v1/companies \
  -H "Authorization: Bearer {token}"
```

**Response:**

```json
[
  {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "SC Firma Mea SRL",
    "cif": "RO12345678",
    "syncEnabled": true
  }
]
```

Save the company `uuid` — you'll use it as the `X-Company` header.

## Step 3: Get Invoice Defaults

Before creating an invoice, fetch the available options (VAT rates, currencies, payment methods, etc.):

```bash
curl https://api.storno.ro/api/v1/invoice-defaults \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

This returns VAT rates, currencies, units of measure, payment terms, and payment methods configured for your company.

## Step 4: Create an Invoice

```bash
curl -X POST https://api.storno.ro/api/v1/invoices \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "{client_uuid}",
    "seriesId": "{series_uuid}",
    "issueDate": "2026-01-15",
    "dueDate": "2026-02-15",
    "currency": "RON",
    "lines": [
      {
        "name": "Servicii consultanță IT",
        "quantity": 10,
        "unitPrice": 500,
        "vatRateId": "{vat_rate_uuid}",
        "unit": "ore"
      }
    ]
  }'
```

**Response:**

```json
{
  "uuid": "7a1b2c3d-4e5f-6789-abcd-ef0123456789",
  "number": "FACT-001",
  "status": "draft",
  "totalWithoutVat": 5000,
  "totalVat": 950,
  "totalWithVat": 5950,
  "currency": "RON"
}
```

## Step 5: Issue the Invoice

Issuing validates the invoice, generates the XML, and optionally schedules e-invoice submission:

```bash
curl -X POST https://api.storno.ro/api/v1/invoices/{uuid}/issue \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

## Step 6: Check Invoice Status

```bash
curl https://api.storno.ro/api/v1/invoices/{uuid} \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

The invoice `status` will progress through: `draft` → `issued` → `sent` → `delivered` (or `error`).

## Next Steps

- [Authentication](/getting-started/authentication) — Learn about token refresh and OAuth
- [Error Handling](/getting-started/errors) — Understand error responses
- [Multi-Tenancy](/concepts/multi-tenancy) — How organizations and companies work
- [Invoice Object](/objects/invoice) — Full invoice field reference
