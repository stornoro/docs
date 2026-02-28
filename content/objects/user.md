---
title: User
description: User object representing an authenticated user
---

# User

The User object represents an authenticated user in the system. User data is returned by the `/api/v1/me` endpoint and includes profile information, organization membership, and permissions.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Unique identifier |
| email | string | User's email address |
| firstName | string | First name |
| lastName | string | Last name |
| phone | string | Phone number |
| locale | string | Preferred locale (e.g., "ro", "en") |
| timezone | string | User's timezone (e.g., "Europe/Bucharest") |
| roles | array | Global roles (typically empty for normal users) |
| credits | integer | Available credits for services |
| active | boolean | Whether the user account is active |
| lastConnectedAt | datetime | Last login timestamp |
| emailVerified | boolean | Whether email is verified |
| googleId | string/null | Google OAuth ID (if connected) |
| preferences | object | User preferences and settings |
| organization | object | User's organization data |
| memberships | array | Array of OrganizationMembership objects |
| createdAt | datetime | Timestamp when created |
| updatedAt | datetime | Timestamp of last update |

## Organization Membership

Each membership includes:

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Membership ID |
| role | OrganizationRole | Role: owner, admin, accountant, employee |
| permissions | array | Array of permission strings |
| allowedCompanies | array | Array of company IDs the user can access |
| organization | object | Organization details (id, name) |

## Example

```json
{
  "id": "b8c9d0e1-f2a3-4567-2345-678901234567",
  "email": "john.doe@example.ro",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+40 744 123 456",
  "locale": "ro",
  "timezone": "Europe/Bucharest",
  "roles": [],
  "credits": 1000,
  "active": true,
  "lastConnectedAt": "2024-02-16T09:30:00+02:00",
  "emailVerified": true,
  "googleId": "1234567890abcdef",
  "preferences": {
    "theme": "light",
    "notifications": {
      "email": true,
      "push": false
    },
    "dashboard": {
      "defaultView": "invoices",
      "itemsPerPage": 25
    }
  },
  "organization": {
    "id": "c9d0e1f2-a3b4-5678-3456-789012345678",
    "name": "Example Tech SRL",
    "slug": "example-tech",
    "createdAt": "2024-01-01T10:00:00+02:00"
  },
  "memberships": [
    {
      "id": "d0e1f2a3-b4c5-6789-4567-890123456789",
      "role": "admin",
      "permissions": [
        "invoices.create",
        "invoices.edit",
        "invoices.delete",
        "invoices.view",
        "clients.manage",
        "products.manage",
        "settings.view"
      ],
      "allowedCompanies": [
        "a7b8c9d0-e1f2-3456-1234-567890123456",
        "e1f2a3b4-c5d6-7890-5678-901234567890"
      ],
      "organization": {
        "id": "c9d0e1f2-a3b4-5678-3456-789012345678",
        "name": "Example Tech SRL"
      }
    }
  ],
  "createdAt": "2024-01-01T11:00:00+02:00",
  "updatedAt": "2024-02-16T09:30:00+02:00"
}
```

## Organization Roles

- **owner**: Full access to all features and settings
- **admin**: Administrative access, can manage users and settings
- **accountant**: Can manage financial documents and reports
- **employee**: Limited access based on assigned permissions

## Common Permissions

- **invoices.create** - Create new invoices
- **invoices.edit** - Edit existing invoices
- **invoices.delete** - Delete invoices
- **invoices.view** - View invoices
- **clients.manage** - Manage clients
- **products.manage** - Manage products
- **settings.view** - View company settings
- **settings.edit** - Edit company settings
- **reports.view** - Access reports
- **users.manage** - Manage organization users

## Notes

- The `/api/v1/me` endpoint returns flat user JSON (NOT `{user: {...}}`)
- Multi-company access is controlled through `allowedCompanies` in membership
- Current company context is selected via `X-Company` header in API requests
- **googleId**: Present if user signed in with Google OAuth
- **preferences**: Stored as JSON, structure is flexible
- Users can belong to multiple organizations (one membership per organization)
