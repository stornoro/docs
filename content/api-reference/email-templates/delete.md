---
title: Delete email template
description: Permanently delete an email template.
---

# Delete email template

Permanently deletes an email template. Needs the Professional or Business plan, otherwise the call returns `402` with `code: "PLAN_LIMIT"`.

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
| `X-Company` | string | Conditional | Company UUID. Optional when the organization has a single company. The `?company=` query parameter is also accepted |

## Response

Returns `200 OK`:

```json
{
  "message": "Email template deleted."
}
```

## Example Request

```bash
curl -X DELETE 'https://api.storno.ro/api/v1/email-templates/template-uuid-3' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 402 | The plan does not include email templates. Body has `code: "PLAN_LIMIT"` |
| 403 | Missing the `email_template.manage` permission |
| 404 | Email template not found, or it belongs to another organization |

## Important Notes

- This is a permanent delete. The data cannot be recovered
- Emails already sent using this template are not affected

## Related Endpoints

- [List email templates](/api-reference/email-templates/list)
- [Create email template](/api-reference/email-templates/create)
- [Update email template](/api-reference/email-templates/update)
