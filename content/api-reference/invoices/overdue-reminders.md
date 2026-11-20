---
title: Overdue reminders for an invoice
description: Turn the company's automatic overdue reminders off or back on for one invoice
---

# Overdue reminders for an invoice

Turns the company's automatic [overdue reminders](/concepts/overdue-reminders) off or back on for one invoice. Use it when a client has agreed a later payment date, or disputes the invoice, and the other invoices of that client should still be chased. To exclude every invoice of a client, set `overdueRemindersDisabled` on the client with [Update client](/api-reference/clients/update).

The call works on issued invoices, which [Update invoice](/api-reference/invoices/update) refuses. It changes nothing else on the invoice and sends no email.

```http
POST /api/v1/invoices/{uuid}/overdue-reminders
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
| `X-Company` | string | No | Not used on this route: the invoice is found by its UUID |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `enabled` | boolean | Yes | `false` stops the reminders for this invoice. `true` allows them again |

## Example Request

```bash
curl -X POST "https://api.storno.ro/api/v1/invoices/9f4a1c2e-.../overdue-reminders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

## Response

Returns the updated invoice (same shape as [Get invoice](/api-reference/invoices/get)). `overdueRemindersDisabled` is `true` after `enabled: false`.

Turning the reminders back on does not send the steps that passed in the meantime. The invoice gets the next step that falls due, or a step that fell due at most 2 days ago.

## Errors

| Status | Description |
|--------|-------------|
| `400` | `enabled` is missing or is not `true` or `false` |
| `403` | Missing `INVOICE_EDIT` permission |
| `404` | Invoice not found |
