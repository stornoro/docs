---
title: Admin Audit Log
description: Browse platform-wide audit log entries with filters and exclusions (SUPER_ADMIN only)
---

# Admin Audit Log

Every create, update, delete and impersonate action on the platform is recorded in the audit log with the acting user, IP address and the changed fields. This endpoint lists those entries across all organizations. Requires `ROLE_SUPER_ADMIN`.

---

## List Audit Log Entries

```http
GET /api/v1/admin/audit-logs
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
| search | string | No | Partial match on entity type, entity id or user email |
| action | string | No | `create`, `update`, `delete` or `impersonate` |
| entityType | string | No | Entity short name, e.g. `Invoice`, `Client`, `Company`, `User` |
| exclude | string | No | Comma-separated user emails to hide. Add the keyword `system` to also hide rows without a user (workers, webhooks, CLI). Example: `contact@example.com,system` |

Entries are ordered newest first. Rows without a user are automated actions (queue workers, webhooks, CLI commands); the `userAgent` field tells them apart (`system:worker`, `system:cli:<command>`, `system:webhook:<provider>`).

### Response

```json
{
  "data": [
    {
      "id": "01a09fd8-aa08-711d-9637-841aa6cb4ad6",
      "action": "update",
      "entityType": "Invoice",
      "entityId": "01a09fd8-aa21-7f37-9a7c-214064fa82cc",
      "changes": { "status": { "old": "draft", "new": "issued" } },
      "ipAddress": "203.0.113.10",
      "userAgent": "Mozilla/5.0 ...",
      "user": { "id": "019d7dfe-ce72-7a04-8718-a7efe6492b42", "email": "user@example.com", "fullName": "Example User" },
      "createdAt": "2026-09-14T15:16:11+03:00"
    }
  ],
  "total": 362587,
  "page": 1,
  "limit": 25
}
```

### Example

Hide your own account and automated actions, show only invoice changes:

```bash
curl "https://api.storno.ro/api/v1/admin/audit-logs?entityType=Invoice&exclude=contact@example.com,system" \
  -H "Authorization: Bearer $TOKEN"
```
