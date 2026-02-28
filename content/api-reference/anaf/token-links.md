---
title: ANAF Token Links
description: Device-based authentication flow for ANAF tokens
---

# ANAF Token Links

Create and manage token links for device-based ANAF authentication flow.

---

## Create Token Link

```http
POST /api/v1/anaf/token-links
```

Create a token link for device-based authentication. This generates a unique link that can be used on mobile devices or other platforms to complete ANAF OAuth flow.

Maximum of 5 active links per user are allowed.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Response

Returns `201 Created` with the token link details.

```json
{
  "linkToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "url": "https://app.storno.ro/auth/anaf/device?token=a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "expiresAt": "2026-02-16T13:00:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| linkToken | string | Unique token identifier for this link |
| url | string | Complete URL for device authentication |
| expiresAt | string | ISO 8601 timestamp when link expires |

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - invalid authentication |
| 429 | Too many active links (maximum 5) |

---

## Check Token Link Status

```http
GET /api/v1/anaf/token-links/{linkToken}
```

Check the status of a token link to see if it has been used or expired.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| linkToken | string | The token link identifier |

### Response

```json
{
  "status": "pending",
  "tokenId": null
}
```

Or after use:

```json
{
  "status": "used",
  "tokenId": 125
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| status | string | Link status: `pending`, `used`, or `expired` |
| tokenId | integer\|null | ANAF token ID (if status is `used`) |

### Status Values

| Value | Description |
|-------|-------------|
| pending | Link is active and waiting to be used |
| used | Link has been successfully used to add a token |
| expired | Link has expired without being used |

### Error Responses

| Status | Description |
|--------|-------------|
| 404 | Token link not found |
