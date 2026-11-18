---
title: Update Organization Member
description: Update member role and permissions
---

# Update Organization Member

Update a member's role, active status, and company access permissions.

---

## Update Member

```http
PATCH /api/v1/members/{uuid}
```

Update member information including role, active status, allowed companies and custom permissions. Requires the `org.manage_members` permission.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | string | Membership UUID (the `id` field of the members list) |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| Content-Type | string | Yes | Must be `application/json` |

### Request Body

```json
{
  "role": "accountant",
  "isActive": true,
  "allowedCompanies": [
    "550e8400-e29b-41d4-a716-446655440000"
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role | string | No | Member role: `owner`, `admin`, `accountant` or `employee`. Only an owner can set `owner` |
| isActive | boolean | No | Whether member is active |
| allowedCompanies | array | No | Array of company UUIDs. Applied to accountants and employees only; companies of other organizations are ignored |
| permissions | string[] \| null | No | Custom permissions replacing the role defaults. An empty array or `null` restores the defaults. You can only grant permissions you hold |

### Response

Returns the updated member object, in the same form as an entry of the [members list](/api-reference/members/list):

```json
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
```

### Restrictions

- You cannot change your own role or deactivate yourself
- Only an owner can promote to `owner` or change the role of an owner
- The last active owner cannot be demoted
- Super admin accounts can only be modified by super admins
- Reactivating a member counts against the seat limit of the plan

### Error Responses

Errors return `{"error": "..."}`.

| Status | Description |
|--------|-------------|
| 400 | Invalid role, or an unknown permission in `permissions` |
| 401 | Unauthorized - invalid authentication |
| 402 | `PLAN_LIMIT` - reactivating the member exceeds the seat limit |
| 403 | Insufficient permissions, protected action, or a permission you do not hold in `permissions` |
| 404 | Member not found |
| 422 | You cannot change your own role or deactivate yourself, or the last owner would be removed |

### Notes

- Deactivating a member prevents login but preserves data
- The DELETE endpoint also deactivates a member
