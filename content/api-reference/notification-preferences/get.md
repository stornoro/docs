---
title: Get Notification Preferences
description: Retrieve user notification preferences
---

# Get Notification Preferences

Retrieve notification preferences for the authenticated user.

---

## Get Preferences

```http
GET /api/v1/notification-preferences
```

Get the user's notification preferences including channel preferences for each notification type.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

One entry per event type, 23 in total. Event types without a saved preference return the defaults.

```json
{
  "data": [
    {
      "eventType": "invoice.validated",
      "emailEnabled": true,
      "inAppEnabled": true,
      "pushEnabled": true,
      "telegramEnabled": false,
      "whatsappEnabled": false,
      "smsEnabled": false
    },
    {
      "eventType": "invoice.rejected",
      "emailEnabled": true,
      "inAppEnabled": true,
      "pushEnabled": true,
      "telegramEnabled": false,
      "whatsappEnabled": false,
      "smsEnabled": false
    }
  ]
}
```

The example is shortened. The real response has an entry for every event type below.

### Response fields

| Field | Type | Description |
|-------|------|-------------|
| eventType | string | Event type, see the table below |
| emailEnabled | boolean | Send email notifications |
| inAppEnabled | boolean | Show in-app notifications |
| pushEnabled | boolean | Send push notifications |
| telegramEnabled | boolean | Send Telegram notifications |
| whatsappEnabled | boolean | Send WhatsApp notifications |
| smsEnabled | boolean | Send SMS notifications |

### Event types

| Event type | Description |
|------------|-------------|
| `invoice.validated` | An outgoing invoice was validated |
| `invoice.rejected` | An outgoing invoice was rejected |
| `invoice.due_soon` | An invoice is due soon |
| `invoice.due_today` | An invoice is due today |
| `invoice.overdue` | An invoice is overdue |
| `proforma.expiring_soon` | A proforma is about to expire |
| `proforma.expired` | A proforma expired |
| `sync.error` | An ANAF sync reported errors |
| `efactura.new_documents` | New e-invoice documents were received |
| `spv.document_received` | A document arrived in SPV |
| `spv.new_documents` | New SPV documents were synced |
| `spv.unpaid_balance` | SPV reports an unpaid balance |
| `token.expiring_soon` | An ANAF token needs re-authorization soon |
| `token.refresh_failed` | An ANAF token could not be refreshed |
| `fiscal.deadline` | A fiscal deadline is near |
| `declaration.draft_ready` | A declaration draft is ready |
| `declaration.payment_due` | A declaration payment is due |
| `partner.status_changed` | The fiscal status of a partner changed |
| `expiry.due` | A tracked expiry is due |
| `export_ready` | An export is ready |
| `report.monthly_summary` | The monthly summary is ready |
| `backup_ready` | A backup is ready |
| `restore_completed` | A restore finished |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |

### Notes

- Default preferences apply until a user changes them
- Preferences are stored per user, not per organization
