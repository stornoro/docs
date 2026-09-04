---
title: List SPV documents
description: Archived ANAF SPV inbox messages for a company, classified by category and severity
method: GET
endpoint: /api/v1/spv/documents
---

# List SPV documents

Every message in the company's ANAF **Spațiul Privat Virtual** inbox that Storno has archived: somații (enforcement notices), decizii, notificări, adrese, rapoarte de analiză de risc, recipise, certificate, plăți, extrase de cont and the rest. Messages get into the archive through the local storno-agent sync (see [Sync the SPV inbox](/api-reference/spv/sync)).

Each document carries a `category` and a `severity`:

| Severity | Meaning | Examples |
|---|---|---|
| `critical` | push + email immediately, one notification per document | `SOMATII`, `Decizie inactivare`, `Decizie anulare TVA`, `RAPOARTE ANALIZA DE RISC` |
| `high` | push immediately, one notification per document | other `DECIZIE`, `NOTIFICARE`, `Instiintare`, `Invitatie`, `ADRESE` |
| `normal` | folded into one "N new documents" summary per sync | certificates, answers to requests, payments, account statements |
| `low` | archived silently | `RECIPISA`, declaration copies, `FACTURI ARHIVA`, Program Tezaur |

Categories: `somatie`, `decizie`, `notificare`, `adresa`, `analiza_risc`, `recipisa`, `declaratie`, `certificat`, `raspuns`, `plata`, `extras_cont`, `ajutor_stat`, `facturi_arhiva`, `tezaur`, `registru`, `altele`.

```
GET /api/v1/spv/documents
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `X-Company` | string | Yes | Company UUID |

Requires the `declaration.view` permission.

## Query parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `category` | string | No | One of the categories above |
| `severity` | string | No | `critical`, `high`, `normal`, `low` |
| `unread` | boolean | No | Only documents without `readAt` |
| `search` | string | No | Matches message type, details or ANAF id |
| `from`, `to` | date | No | ANAF date range, `YYYY-MM-DD` |
| `page`, `limit` | integer | No | Pagination (limit max 100) |

## Response

```json
{
  "data": [
    {
      "id": "01a06e2f-...",
      "anafMessageId": "100000123",
      "messageType": "SOMATII",
      "category": "somatie",
      "categoryLabel": "Somatii",
      "severity": "critical",
      "cif": "12345678",
      "details": "Somatie nr. 123 din 03.09.2026",
      "anafCreatedAt": "2026-09-03T14:15:00+03:00",
      "fileName": "2026-09-03_somatii_100000123.pdf",
      "fileSize": 84512,
      "downloadedAt": "2026-09-04T19:02:11+03:00",
      "readAt": null,
      "read": false,
      "hasPdf": true,
      "purgedAt": null,
      "createdAt": "2026-09-04T19:01:58+03:00"
    }
  ],
  "total": 37,
  "page": 1,
  "limit": 10
}
```

`hasPdf` is `false` while the agent has not fetched the file yet (`downloadedAt` null) or after retention removed it (`purgedAt` set). Rows are never deleted by retention, only the file.

## Related

- `GET /api/v1/spv/documents/stats` — totals, unread, pending PDFs, breakdown by category and severity
- `GET /api/v1/spv/documents/{uuid}` — one document (adds `idSolicitare`, `downloadError`, `notifiedAt`)
- `GET /api/v1/spv/documents/{uuid}/download` — the archived PDF (marks the document read); `404` with `code` `SPV_FILE_PENDING`, `SPV_FILE_PURGED` or `SPV_FILE_MISSING`
- `PATCH /api/v1/spv/documents/{uuid}/read`, `POST /api/v1/spv/documents/read-all`
