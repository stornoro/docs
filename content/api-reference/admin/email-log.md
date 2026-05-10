---
title: Admin Email Log
description: Query lifecycle email delivery records (SUPER_ADMIN only)
---

# Admin Email Log

Query the lifecycle email delivery log. Records are written for every lifecycle email attempt regardless of outcome — sent, suppressed, or failed. Requires `ROLE_SUPER_ADMIN`.

---

## List Email Log Entries

```http
GET /api/v1/admin/email-log
```

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token (SUPER_ADMIN required) |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 25, max: 100) |
| category | string | No | Filter by email category (see categories below) |
| recipientEmail | string | No | Partial match on recipient email |
| userId | string | No | Filter by associated user UUID |
| status | string | No | Filter by status: `sent`, `failed`, `delivered`, `bounced` |
| dateFrom | string | No | ISO 8601 date lower bound, inclusive (e.g. `2026-05-01`) |
| dateTo | string | No | ISO 8601 date upper bound, inclusive (e.g. `2026-05-31`) |

### Email Categories

| Category | Trigger |
|----------|---------|
| `re_engagement` | User inactive 14+ days |
| `trial_expiration` | Trial ending in 7, 3, or 1 day |
| `dunning` | Subscription past_due (attempt 2 at 3d, attempt 3 at 7d) |
| `account_without_login` | Verified user with no login after 3 days |
| `first_company_created` | First company added within last 24h |
| `first_invoice_created` | First invoice issued within last 24h |
| `trial_ended` | Trial ended, no active subscription (variants: `1d`, `7d`, `30d`) |
| `feature_drip` | Trial-active org at day 3/7/10/14 of trial (variants: `efactura`, `anaf_lookup`, `contabil_user`, `mobile_app`) |

### Response

```json
{
  "data": [
    {
      "id": "01960000-0000-7000-8000-000000000001",
      "category": "trial_ended",
      "recipientEmail": "owner@example.com",
      "subject": "O saptamana de cand s-a terminat proba — mai esti interesat?",
      "status": "sent",
      "templateUsed": "7d",
      "errorMessage": null,
      "fromEmail": null,
      "sentBy": {
        "id": "01960000-0000-7000-8000-000000000002",
        "email": "owner@example.com"
      },
      "sentAt": "2026-05-10T09:01:34+03:00"
    },
    {
      "id": "01960000-0000-7000-8000-000000000003",
      "category": "feature_drip",
      "recipientEmail": "founder@company.ro",
      "subject": "e-Factura obligatorie — cum te ajuta Storno sa o rezolvi automat",
      "status": "sent",
      "templateUsed": "efactura",
      "errorMessage": null,
      "fromEmail": null,
      "sentBy": {
        "id": "01960000-0000-7000-8000-000000000004",
        "email": "founder@company.ro"
      },
      "sentAt": "2026-05-10T09:00:12+03:00"
    }
  ],
  "total": 842,
  "page": 1,
  "limit": 25
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID of the log entry |
| category | string | Email category |
| recipientEmail | string | Recipient email address |
| subject | string | Email subject line |
| status | string | Delivery status: `sent`, `failed`, `delivered`, `bounced` |
| templateUsed | string\|null | Variant identifier (e.g. `7d`, `efactura`, `skipped_gate`) |
| errorMessage | string\|null | Error detail when status is `failed` |
| fromEmail | string\|null | Sender address override if set |
| sentBy | object\|null | Associated user (usually the recipient) |
| sentAt | string | ISO 8601 timestamp |

### Status Values

| Status | Meaning |
|--------|---------|
| `sent` | Email was accepted by the mailer (includes gate-suppressed rows where `templateUsed = skipped_gate`) |
| `failed` | Mailer rejected the message or an exception occurred |
| `delivered` | SES/mailer confirmed delivery (requires webhook integration) |
| `bounced` | Hard or soft bounce reported by SES |

### Suppression Markers

When the gate (`LifecycleEmailGate`) suppresses a send, the row is written with `status: sent` and `templateUsed: skipped_gate`. This preserves a full audit trail without conflating suppressions with genuine delivery.

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized |
| 403 | Requires ROLE_SUPER_ADMIN |
