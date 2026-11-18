---
title: Delete Company
description: Permanently delete a company and all associated data
method: DELETE
endpoint: /api/v1/companies/{uuid}
---

# Delete Company

Deletes a company. The company is hidden at once and its data is removed by a background job after a 5-day grace period. During the grace period it can be restored with `POST /api/v1/companies/{uuid}/restore`. Requires the `company.delete` permission.

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer {token} |

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | string | Company UUID |

## Request

{% tabs %}
{% tab label="cURL" %}
```bash
curl -X DELETE https://api.storno.ro/api/v1/companies/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
{% /tab %}
{% tab label="JavaScript" %}
```js
const companyUuid = '550e8400-e29b-41d4-a716-446655440000';

const response = await fetch(`https://api.storno.ro/api/v1/companies/${companyUuid}`, {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const result = await response.json(); // 200 OK
```
{% /tab %}
{% /tabs %}

## Response

Returns `200 OK`.

```json
{
  "message": "Company scheduled for deletion.",
  "deletedAt": "2026-02-16T10:30:00+00:00",
  "hardDeleteAt": "2026-02-21T10:30:00+00:00"
}
```

`hardDeleteAt` is when the background job removes the data.

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - the user lacks the `company.delete` permission |
| 404 | Not Found - Company does not exist |
| 500 | Internal server error |
