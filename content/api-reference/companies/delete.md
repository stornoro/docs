---
title: Delete Company
description: Permanently delete a company and all associated data
method: DELETE
endpoint: /api/v1/companies/{uuid}
---

# Delete Company

Permanently deletes a company and dispatches an asynchronous cascade deletion of all associated resources including invoices, clients, products, ANAF tokens, and other company-specific data. Only users with Owner or Admin roles can delete companies.

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

// Response status: 204 No Content
```
{% /tab %}
{% /tabs %}

## Response

No content is returned. HTTP status 204 indicates successful deletion.

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions (only Owner/Admin can delete) |
| 404 | Not Found - Company does not exist |
| 500 | Internal server error |
