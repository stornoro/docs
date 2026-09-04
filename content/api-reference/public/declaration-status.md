---
title: Declaration status (StareD112)
description: Processing state of a declaration filed on the e-guvernare portal, by upload index and CUI/CNP, from ANAF's public StareD112 service
method: GET
endpoint: /api/v1/public/declarations/status/{index}/{cui}
---

# Declaration status

After a declaration is uploaded to ANAF's e-guvernare portal (through the [Storno Agent](/agent) or manually) ANAF answers with an **upload index** ("Indexul este 1216…"). Its processing state is public on ANAF's StareD112 page for anyone who knows the index and the taxpayer's CUI/CNP. This endpoint reads that page and returns a normalized state. No account, nothing stored, 60 requests per hour per IP.

## Request

```
GET /api/v1/public/declarations/status/{index}/{cui}
```

| Parameter | Description |
|---|---|
| `index` | ANAF upload index (digits only, as printed by the portal after the upload) |
| `cui` | CUI or CNP of the declaring taxpayer, without the `RO` prefix |

## Response

```json
{
  "index": "1216000000",
  "cui": "12345678",
  "state": "ok",
  "message": "Documentul este valid: declaratia a fost acceptata.",
  "anafText": "Documentul este valid: declaratia a fost acceptata.",
  "recipisaUrl": "https://www.anaf.ro/StareD112/ObtineRecipisa?numefisier=1216000000.pdf"
}
```

| `state` | Meaning |
|---|---|
| `processing` | ANAF has the file and is still validating it (usually minutes, sometimes hours at month end) |
| `ok` | accepted: the recipisa is available at `recipisaUrl` and also arrives in the SPV inbox |
| `nok` | rejected: open the recipisa for the validation errors, fix the XML, file again |
| `unknown` | nothing found for this index and CUI: not indexed yet (wait a minute) or a typo |

`anafText` is ANAF's own wording, kept verbatim. `recipisaUrl` is `null` while the state is `unknown`.

## Errors

| Status | Code | Description |
|---|---|---|
| `400` | `INVALID_INPUT` | `index` or `cui` is not numeric |
| `429` | `RATE_LIMITED` | more than 60 requests per hour from this IP |
| `502` | `ANAF_UNAVAILABLE` | StareD112 did not answer |

## Related

- [Validate a declaration XML](/api-reference/declarations/validate-xml) before uploading it
- [Storno Agent](/agent#signing-pdfs) signs and uploads the DUKIntegrator PDF; the MCP tool `anaf_declaration_status` wraps this endpoint
