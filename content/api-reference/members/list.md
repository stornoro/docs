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

Returns an array of member objects.

```json
[
  {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "isActive": true,
    "allowedCompanies": [
      "550e8400-e29b-41d4-a716-446655440000",
      "660e8400-e29b-41d4-a716-446655440001"
    ],
    "joinedAt": "2026-01-15T10:00:00Z"
  },
  {
    "uuid": "223e4567-e89b-12d3-a456-426614174001",
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "ACCOUNTANT",
    "isActive": true,
    "allowedCompanies": [
      "550e8400-e29b-41d4-a716-446655440000"
    ],
    "joinedAt": "2026-02-01T14:30:00Z"
  }
]
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| uuid | string | Unique member identifier |
| email | string | Member email address |
| firstName | string | Member first name |
| lastName | string | Member last name |
| role | string | Member role (see roles below) |
| isActive | boolean | Whether member is active |
| allowedCompanies | array | Array of company UUIDs member can access |
| joinedAt | string | ISO 8601 timestamp when member joined |

### Role Types

| Role | Description | Permissions |
|------|-------------|-------------|
| OWNER | Organization owner | Full access to all features and settings |
| ADMIN | Administrator | Manage members, companies, settings (cannot delete owner) |
| ACCOUNTANT | Accountant | Manage invoices, reports, sync (no member management) |
| EMPLOYEE | Employee | View-only access to assigned companies |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - insufficient permissions |

### Notes

- Only organization admins and owners can list members
- The `allowedCompanies` array controls which companies a member can access
- OWNER role members have access to all companies automatically
