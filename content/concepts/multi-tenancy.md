---
title: Multi-Tenancy
description: How organizations, companies, and resources are structured in the Storno.ro API.
---

# Multi-Tenancy

Storno.ro uses a hierarchical multi-tenant architecture: **User → Organization → Company → Resources**.

## Hierarchy

```
User
└── Organization (1 per user, created on registration)
    ├── Membership (role-based access)
    │   ├── Owner
    │   ├── Admin
    │   ├── Accountant
    │   └── Employee
    ├── Company A (CIF: RO12345678)
    │   ├── Invoices
    │   ├── Clients
    │   ├── Products
    │   ├── Suppliers
    │   ├── Bank Accounts
    │   ├── Document Series
    │   ├── VAT Rates
    │   └── Email Templates
    └── Company B (CIF: RO87654321)
        ├── Invoices
        └── ...
```

## Organizations

Every user belongs to exactly one organization. When a user registers, a default organization is created automatically. Organizations are the top-level tenant boundary.

## Companies

Companies represent legal entities (identified by CIF/tax ID). Each organization can have multiple companies.

### Adding a Company

Companies are added by CIF. Storno.ro validates the CIF against ANAF and auto-fills company details:

```bash
curl -X POST https://api.storno.ro/api/v1/companies \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "cif": "RO12345678"
  }'
```

## The X-Company Header

Most API endpoints operate within a company context. You must include the `X-Company` header with a valid company UUID:

```bash
curl https://api.storno.ro/api/v1/invoices \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```

### Endpoints That Don't Require X-Company

These endpoints operate at the user or organization level:

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth` | Authentication |
| `GET /api/v1/me` | Current user profile |
| `PATCH /api/v1/me` | Update profile |
| `GET /api/v1/companies` | List companies |
| `POST /api/v1/companies` | Add company |
| `GET /api/v1/anaf/tokens` | ANAF tokens |
| `GET /api/v1/members` | Organization members |
| `GET /api/v1/notifications` | Notifications |

## Membership Roles

Users access an organization through memberships. Each membership has a role:

| Role | Description | Permissions |
|------|-------------|-------------|
| **Owner** | Organization creator | Full access, cannot be deactivated |
| **Admin** | Organization administrator | Full access, can manage members |
| **Accountant** | Accounting staff | Access to assigned companies, can manage invoices |
| **Employee** | Limited access | Read-only access to assigned companies |

### Company-Scoped Access

Accountant and Employee roles can be restricted to specific companies within the organization:

```bash
curl -X PATCH https://api.storno.ro/api/v1/members/{uuid} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "accountant",
    "allowedCompanies": ["{company_uuid_1}", "{company_uuid_2}"]
  }'
```

## Invitations

Organization owners and admins can invite users:

```bash
curl -X POST https://api.storno.ro/api/v1/invitations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "accountant@example.com",
    "role": "accountant"
  }'
```

The invited user receives an email with a link to accept the invitation. If they don't have an account, they'll be prompted to register first.

## Data Isolation

- Resources (invoices, clients, products, etc.) are scoped to a single company
- Users can only access companies within their organization
- API requests with an invalid or unauthorized `X-Company` header return `403 Forbidden`
- Deleting a company cascades to all its resources (async operation)
