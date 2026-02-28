---
title: Delete bank account
description: Permanently delete a bank account.
---

# Delete bank account

Permanently deletes a bank account from the authenticated company.

```http
DELETE /api/v1/bank-accounts/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the bank account |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns a `204 No Content` status on successful deletion with no response body.

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/bank-accounts/bank-account-uuid-3' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Example Response

```http
HTTP/1.1 204 No Content
```

## Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | unauthorized | Invalid or missing authentication token |
| 403 | forbidden | Missing or invalid X-Company header |
| 404 | not_found | Bank account not found or doesn't belong to company |
| 409 | conflict | Cannot delete the last bank account or account with active invoices |

## Important Notes

- This is a permanent delete operation - data cannot be recovered
- You cannot delete the last bank account for a company
- If the account is marked as default, another account must be set as default first
- Existing invoices that reference this bank account will retain the IBAN in their stored data
- Consider setting `isDefault: false` on another account before deleting a default account

## Related Endpoints

- [List bank accounts](/api-reference/bank-accounts/list)
- [Create bank account](/api-reference/bank-accounts/create)
- [Update bank account](/api-reference/bank-accounts/update)
