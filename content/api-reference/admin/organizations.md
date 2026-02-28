---
title: Admin Organization Management
description: Manage organizations (SUPER_ADMIN only)
---

# Admin Organization Management

View and manage organizations with administrative privileges. This endpoint is restricted to SUPER_ADMIN users.

---

## List All Organizations

```http
GET /api/v1/admin/organizations
```

Get a paginated, searchable list of all organizations on the platform.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token (SUPER_ADMIN required) |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 50, max: 200) |
| search | string | No | Search by organization name or owner |
| status | string | No | Filter by status: `active`, `trial`, `suspended` |
| plan | string | No | Filter by plan type |

### Response

```json
{
  "data": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corporation SRL",
      "owner": {
        "uuid": "123e4567-e89b-12d3-a456-426614174000",
        "email": "john.doe@example.com",
        "name": "John Doe"
      },
      "plan": {
        "name": "Professional",
        "status": "active",
        "expiresAt": "2027-01-15T00:00:00Z"
      },
      "status": "active",
      "memberCount": 5,
      "companyCount": 2,
      "invoiceCount": 234,
      "hasValidAnafToken": true,
      "lastSyncAt": "2026-02-16T11:30:00Z",
      "createdAt": "2026-01-15T10:00:00Z"
    },
    {
      "uuid": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Beta Testing SRL",
      "owner": {
        "uuid": "223e4567-e89b-12d3-a456-426614174001",
        "email": "jane.smith@example.com",
        "name": "Jane Smith"
      },
      "plan": {
        "name": "Free Trial",
        "status": "trial",
        "expiresAt": "2026-02-23T00:00:00Z"
      },
      "status": "trial",
      "memberCount": 2,
      "companyCount": 1,
      "invoiceCount": 12,
      "hasValidAnafToken": false,
      "lastSyncAt": null,
      "createdAt": "2026-02-09T14:00:00Z"
    }
  ],
  "total": 456,
  "page": 1,
  "limit": 50,
  "pages": 10
}
```

### Response Fields

#### Pagination
| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of organization objects |
| total | integer | Total organizations |
| page | integer | Current page |
| limit | integer | Items per page |
| pages | integer | Total pages |

#### Organization Object
| Field | Type | Description |
|-------|------|-------------|
| uuid | string | Organization UUID |
| name | string | Organization name |
| owner | object | Owner details |
| owner.uuid | string | Owner UUID |
| owner.email | string | Owner email |
| owner.name | string | Owner full name |
| plan | object | Subscription plan details |
| plan.name | string | Plan name |
| plan.status | string | Plan status |
| plan.expiresAt | string\|null | Plan expiration date |
| status | string | Organization status |
| memberCount | integer | Number of members |
| companyCount | integer | Number of companies |
| invoiceCount | integer | Total invoices |
| hasValidAnafToken | boolean | Has valid ANAF token |
| lastSyncAt | string\|null | Last sync timestamp |
| createdAt | string | Creation timestamp |

### Status Values

| Status | Description |
|--------|-------------|
| active | Active with valid subscription |
| trial | On free trial period |
| suspended | Account suspended |
| expired | Subscription expired |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - requires SUPER_ADMIN role |
| 422 | Invalid query parameters |

### Notes

- Organizations are sorted by creation date (newest first) by default
- Search searches both organization name and owner name/email
- Statistics are calculated in real-time
- Use pagination for performance with large datasets
- All actions are logged for audit purposes
