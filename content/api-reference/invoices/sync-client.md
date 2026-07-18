---
title: Sync invoice with client data
description: Resync a single invoice with its client's current profile data
---

# Sync invoice with client data

Rewrites the invoice's receiver identity (name, CUI/CNP, buyer snapshot) from the linked client's **current** profile data and reapplies VAT rules (reverse charge / OSS). Cached XML and PDF files are invalidated, so the next download or e-Factura submission regenerates them with the corrected data.

The invoice must still be editable:

- not uploaded to ANAF (no upload ID), or rejected by ANAF, and
- not cancelled or currently at the provider.

Typical use case: a client's CUI was corrected after the invoice was issued, and you want to fix this one invoice before submitting it to SPV — without touching the client's other invoices. To resync all unsent invoices of a client at once, use [Sync invoices with client data](/api-reference/clients/sync-invoices).

```http
POST /api/v1/invoices/{uuid}/sync-client
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the invoice |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

## Example Request

```bash
curl -X POST "https://api.storno.ro/api/v1/invoices/9f4a1c2e-.../sync-client" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company: $COMPANY_ID"
```

## Response

Returns the updated invoice (same shape as [Get invoice](/api-reference/invoices/get)).

## Errors

| Status | Description |
|--------|-------------|
| `404` | Invoice not found |
| `403` | Missing `INVOICE_EDIT` permission |
| `422` | Invoice has no linked client, or was already submitted to ANAF |
