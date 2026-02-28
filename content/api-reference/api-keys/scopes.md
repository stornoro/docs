---
title: List available scopes
description: Retrieve all permission scopes available to the current user, grouped by category.
---

# List available scopes

Returns all permission scopes the authenticated user is eligible to grant to an API token. Only scopes the user themselves holds are returned — this endpoint cannot be used to discover scopes beyond the user's own permission set. The response is intended to power the scope picker in token creation and editing UIs.

```http
GET /api/v1/api-tokens/scopes
```

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |

## Response

Returns an object containing a `scopes` array. Each item represents a single grantable permission.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `scopes` | object[] | Array of available scope objects |
| `scopes[].value` | string | The scope identifier used in API requests (e.g. `"invoice.view"`) |
| `scopes[].label` | string | Human-readable display label, identical to `value` |
| `scopes[].category` | string | The resource category this scope belongs to (e.g. `"invoice"`) |

### Scope Categories and Values

| Category | Scope Values |
|----------|-------------|
| `company` | `company.view`, `company.create`, `company.edit`, `company.delete` |
| `client` | `client.view`, `client.create`, `client.edit`, `client.delete` |
| `product` | `product.view`, `product.create`, `product.edit`, `product.delete` |
| `invoice` | `invoice.view`, `invoice.create`, `invoice.edit`, `invoice.delete`, `invoice.issue`, `invoice.send`, `invoice.cancel`, `invoice.refund` |
| `series` | `series.view`, `series.manage` |
| `payment` | `payment.view`, `payment.create`, `payment.delete` |
| `efactura` | `efactura.view`, `efactura.submit` |
| `settings` | `settings.view`, `settings.manage` |
| `org` | `org.manage_members`, `org.manage_billing`, `org.view_audit` |
| `export` | `export.data` |

## Example Request

```bash
curl -X GET 'https://api.storno.ro/api/v1/api-tokens/scopes' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Example Response

```json
{
  "scopes": [
    { "value": "company.view",    "label": "company.view",    "category": "company" },
    { "value": "company.create",  "label": "company.create",  "category": "company" },
    { "value": "company.edit",    "label": "company.edit",    "category": "company" },
    { "value": "company.delete",  "label": "company.delete",  "category": "company" },
    { "value": "client.view",     "label": "client.view",     "category": "client"  },
    { "value": "client.create",   "label": "client.create",   "category": "client"  },
    { "value": "client.edit",     "label": "client.edit",     "category": "client"  },
    { "value": "client.delete",   "label": "client.delete",   "category": "client"  },
    { "value": "invoice.view",    "label": "invoice.view",    "category": "invoice" },
    { "value": "invoice.create",  "label": "invoice.create",  "category": "invoice" },
    { "value": "invoice.edit",    "label": "invoice.edit",    "category": "invoice" },
    { "value": "invoice.delete",  "label": "invoice.delete",  "category": "invoice" },
    { "value": "invoice.issue",   "label": "invoice.issue",   "category": "invoice" },
    { "value": "invoice.send",    "label": "invoice.send",    "category": "invoice" },
    { "value": "invoice.cancel",  "label": "invoice.cancel",  "category": "invoice" },
    { "value": "invoice.refund",  "label": "invoice.refund",  "category": "invoice" },
    { "value": "export.data",     "label": "export.data",     "category": "export"  }
  ]
}
```

> The example above shows a partial response for a user who does not hold all possible scopes. A user with full administrator permissions would receive all scopes across every category.

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |

## Important Notes

- The list of returned scopes is filtered to the authenticated user's own permissions — use this endpoint to build the scope picker rather than hardcoding scope lists in the client
- Scopes not present in this response will be rejected with a `422` error if provided to [Create API token](/api-reference/api-keys/create) or [Update API token](/api-reference/api-keys/update)
- The `label` field is currently equal to `value`; a future version may include localized display strings
- Results are not paginated — the full list is always returned in a single response

## Related Endpoints

- [List API tokens](/api-reference/api-keys/list)
- [Create API token](/api-reference/api-keys/create)
- [Update API token](/api-reference/api-keys/update)
- [Revoke API token](/api-reference/api-keys/revoke)
