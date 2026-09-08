---
title: Download the ANAF PDF
description: The PDF ANAF accepts for a declaration, generated on demand from its data, for downloading, viewing, or filing by hand in SPV
method: GET
endpoint: /api/v1/declarations/{uuid}/pdf
---

# Download the ANAF PDF

Returns the declaration exactly as ANAF wants it uploaded: DUKIntegrator's rendering of the form with the XML embedded and, for forms that require it (C168), the attachment zip embedded. For a draft, validated, rejected or errored declaration the file is produced on demand from the current data, so it always reflects the latest edits; once filed, the stored copy is returned.

This is the manual route: a person without the Storno Agent, or without a certificate on this computer, downloads the file and uploads it themselves in SPV (persoane fizice: SPV → Depunere declarații) or on the e-guvernare portal. The [agent route](/api-reference/declarations/agent) signs and uploads the same file automatically.

## Request

```
GET /api/v1/declarations/{uuid}/pdf
GET /api/v1/declarations/{uuid}/pdf?inline=1      (view in the browser)
GET /api/v1/declarations/{uuid}/pdf?refresh=1     (regenerate a draft's PDF)
```

Requires `declaration.view` and the company header. Storno's own rules and ANAF's validator run before rendering; a file that would be rejected is not produced.

## Responses

| Status | Body |
|---|---|
| `200` | `application/pdf`, `Content-Disposition: attachment` (or `inline`) |
| `402` | `PLAN_LIMIT` — PDF generation is not in the plan |
| `404` | no PDF and the declaration is already filed without one |
| `422` | `VALIDATION_FAILED` — the data does not pass Storno's rules or ANAF's validator (message says what) |
| `503` | `VALIDATOR_UNAVAILABLE` — DUKIntegrator is not running |

MCP: `declarations_download_pdf` writes the file to a local path.
