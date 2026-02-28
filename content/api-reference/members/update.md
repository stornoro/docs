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

Update member information including role, active status, and allowed companies.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | string | Member UUID |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| Content-Type | string | Yes | Must be `application/json` |

### Request Body

```json
{
  "role": "ACCOUNTANT",
  "isActive": true,
  "allowedCompanies": [
    "550e8400-e29b-41d4-a716-446655440000"
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role | string | No | Member role: `ADMIN`, `ACCOUNTANT`, or `EMPLOYEE` |
| isActive | boolean | No | Whether member is active |
| allowedCompanies | array | No | Array of company UUIDs |

### Response

Returns the updated member object:

```json
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
```

### Restrictions

- Cannot change a member's role to `OWNER`
- Cannot modify the organization owner
- Cannot modify super admin accounts
- Only admins and owners can update members
- Must provide at least one allowed company for active members

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - insufficient permissions or attempting protected action |
| 404 | Member not found |
| 422 | Validation error - invalid role or empty allowed companies |

### Notes

- OWNER role can only be transferred through organization ownership transfer
- Deactivating a member prevents login but preserves data
- Use DELETE endpoint to fully deactivate a member
