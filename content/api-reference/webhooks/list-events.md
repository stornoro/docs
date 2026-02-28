---
title: List webhook event types
description: Retrieve all available webhook event types that can be subscribed to
method: GET
endpoint: /api/v1/webhooks/events
---

# List webhook event types

Returns an array of all supported webhook event types available for subscription. Use this endpoint to discover which events can be configured on a webhook endpoint. Authentication requires a valid JWT token; no company scope is needed.

```
GET /api/v1/webhooks/events
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl https://api.storno.ro/api/v1/webhooks/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/webhooks/events', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const events = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns an array of event type objects describing each available event.

```json
[
  {
    "name": "invoice.created",
    "description": "Triggered when a new invoice is created, including those synced from ANAF",
    "category": "invoices"
  },
  {
    "name": "invoice.updated",
    "description": "Triggered when an invoice is updated (status change, data edit, payment recorded)",
    "category": "invoices"
  },
  {
    "name": "invoice.issued",
    "description": "Triggered when an invoice transitions to the issued state",
    "category": "invoices"
  },
  {
    "name": "invoice.submitted",
    "description": "Triggered when an invoice is submitted to ANAF e-Factura",
    "category": "invoices"
  },
  {
    "name": "invoice.validated",
    "description": "Triggered when ANAF validates an outgoing invoice",
    "category": "invoices"
  },
  {
    "name": "invoice.rejected",
    "description": "Triggered when ANAF rejects an outgoing invoice",
    "category": "invoices"
  },
  {
    "name": "invoice.cancelled",
    "description": "Triggered when an invoice is cancelled",
    "category": "invoices"
  },
  {
    "name": "invoice.paid",
    "description": "Triggered when a payment is recorded and the invoice is fully paid",
    "category": "invoices"
  },
  {
    "name": "payment.created",
    "description": "Triggered when a payment record is created on an invoice",
    "category": "payments"
  },
  {
    "name": "payment.deleted",
    "description": "Triggered when a payment record is removed from an invoice",
    "category": "payments"
  },
  {
    "name": "client.created",
    "description": "Triggered when a new client is added to the company",
    "category": "clients"
  },
  {
    "name": "client.updated",
    "description": "Triggered when a client record is updated",
    "category": "clients"
  },
  {
    "name": "sync.completed",
    "description": "Triggered when an ANAF sync run finishes successfully",
    "category": "sync"
  },
  {
    "name": "sync.failed",
    "description": "Triggered when an ANAF sync run encounters a fatal error",
    "category": "sync"
  },
  {
    "name": "proforma.created",
    "description": "Triggered when a new proforma invoice is created",
    "category": "proforma"
  },
  {
    "name": "proforma.accepted",
    "description": "Triggered when a proforma invoice is accepted by the client",
    "category": "proforma"
  },
  {
    "name": "proforma.rejected",
    "description": "Triggered when a proforma invoice is rejected by the client",
    "category": "proforma"
  }
]
```

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique event type identifier used when subscribing to events |
| `description` | string | Human-readable description of when the event fires |
| `category` | string | Logical grouping of the event (invoices, payments, clients, sync, proforma) |

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
