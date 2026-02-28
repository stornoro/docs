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
| uuid | string | Member UUID |

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns `204 No Content` on successful deactivation.

### Restrictions

The following members cannot be deactivated:
- The authenticated user (cannot deactivate self)
- Organization owner
- Super admin accounts

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - cannot deactivate self, owner, or super admin |
| 404 | Member not found |

### Notes

- Deactivation is a soft delete - data is preserved
- Deactivated members cannot log in to the organization
- Invoices and other data created by the member remain intact
- To reactivate, use the PATCH endpoint to set `isActive: true`
- Only organization admins and owners can deactivate members
