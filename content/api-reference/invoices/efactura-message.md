---
title: Message the issuer of a received invoice
description: Send a message to the seller of a received e-Factura through SPV (ANAF RASP)
---

# Message the issuer of a received invoice

Sends a plain-text message to the issuer of a **received** e-Factura through ANAF SPV (standard `RASP`). ANAF delivers it to the seller attached to the invoice's upload index. Use it to dispute an invoice, ask for a corrected one or say that it is not yours. The invoice itself does not change; the message is stored as an `efactura_message_sent` event on the invoice.

```
POST /api/v1/invoices/{uuid}/efactura-message
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | UUID of the received invoice |

## Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | Plain text, 1–4000 characters |

## Prerequisites

- The invoice is a received one (`direction: incoming`) synced from SPV, so it carries an ANAF upload index (`anafUploadId`).
- The company has a valid e-Factura token (see [ANAF integration](/concepts/anaf-integration)).
- The caller has the `INVOICE_ISSUE` permission.

## Example

```bash
curl -X POST https://api.storno.ro/api/v1/invoices/{uuid}/efactura-message \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Factura nu ne apartine, va rugam sa o stornati."}'
```

## Response

```json
{
  "success": true,
  "uploadIndex": "4009876",
  "messageIndex": "5001234",
  "message": "Factura nu ne apartine, va rugam sa o stornati."
}
```

## Errors

| Status | Code | Meaning |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | `message` missing or longer than 4000 characters |
| 404 | — | Invoice not found in this company |
| 409 | `ANAF_TOKEN_REQUIRED` | No valid ANAF token for the company |
| 422 | `NOT_RECEIVED_INVOICE` | The invoice is an outgoing one |
| 422 | `NO_UPLOAD_INDEX` | The invoice was not synced from SPV, ANAF cannot route the message |
| 422 | `ANAF_REJECTED` | ANAF answered with an error (message included) |
| 502 | `ANAF_ERROR` | ANAF could not be reached |
