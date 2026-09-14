---
title: Admin User Activity
description: Who actually uses the platform, aggregated per user from the audit log (SUPER_ADMIN only)
---

# Admin User Activity

Aggregates the audit log per user over a rolling window so you can see who uses the platform regularly and who issues invoices continuously, rather than just who signed up. Requires `ROLE_SUPER_ADMIN`.

---

## Get Active Users

```http
GET /api/v1/admin/activity
```

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token (SUPER_ADMIN required) |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| days | integer | No | Window in days, counted from midnight (default: 30, max: 365) |
| limit | integer | No | Max users returned (default: 25, max: 100) |
| exclude | string | No | Comma-separated user emails to leave out, e.g. your own admin account |

Users are sorted by invoices issued, then invoices created, active days and total actions.

### Counters

| Field | Meaning |
|-------|---------|
| events | Audit log entries attributed to the user in the window |
| activeDays | Distinct calendar days with at least one action |
| invoicesCreated | Invoice `create` actions |
| invoicesIssued | Invoice status changes to `issued` |
| lastActiveAt | Newest audit entry |
| lastInvoiceAt | Newest invoice action |

Automated actions (queue workers, webhooks, scheduled commands) have no user and are not counted.

### Response

```json
{
  "days": 30,
  "since": "2026-08-15T00:00:00+00:00",
  "summary": { "activeUsers": 42, "invoicesCreated": 310, "invoicesIssued": 275 },
  "data": [
    {
      "user": {
        "id": "019d7dfe-ce72-7a04-8718-a7efe6492b42",
        "email": "user@example.com",
        "fullName": "Example User",
        "lastConnectedAt": "2026-09-14T08:12:00+00:00",
        "createdAt": "2026-04-11T19:22:24+00:00"
      },
      "organizations": [
        { "id": "019d7dfe-ccbf-7f53-a520-2069be95ed12", "name": "Example SRL", "plan": "professional", "role": "owner" }
      ],
      "events": 139,
      "activeDays": 18,
      "invoicesCreated": 27,
      "invoicesIssued": 25,
      "lastActiveAt": "2026-09-14T08:15:23+00:00",
      "lastInvoiceAt": "2026-09-14T08:15:23+00:00"
    }
  ]
}
```
