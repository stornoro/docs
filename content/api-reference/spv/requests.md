---
title: SPV requests (solicitări)
description: Ask ANAF for reports, copies of declarations, duplicate receipts and certificates through SPV, with the local agent
method: POST
endpoint: /api/v1/spv/requests/prepare
---

# SPV requests (solicitări)

ANAF's SPV web service `cerere` lets a certificate holder **request** documents for a company: reports (fișa rol, vector fiscal, situație sintetică, obligații de plată, istoric declarații, bilanț), copies of filed declarations (D300, D394, D112, D212 …), duplicate receipts, income certificates and other certificates or decisions. ANAF answers asynchronously: the document appears in the SPV inbox with the request's `id_solicitare`, and the [inbox sync](/api-reference/spv/sync) archives it and links it to the request.

Like every SPVWS2 call, `cerere` needs the qualified certificate over mTLS, so the request goes through the [local agent](/agent).

## Flow

```
POST /api/v1/spv/requests/prepare {type, params}   → {requestId, anafUrl}
agent: GET anafUrl with the certificate            → {"id_solicitare": 260149, "titlu": "Transmitere cerere tip Fisa Rol"}
POST /api/v1/spv/requests/{requestId}/agent-result {statusCode, body}
… later: POST /api/v1/spv/sync-agent-result        → request status becomes "answered", answerDocumentId set
```

## Endpoints

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/spv/requests/types` | `declaration.view` | Catalog of request types, their parameters, first year with data, ANAF notes, reasons for income certificates |
| GET | `/api/v1/spv/requests` | `declaration.view` | Requests of the company, newest first (`page`, `limit`, `status`) |
| POST | `/api/v1/spv/requests/prepare` | `declaration.submit` | Validate and register a request; returns the ANAF URL |
| POST | `/api/v1/spv/requests/{uuid}/agent-result` | `declaration.submit` | Relay ANAF's answer |
| DELETE | `/api/v1/spv/requests/{uuid}` | `declaration.submit` | Remove a pending or failed request |

## Prepare

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/spv/requests/prepare \
  -H "Authorization: Bearer YOUR_TOKEN" -H "X-Company: company-uuid" \
  -H "Content-Type: application/json" \
  -d '{"type": "D300", "params": {"an": "2026", "luna": "7"}}'
```

```json
{
  "requestId": "0192a1b2-…",
  "anafUrl": "https://webserviced.anaf.ro/SPVWS2/rest/cerere?tip=D300&cui=12345678&an=2026&luna=7",
  "type": "D300",
  "params": {"an": "2026", "luna": "7"},
  "cif": "12345678"
}
```

Types with `wsSupported: false` (C168, certificates, decisions and notices, the SAF-T pilot D300) are not implemented by ANAF's web service (`tip raport= … necunoscut`). For them `prepare` returns `channel: "web"` and a `form` object; the agent (1.7.4+) logs in with the certificate and submits the SPV website form (`www.anaf.ro/SNMD/solicitari.xhtml`), then answers in the same `{id_solicitare, titlu}` shape. Types the service implements return `channel: "ws"` and `anafUrl`.

Parameters by type (from ANAF's documentation): `an` for yearly forms and reports (Bilant anual, Istoric declaratii, D101, D205, D212 …); `an` + `luna` for monthly forms (D300, D390, D394, D100, D112; D208 accepts 6 or 12); `numar_inregistrare` for `Duplicat Recipisa` (e.g. `INTERNT-100000123-2026`); `an` + `motiv` for `Adeverinte Venit` (reason must match ANAF's list exactly); `cui_pui` optionally for fișa rol of a branch; `an` + `lunai` + `lunas` for `Neconcordante D394`. Validation errors return `422` with a Romanian message.

## Agent result

```json
{"statusCode": 200, "body": "{\"id_solicitare\":260149,\"titlu\":\"Transmitere cerere tip D300\"}"}
```

The request becomes `requested`. An ANAF refusal such as `{"eroare":"Nu aveti drept sa solicitati informatii despre CIF=…"}` returns `422` and sets the request to `error` with the message.

## Request object

| Field | Description |
|---|---|
| `requestType`, `params` | What was asked |
| `status` | `pending` → `requested` → `answered`, or `error` |
| `anafRequestId` | ANAF `id_solicitare` |
| `answerDocumentId` | The archived [SPV document](/api-reference/spv/list) holding the answer |
| `answeredAt`, `createdAt`, `requestedByName` | |
