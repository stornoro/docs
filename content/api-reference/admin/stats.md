---
title: Admin Platform Statistics
description: Get platform-wide counts (SUPER_ADMIN only)
---

# Admin Platform Statistics

Get the number of users, organizations and companies on the platform. This endpoint is restricted to SUPER_ADMIN users.

---

## Get Platform Stats

```http
GET /api/v1/admin/stats
```

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication (SUPER_ADMIN required) |

### Response

```json
{
  "users": 1523,
  "organizations": 456,
  "companies": 892
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| users | integer | Total number of users |
| organizations | integer | Total number of organizations |
| companies | integer | Total number of companies |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized, invalid authentication |
| 403 | Forbidden, requires SUPER_ADMIN role |
