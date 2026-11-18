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

Requires the `settings.manage` permission.

## Response

Returns `200 OK` with a confirmation message.

```json
{
  "message": "Bank account deleted."
}
```

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/bank-accounts/bank-account-uuid-3' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Permission denied |
| 404 | Company not found, or bank account not found in this company |

Error bodies have the form `{"error": "message"}`.

## Important Notes

- This is a permanent delete operation. The data cannot be recovered

## Related Endpoints

- [List bank accounts](/api-reference/bank-accounts/list)
- [Create bank account](/api-reference/bank-accounts/create)
- [Update bank account](/api-reference/bank-accounts/update)
