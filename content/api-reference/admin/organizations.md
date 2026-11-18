---
title: Admin Organization Management
description: List organizations (SUPER_ADMIN only)
---

# Admin Organization Management

List organizations with administrative privileges. This endpoint is restricted to SUPER_ADMIN users.

---

## List All Organizations

```http
GET /api/v1/admin/organizations
```

Get a paginated, searchable list of all organizations on the platform, newest first.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token (SUPER_ADMIN required) |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10, max: 20, larger values are clamped) |
| search | string | No | Partial match on organization name or slug |

### Response

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corporation SRL",
      "slug": "acme-corporation-srl-a1b2c3",
      "plan": "professional",
      "isActive": true,
      "memberCount": 5,
      "companyCount": 2,
      "maxUsers": 10,
      "maxCompanies": 10,
      "trialEndsAt": null,
      "createdAt": "2026-01-15T10:00:00+00:00"
    }
  ],
  "total": 456,
  "page": 1,
  "limit": 10
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of organization objects |
| total | integer | Total organizations matching the search |
| page | integer | Current page |
| limit | integer | Items per page, after clamping |

#### Organization Object

| Field | Type | Description |
|-------|------|-------------|
| id | string | Organization UUID |
| name | string | Organization name |
| slug | string | Organization slug |
| plan | string | Stored plan name, for example `freemium`, `starter`, `professional` or `business` |
| isActive | boolean | `false` when the organization is suspended |
| memberCount | integer | Number of memberships |
| companyCount | integer | Number of companies |
| maxUsers | integer | User limit of the effective plan |
| maxCompanies | integer | Company limit of the effective plan |
| trialEndsAt | string\|null | End of the trial |
| createdAt | string | Creation timestamp |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized, invalid authentication |
| 403 | Forbidden, requires SUPER_ADMIN role |
