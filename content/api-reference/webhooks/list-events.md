---
title: List webhook event types
description: Retrieve the event types a webhook endpoint can subscribe to, with the payload of each event
method: GET
endpoint: /api/v1/webhooks/events
---

# List webhook event types

Returns the event types accepted when you create or update a webhook endpoint. The request needs a valid token. No company is required.

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

const { data, categories } = await response.json();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

`data` is the flat list of events. `categories` holds the same entries grouped by category. Descriptions are in Romanian.

```json
{
  "data": [
    {
      "event": "invoice.created",
      "category": "invoice",
      "description": "Factura noua creata"
    },
    {
      "event": "invoice.updated",
      "category": "invoice",
      "description": "Factura actualizata"
    }
  ],
  "categories": {
    "invoice": [
      {
        "event": "invoice.created",
        "category": "invoice",
        "description": "Factura noua creata"
      },
      {
        "event": "invoice.updated",
        "category": "invoice",
        "description": "Factura actualizata"
      }
    ]
  }
}
```

The example is shortened. The real response lists every event in the table below.

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Event objects |
| `data[].event` | string | Event name to use in the `events` array of a webhook endpoint |
| `data[].category` | string | `invoice`, `company`, `sync`, `payment` or `anaf` |
| `data[].description` | string | Short description |
| `categories` | object | The same events grouped by `category` |

## Events

The registry accepts 16 event names. Subscribe with these exact names. Wildcards such as `["*"]` are not accepted, and an unknown name is rejected with `400`.

The test endpoint also sends a `webhook.test` event. You do not subscribe to it.

{% callout type="warning" %}
`invoice.updated` is accepted when you subscribe, but Storno.ro never sends it as a webhook. An endpoint subscribed only to it receives nothing. It is published on the real-time channels only.
{% /callout %}

Every delivery uses the [envelope](/concepts/webhooks-events#webhook-payload-format) `{id, event, created_at, data}`. The `data` object depends on the event.

### Invoice events

`data` for `invoice.created`, `invoice.issued`, `invoice.validated`, `invoice.rejected` and `invoice.sent_to_provider`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Invoice UUID |
| `number` | string\|null | Invoice number |
| `status` | string | Invoice status |
| `direction` | string\|null | `outgoing` or `incoming` |
| `total` | string | Invoice total |
| `currency` | string | Currency code |

| Event | Sent when |
|-------|-----------|
| `invoice.created` | An invoice is created |
| `invoice.issued` | An invoice is issued |
| `invoice.sent_to_provider` | An invoice is submitted to the e-invoice provider |
| `invoice.validated` | The provider validates an outgoing invoice |
| `invoice.rejected` | The provider rejects an outgoing invoice |
| `invoice.updated` | Accepted on subscription, never sent |

### Company events

`data` for `company.created`, `company.updated`, `company.removed`, `company.restored` and `company.reset`:

| Field | Type | Description |
|-------|------|-------------|
| `companyId` | string | Company UUID |
| `companyName` | string | Company name |

### Sync events

| Event | Sent when | `data` |
|-------|-----------|--------|
| `sync.started` | An ANAF sync run starts | `total` (number of messages to process) |
| `sync.completed` | An ANAF sync run finishes | `stats` object with `newInvoices`, `skippedDuplicates`, `newClients`, `newProducts`, `newSeries`, `expired` and `errors` |
| `sync.error` | An ANAF sync run reports errors | `errors` (array of messages) and `companyId` |

### Payment events

| Event | Sent when | `data` |
|-------|-----------|--------|
| `payment.received` | A payment is recorded on an invoice through the API, or received through Stripe | `paymentId`, `invoiceId`, `amount`, `paymentMethod`, `currency` |

Some payments recorded automatically from Stripe also carry `invoice_number` and `companyId`.

### ANAF events

| Event | Sent when | `data` |
|-------|-----------|--------|
| `anaf.token_created` | An ANAF token is saved for the company | `tokenId`, `companyId` |

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
