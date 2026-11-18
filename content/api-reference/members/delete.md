---
title: Deactivate Organization Member
description: Deactivate a member from the organization
---

# Deactivate Organization Member

Deactivate a member from the organization. This prevents them from accessing the organization but preserves historical data.

---

## Deactivate Member

```http
DELETE /api/v1/members/{uuid}
```

Deactivate a member by setting their `isActive` status to false. Member data is preserved for audit purposes.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | string | Membership UUID (the `id` field of the members list) |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns `204 No Content` on successful deactivation.

### Restrictions

- You cannot deactivate yourself
- Only an owner can deactivate an owner
- Super admin accounts can only be deactivated by super admins

### Error Responses

Errors return `{"error": "..."}`.

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Insufficient permissions, deactivating an owner without being an owner, or deactivating a super admin |
| 404 | Member not found |
| 422 | You cannot deactivate your own account |

### Notes

- Deactivation is a soft delete - data is preserved
- Deactivated members cannot log in to the organization
- Invoices and other data created by the member remain intact
- To reactivate, use the PATCH endpoint to set `isActive: true`
- Requires the `org.manage_members` permission
