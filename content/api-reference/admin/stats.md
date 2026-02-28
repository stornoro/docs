---
title: Admin Platform Statistics
description: Get platform-wide statistics (SUPER_ADMIN only)
---

# Admin Platform Statistics

Get platform-wide statistics for monitoring and analytics. This endpoint is restricted to SUPER_ADMIN users.

---

## Get Platform Stats

```http
GET /api/v1/admin/stats
```

Retrieve comprehensive platform statistics including user counts, organizations, and companies.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication (SUPER_ADMIN required) |

### Response

```json
{
  "users": {
    "total": 1523,
    "active": 1402,
    "verified": 1450,
    "unverified": 73,
    "inactive": 121,
    "registeredToday": 12,
    "registeredThisWeek": 45,
    "registeredThisMonth": 187
  },
  "organizations": {
    "total": 456,
    "active": 423,
    "withPaidPlan": 234,
    "onTrial": 89,
    "suspended": 33,
    "createdToday": 3,
    "createdThisWeek": 18,
    "createdThisMonth": 67
  },
  "companies": {
    "total": 892,
    "withSync": 678,
    "withValidToken": 645,
    "syncedToday": 523,
    "syncedThisWeek": 712
  },
  "invoices": {
    "total": 45678,
    "thisMonth": 3456,
    "thisWeek": 892,
    "today": 123
  },
  "system": {
    "version": "1.2.3",
    "uptime": 3456789,
    "environment": "production"
  }
}
```

### Response Fields

#### Users
| Field | Type | Description |
|-------|------|-------------|
| total | integer | Total number of users |
| active | integer | Active users (not suspended) |
| verified | integer | Email-verified users |
| unverified | integer | Unverified users |
| inactive | integer | Inactive/suspended users |
| registeredToday | integer | Registrations today |
| registeredThisWeek | integer | Registrations this week |
| registeredThisMonth | integer | Registrations this month |

#### Organizations
| Field | Type | Description |
|-------|------|-------------|
| total | integer | Total organizations |
| active | integer | Active organizations |
| withPaidPlan | integer | Organizations with paid plan |
| onTrial | integer | Organizations on trial |
| suspended | integer | Suspended organizations |
| createdToday | integer | Created today |
| createdThisWeek | integer | Created this week |
| createdThisMonth | integer | Created this month |

#### Companies
| Field | Type | Description |
|-------|------|-------------|
| total | integer | Total companies |
| withSync | integer | Companies with sync enabled |
| withValidToken | integer | Companies with valid ANAF token |
| syncedToday | integer | Companies synced today |
| syncedThisWeek | integer | Companies synced this week |

#### Invoices
| Field | Type | Description |
|-------|------|-------------|
| total | integer | Total invoices in system |
| thisMonth | integer | Invoices this month |
| thisWeek | integer | Invoices this week |
| today | integer | Invoices today |

#### System
| Field | Type | Description |
|-------|------|-------------|
| version | string | Application version |
| uptime | integer | System uptime in seconds |
| environment | string | Environment: production/staging/development |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 403 | Forbidden - requires SUPER_ADMIN role |

### Notes

- This endpoint is heavily cached (typically 5 minutes)
- Statistics are approximations for large datasets
- Only SUPER_ADMIN users can access this endpoint
- Use for monitoring dashboards and analytics
