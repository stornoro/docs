---
title: Sync the SPV inbox
description: Three-step flow through the local storno-agent to archive ANAF SPV messages and their PDFs
method: POST
endpoint: /api/v1/spv/sync-prepare
---

# Sync the SPV inbox

The ANAF SPV web service (`webserviced.anaf.ro/SPVWS2`) accepts only the qualified digital certificate (mTLS); the e-Factura OAuth token is rejected. Listing the inbox and downloading each PDF therefore run on the user's machine through the **storno-agent**, and the backend orchestrates:

1. `POST /api/v1/spv/sync-prepare` → the `listaMesaje` URL to fetch
2. agent `GET` that URL with the certificate
3. `POST /api/v1/spv/sync-agent-result` with the raw ANAF answer → archives and classifies every message, notifies users, returns the PDFs still to fetch
4. agent `GET` each `descarcare` URL
5. `POST /api/v1/spv/documents/{uuid}/agent-document` with each file

The web app runs this automatically from **Documente SPV → Sincronizează cu ANAF**. All three endpoints need the `declaration.submit` permission and the `X-Company` header.

## Step 1 — prepare

```
POST /api/v1/spv/sync-prepare
```

| Body field | Type | Required | Description |
|------------|------|----------|-------------|
| `days` | integer | No | Days back to list, 1–60 (default 60, the ANAF maximum) |

```json
{
  "anafUrl": "https://webserviced.anaf.ro/SPVWS2/rest/listaMesaje?zile=60&cif=12345678",
  "cif": "12345678",
  "days": 60,
  "pendingDownloads": [
    { "documentId": "01a06e2f-...", "anafUrl": "https://webserviced.anaf.ro/SPVWS2/rest/descarcare?id=100000123", "messageType": "SOMATII" }
  ]
}
```

## Step 3 — relay the listing

```
POST /api/v1/spv/sync-agent-result
```

| Body field | Type | Required | Description |
|------------|------|----------|-------------|
| `statusCode` | integer | Yes | HTTP status ANAF returned |
| `body` | string | Yes | Raw ANAF body (JSON `{"mesaje":[...]}`) |

```json
{
  "stats": { "created": 4, "skipped": 1, "received": 37 },
  "documents": [
    { "documentId": "01a06e2f-...", "anafUrl": "https://webserviced.anaf.ro/SPVWS2/rest/descarcare?id=100000123", "messageType": "SOMATII" }
  ]
}
```

`skipped` counts messages for other CIFs covered by the same certificate. Re-sending the same listing is idempotent (messages are unique per company and ANAF id).

Errors: `502` with `code` `SPV_UNPARSEABLE` when ANAF returned HTML (the F5 login/logout page: expired session or the certificate has no rights on this CIF), `SPV_ERROR` when ANAF returned an `eroare` field.

## Step 5 — upload a fetched PDF

```
POST /api/v1/spv/documents/{uuid}/agent-document
```

| Body field | Type | Required | Description |
|------------|------|----------|-------------|
| `statusCode` | integer | Yes | HTTP status of the `descarcare` call |
| `body` | string or byte array | Yes | File content: raw, base64 (`bodyEncoding: "base64"`) or byte array |
| `bodyEncoding` | string | No | `base64` when the body is base64 |

Returns the document. `502` with `SPV_NOT_A_DOCUMENT` when the body is not a PDF/ZIP (HTML logout page), `500` with `SPV_STORE_FAILED` when neither the organization storage nor the platform storage accepted the file.

Files are written to the organization's own storage when one is configured, otherwise to the platform storage; if the organization storage fails the platform storage is used and `downloadError` records why. Notifications go out with event types `spv.document_received` (critical/high, one per document) and `spv.new_documents` (summary), both configurable per user in notification preferences.

## Retention

`app:spv:cleanup` runs weekly and deletes PDFs older than the company's `archiveRetentionYears` (default 5; `0` keeps forever). The document row stays with `purgedAt` set.
