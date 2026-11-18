---
title: ANAF Token Links
description: Let the certificate holder authorize ANAF access on their own device, through a link your application generates
---

# ANAF Token Links

A token link moves the ANAF authorization to another device. Your application creates the link, the holder of the digital certificate opens it, signs in at ANAF, and the resulting token is saved on your account. The holder needs no Storno account.

---

## Shared and exclusive tokens

A link produces one of two kinds of token.

**Shared (default).** Any token of the organization can serve any of its companies. This fits an accountant whose certificate has SPV rights on every company of the account: one authorization covers all of them, and a company added later works at once.

**Exclusive.** Create the link with `exclusive: true` and a `companyId`. The token is bound to that company:

- ANAF must confirm that the certificate has SPV rights on the CIF of the company. If it does not, nothing is saved, the holder sees an error, and the link stays valid for another attempt with the right certificate.
- The company uses its bound token and no other. A token of company A is never used for company B, also when B has no valid token.
- The bound token is never used for another company.
- Deleting the token ([`DELETE /api/v1/anaf/tokens/{id}`](/api-reference/anaf/tokens)) revokes ANAF access for that one company. The other companies keep working.
- A new exclusive link for the same company replaces its token; the old one is deleted.
- A company that is exclusive stays exclusive: every later link for it is exclusive, whatever the request says.

Use exclusive links when each company belongs to a different owner, for example an application that invoices on behalf of many independent businesses.

---

## Create Token Link

```http
POST /api/v1/anaf/token-links
```

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| X-Company | string | No | Company UUID, used when `companyId` is not in the body |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| companyId | string | No | Company the link is for. The token is validated against its CIF. Without it the token is validated against every company of your organizations |
| exclusive | boolean | No | Bind the token to the company (see above). Needs `companyId`. Default `false` |

### Response

Returns `201 Created`.

```json
{
  "linkToken": "5f1c0d9a7b3e4c2d8a6f0e1b9c7d5a3f5f1c0d9a7b3e4c2d8a6f0e1b9c7d5a3f",
  "linkUrl": "https://app.storno.ro/anaf/link/5f1c0d9a7b3e4c2d8a6f0e1b9c7d5a3f5f1c0d9a7b3e4c2d8a6f0e1b9c7d5a3f",
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "exclusive": true,
  "expiresAt": "2026-11-19T10:00:00+00:00"
}
```

| Field | Type | Description |
|-------|------|-------------|
| linkToken | string | Identifier of the link, 64 hex characters |
| linkUrl | string | The page the certificate holder opens |
| companyId | string\|null | Company the link was created for |
| exclusive | boolean | Whether the resulting token is bound to the company |
| expiresAt | string | The link is valid for 24 hours |

### Limits

A user may hold 5 active links (not used and not expired). A used or expired link no longer counts. An organization that enrols many companies at once can have a higher limit, up to 500: ask support, or on a self-hosted instance run `php bin/console app:anaf:link-limit <organization> 100` (`default` restores 5, no value shows the current limit). When the limit is reached:

```json
{
  "error": "Aveti deja prea multe link-uri active. Asteptati sa expire sau stergeti-le.",
  "code": "TOO_MANY_ACTIVE_LINKS",
  "limit": 5
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `EXCLUSIVE_NEEDS_COMPANY` | `exclusive: true` without a company of your organization |
| 401 | | Invalid authentication |
| 429 | `TOO_MANY_ACTIVE_LINKS` | Active link limit reached; `limit` carries the value |

---

## List Active Links

```http
GET /api/v1/anaf/token-links
```

Returns the active links of the authenticated user under `data`, each with `linkToken`, `linkUrl`, `companyId`, `exclusive`, `expiresAt` and `createdAt`.

---

## Link Result

```http
GET /api/v1/anaf/token-links/{linkToken}/result
```

For the user who created the link. Tells whether the holder has authorized and which token came out of this link. Each link names its own token, so the result is exact when many links are authorized at the same time.

### Response

```json
{
  "linkToken": "5f1c0d9a7b3e4c2d8a6f0e1b9c7d5a3f5f1c0d9a7b3e4c2d8a6f0e1b9c7d5a3f",
  "expired": false,
  "used": true,
  "completed": true,
  "tokenId": "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b",
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "exclusive": true,
  "expiresAt": "2026-11-19T10:00:00+00:00",
  "usedAt": "2026-11-18T10:07:31+00:00"
}
```

| Field | Type | Description |
|-------|------|-------------|
| expired | boolean | The 24 hours have passed |
| used | boolean | The holder completed the authorization |
| completed | boolean | A token was saved from this link |
| tokenId | string\|null | The token this link produced; `null` until `completed` |
| companyId | string\|null | Company the link was created for |
| exclusive | boolean | Whether the token is bound to the company |
| usedAt | string\|null | When the holder authorized |

There is no callback. Poll this endpoint until `completed` is `true` or `expired` is `true`.

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Invalid authentication |
| 404 | No such link, or it belongs to another user |

---

## Public Link Status

```http
GET /api/v1/anaf/token-links/{linkToken}
```

No authentication. The page the holder opens reads it. It carries no identifiers.

```json
{
  "expired": false,
  "used": false,
  "completed": false,
  "expiresAt": "2026-11-19T10:00:00+00:00"
}
```

| Status | Description |
|--------|-------------|
| 404 | Token link not found |
