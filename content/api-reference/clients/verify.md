---
title: Verify partner (ANAF / VIES)
description: Check a client or supplier against the public registries and store the snapshot
---

# Verify partner (ANAF / VIES)

Checks a client or supplier against the public registries and stores the answer on the partner: ANAF's company registry for Romanian companies (VAT registration, VAT on collection with its period, inactive taxpayer status, the RO e-Factura register), VIES for EU partners (VAT number validity). The verification is informational — it never changes the partner's own invoicing settings (`isVatPayer`, `vatCode`); it feeds the badges in the lists, the notices on the invoice form and the `partner.status_changed` notification.

```http
POST /api/v1/clients/{uuid}/verify
POST /api/v1/suppliers/{uuid}/verify
POST /api/v1/partners/verify-all
```

Partners are also re-checked automatically every day at 06:40 when their last check is older than 30 days.

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | UUID of the company context |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | string | Yes | Client or supplier UUID (single verification) |

### Body (`verify-all` only)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `days` | integer | No | Re-check partners checked more than this many days ago (default 30, `0` = everyone) |

Requires the client-edit permission. Single verifications share the per-user throttle of the registry lookups.

## Example Request

```bash
curl -X POST 'https://api.storno.ro/api/v1/clients/b2c3d4e5-f6a7-8901-bcde-f12345678901/verify' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'X-Company: company-uuid'
```

## Response

Returns the updated partner (`client` or `supplier`, in its detail shape) and the outcome of the check.

```json
{
  "client": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Acme Corporation SRL",
    "cui": "12345678",
    "isVatPayer": true,
    "vatStatusCheckedAt": "2026-09-15T06:40:12+03:00",
    "vatRegistered": true,
    "vatOnCollection": true,
    "vatOnCollectionFrom": "2025-06-01",
    "vatOnCollectionTo": null,
    "inactive": false,
    "efacturaRegistered": true,
    "viesValid": null,
    "verificationNotes": "TVA la incasare din 01.06.2025.",
    "status": "active",
    "creditLimit": "25000.00",
    "affiliated": false
  },
  "result": {
    "checked": true,
    "source": "anaf",
    "changes": ["vat_on_collection"],
    "error": null
  }
}
```

### `result` fields

| Field | Type | Description |
|-------|------|-------------|
| `checked` | boolean | The registry answered and the snapshot was stored |
| `source` | string \| null | `anaf` (Romanian company with CUI) or `vies` (EU partner with VAT number) |
| `changes` | string[] | What changed against the previous snapshot: `became_inactive`, `reactivated`, `lost_vat_registration`, `vat_registered`, `vat_on_collection`, `vat_on_collection_ended`, `vies_invalid`, `vies_valid` |
| `error` | string \| null | `not_applicable` (individuals, non-EU partners, no identifier), `registry_unavailable` (the registry did not answer — the previous snapshot is kept and `verificationNotes` says so), `not_found` (ANAF does not know the CUI) |

A degrading change (`became_inactive`, `lost_vat_registration`, `vat_on_collection`, `vies_invalid`) sends the `partner.status_changed` notification to every member of the company.

### `verify-all` response

```json
{
  "checked": 42,
  "changed": 3,
  "failed": 0,
  "skipped": 5,
  "since": "2026-08-16T06:40:00+03:00"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `checked` | integer | Partners whose snapshot was refreshed |
| `changed` | integer | Of those, how many differ from the previous snapshot |
| `failed` | integer | Partners a registry did not answer for (retried by the daily job) |
| `skipped` | integer | Partners with nothing to check (individuals, non-EU) |

Romanian partners are sent to ANAF in batches of 100 (one request per second), EU partners to VIES one by one.

## Partner rules

The rules a company sets on its clients are plain fields of the [Client](/objects/client) object, accepted by [Create client](/api-reference/clients/create) and [Update client](/api-reference/clients/update):

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `active` (default), `warning` — the web shows a notice when the client is picked on an invoice — or `blocked` — the client cannot be picked and `POST /invoices/{id}/issue` answers `422` with a clear message (storno of an existing invoice is still allowed) |
| `creditLimit` | decimal \| null | Maximum outstanding balance in the company currency. When the client's balance plus the invoice being issued would exceed it, the issue response carries a `warning` object (`code: credit_limit_exceeded`, `creditLimit`, `outstanding`, `invoiceTotal`, `projected`, `currency`) — the invoice is still issued; the web asks for confirmation first |
| `affiliated` | boolean | Affiliated party. The D394 declaration sets `prsAfiliat = 1` when an affiliated client or supplier appears on an invoice of the period. Suppliers carry the same flag |

## Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or missing authentication token |
| 403 | Missing client-edit permission |
| 404 | Client / supplier not found in the company |
| 429 | Too many registry lookups; try again later |

## Related Endpoints

- [ANAF lookup](/api-reference/clients/anaf-lookup)
- [VIES lookup](/api-reference/clients/vies-lookup)
- [Update client](/api-reference/clients/update)
