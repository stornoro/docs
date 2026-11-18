---
title: List Invitations
description: List all pending invitations
---

# List Invitations

Retrieve all pending invitations for the organization.

---

## Get Invitations

```http
GET /api/v1/invitations
```

Get all pending (not yet accepted or expired) invitations.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns the pending invitations under `data`.

```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "email": "newuser@example.com",
      "role": "accountant",
      "status": "pending",
      "createdAt": "2026-02-16T12:00:00+00:00",
      "expiresAt": "2026-02-23T12:00:00+00:00",
      "invitedBy": {
        "id": "123e4567-e89b-12d3-a456-426614174009",
        "firstName": "John",
        "lastName": "Doe"
      },
      "allowedCompanies": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Example Company SRL",
          "cif": "12345678"
        }
      ]
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "email": "another@example.com",
      "role": "employee",
      "status": "pending",
      "createdAt": "2026-02-15T10:00:00+00:00",
      "expiresAt": "2026-02-22T10:00:00+00:00",
      "invitedBy": {
        "id": "123e4567-e89b-12d3-a456-426614174009",
        "firstName": "John",
        "lastName": "Doe"
      },
      "allowedCompanies": []
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Invitation UUID |
| email | string | Invited user email |
| role | string | Role assigned to invitation |
| status | string | `pending`, `accepted`, `cancelled` or `expired` |
| createdAt | string | ISO 8601 creation timestamp |
| expiresAt | string | ISO 8601 expiry timestamp |
| invitedBy | object | `id`, `firstName` and `lastName` of the inviting user |
| allowedCompanies | array | Companies the member will access, each with `id`, `name` and `cif` |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - insufficient permissions |

### Notes

- Only returns pending invitations
- Accepted invitations are not shown
- Expired invitations are not shown
- Requires the `org.manage_members` permission
