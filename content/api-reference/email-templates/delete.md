---
title: Delete email template
description: Permanently delete an email template.
---

# Delete email template

Permanently deletes an email template from the authenticated company.

```http
DELETE /api/v1/email-templates/{uuid}
```

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the email template |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

## Response

Returns a `204 No Content` status on successful deletion with no response body.

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/email-templates/template-uuid-3' \
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
| 404 | not_found | Email template not found or doesn't belong to company |
| 409 | conflict | Cannot delete the last template or the default template |

## Important Notes

- This is a permanent delete operation - data cannot be recovered
- You cannot delete the last remaining email template for a company
- You cannot delete the default template; set another template as default first
- Emails already sent using this template are not affected
- Recurring invoices configured to use this template will fall back to the default template

## Recommended Approach

Before deleting a template:

1. **Check usage** - Verify if any recurring invoices use this template
2. **Set new default** - If deleting the default template, set another as default
3. **Keep alternatives** - Ensure at least one other template exists
4. **Archive content** - Save the template content externally if you might need it later

## Related Endpoints

- [List email templates](/api-reference/email-templates/list)
- [Create email template](/api-reference/email-templates/create)
- [Update email template](/api-reference/email-templates/update)
