---
title: Sync invoices with client data
description: Resync all unsent invoices with the client's current profile data
---

# Sync invoices with client data

Rewrites all unsent invoices for a client with the client's current profile data (receiver name, CUI/CNP, buyer snapshot) and reapplies VAT rules (reverse charge / OSS).

Unlike the automatic propagation triggered by [updating a client](/api-reference/clients/update) — which only touches editable invoices from the **current month** — this endpoint also updates **older invoices**, as long as they:

- were not uploaded to ANAF (no upload ID, or were rejected), and
- are not cancelled or currently at the provider, and
- are not deleted.

Cached XML and PDF files for the affected invoices are invalidated, so the next download or e-Factura submission regenerates them with the corrected buyer data.

Typical use case: a client provided a wrong CUI, invoices were issued over several months with the wrong identification, and the invoices were never submitted to SPV. Correct the CUI on the client profile first, then call this endpoint to fix all unsent invoices at once.

```http
POST /api/v1/clients/{uuid}/sync-invoices
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

## Example Request

```bash
curl -X POST "https://api.storno.ro/api/v1/clients/9f4a1c2e-.../sync-invoices" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company: $COMPANY_ID"
```

## Response

```json
{
  "invoicesUpdated": 4
}
```

| Name | Type | Description |
|------|------|-------------|
| `invoicesUpdated` | integer | Number of invoices that were rewritten with the client's current data |

## Errors

| Status | Description |
|--------|-------------|
| `404` | Client not found |
| `403` | Missing `CLIENT_EDIT` permission |
| `422` | Client has no company |
