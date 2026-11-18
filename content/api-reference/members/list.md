---
title: List Organization Members
description: List all members of the organization with permissions
---

# List Organization Members

Retrieve a list of all members in the organization with their roles and permissions.

---

## Get Members

```http
GET /api/v1/members
```

Get all organization members with permission metadata.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns the members under `data`, and counters under `meta`.

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174009",
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "lastConnectedAt": "2026-02-16T09:00:00+00:00"
      },
      "role": "admin",
      "isActive": true,
      "joinedAt": "2026-01-15T10:00:00+00:00",
      "allowedCompanies": [],
      "isCurrentUser": false,
      "isSuperAdmin": false,
      "permissions": [],
      "hasCustomPermissions": false
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "user": {
        "id": "223e4567-e89b-12d3-a456-426614174009",
        "email": "jane.smith@example.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "lastConnectedAt": "2026-02-16T09:00:00+00:00"
      },
      "role": "accountant",
      "isActive": true,
      "joinedAt": "2026-01-15T10:00:00+00:00",
      "allowedCompanies": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Example Company SRL",
          "cif": "12345678"
        }
      ],
      "isCurrentUser": false,
      "isSuperAdmin": false,
      "permissions": [],
      "hasCustomPermissions": false
    }
  ],
  "meta": {
    "canManage": true,
    "maxUsers": 5,
    "currentCount": 2
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Membership UUID. Use it as `{uuid}` in the update and deactivate endpoints |
| user | object | `id`, `email`, `firstName`, `lastName` and `lastConnectedAt` of the user |
| role | string | Member role (see roles below) |
| isActive | boolean | Whether member is active |
| joinedAt | string | ISO 8601 timestamp when member joined |
| allowedCompanies | array | Companies the member can access, each with `id`, `name` and `cif` |
| isCurrentUser | boolean | Whether the member is the authenticated user |
| isSuperAdmin | boolean | Whether the user is a platform super administrator |
| permissions | string[] | Custom permissions of the member. Empty when the role defaults apply |
| hasCustomPermissions | boolean | Whether `permissions` overrides the role defaults |
| meta.canManage | boolean | Whether the authenticated user can manage members |
| meta.maxUsers | integer | Seat limit of the plan |
| meta.currentCount | integer | Number of active members |

### Role Types

| Role | Description | Permissions |
|------|-------------|-------------|
| owner | Organization owner | Full access to all features and settings |
| admin | Administrator | Manage members, companies, settings (cannot delete owner) |
| accountant | Accountant | Manage invoices, reports, sync (no member management) |
| employee | Employee | View-only access to assigned companies |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 404 | No organization found |

### Notes

- Any member of the organization can list members. `meta.canManage` tells whether the caller can change them
- The `allowedCompanies` array controls which companies an accountant or employee can access
- Owners and admins have access to all companies automatically
