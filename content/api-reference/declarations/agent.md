---
title: Agent Endpoints (Prepare & Result)
description: Endpoints for local agent-based declaration submission using hardware USB tokens
method: GET/POST
endpoint: /api/v1/declarations/{uuid}/prepare, /api/v1/declarations/{uuid}/agent-result
---

# Agent Endpoints

These endpoints support the **local agent flow** for submitting declarations via hardware USB tokens (SafeNet eToken, Feitian, certSIGN). The private key never leaves the user's device — instead, a local agent on the user's machine proxies the mTLS request to ANAF using `curl` with OS-level certificate access.

## Flow

```
Frontend → GET /prepare → gets the PDF to file + upload URL + ANAF token
Frontend → POST https://agent.storno.ro:17394/proxy → local agent uses curl → ANAF SPV
Frontend → POST /agent-result → backend processes ANAF response
```

Every SPVWS2 call — `cerere` (submission), `listaMesaje` (inbox listing) and `descarcare` (PDF download) — requires the qualified certificate over mTLS; the ANAF OAuth token used for e-Factura is not accepted by SPVWS2 (it redirects to the F5 login policy). All three therefore go through the agent. See the [SPV inbox sync](/api-reference/spv/sync) for the document archive flow and the [Storno Agent guide](/agent) for installation and certificates.

## Local Agent

The Storno ANAF Agent runs locally on `https://agent.storno.ro:17394` and provides these endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check — returns version, platform, and update status |
| GET | `/certificates` | List detected client certificates (hardware tokens + OS store) |
| POST | `/proxy` | Proxy a single mTLS request to ANAF via curl |
| POST | `/batch` | Proxy multiple mTLS requests sequentially |
| POST | `/update` | Trigger self-update to the latest version from GitHub releases |

### Auto-Update

The `/health` endpoint returns update availability:

```json
{
  "status": "ok",
  "version": "1.1.0",
  "platform": "darwin",
  "update": {
    "available": true,
    "latest": "1.2.0",
    "download": "https://github.com/stornoro/storno/releases/download/agent-v1.2.0/storno-agent-macos-arm64"
  }
}
```

When `update.available` is `true`, the frontend shows a banner. The user can trigger the update via `POST /update`, which downloads the new binary, replaces the current one, and restarts the agent.

Download the agent at [get.storno.ro/agent](https://get.storno.ro/agent).

---

## Prepare Declaration

`GET /api/v1/declarations/{uuid}/prepare`

Prepares a declaration for agent-based filing. For `operation=submit` it generates and stores the XML and the PDF and returns the PDF with the upload details; the other operations return the ANAF URL and token the agent must call. Requires the `declaration.submit` permission.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Declaration UUID |

### Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `operation` | string | No | `submit` (default), `listMessages` or `download` |
| `downloadId` | string | For `download` | ANAF download id of the message to fetch |

### Request

```bash {% title="cURL" %}
curl https://api.storno.ro/api/v1/declarations/a1b2c3d4/prepare \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid"
```

### Response (operation=submit)

```json
{
  "pdfBase64": "JVBERi0xLjQK...",
  "anafUrl": "https://decl.anaf.mfinante.gov.ro/WAS6DUS/displayFile.do",
  "uploadMode": "multipart",
  "uploadField": "linkdoc",
  "fileName": "D394_12345678_a1b2c3d4.pdf",
  "sessionUrl": "https://decl.anaf.mfinante.gov.ro/WAS6DUS/",
  "anafToken": "eyJ...",
  "declarationType": "D394",
  "cif": "12345678"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `pdfBase64` | string | The PDF to upload, base64 encoded |
| `anafUrl` | string | URL of the ANAF declarations portal upload form |
| `uploadMode` | string | Always `multipart` |
| `uploadField` | string | Name of the multipart field that carries the PDF (`linkdoc`) |
| `fileName` | string | File name to send with the upload |
| `sessionUrl` | string | Portal URL the agent opens first to get a session |
| `anafToken` | string \| null | Bearer token of the company, or `null` when none is available (the upload itself uses the certificate) |
| `declarationType` | string | Declaration type in upper case |
| `cif` | string | Company CIF |

### Response (operation=listMessages)

```json
{
  "anafUrl": "https://webserviced.anaf.ro/SPVWS2/rest/listaMesaje?zile=60",
  "anafToken": "eyJ...",
  "declarationType": "D394",
  "cif": "12345678"
}
```

### Response (operation=download)

```json
{
  "anafUrl": "https://webserviced.anaf.ro/SPVWS2/rest/descarcare?id=100000123",
  "anafToken": "eyJ...",
  "declarationType": "D394",
  "cif": "12345678"
}
```

`listMessages` and `download` need a valid ANAF token for the company.

### Error codes

Errors have the body `{"error": "message"}`, with an extra `code` on some of them.

| Status Code | Description |
|-------------|-------------|
| 400 | The declaration is `submitted`, `processing` or `accepted`; the operation is not one of the three; `downloadId` is missing; or no valid ANAF token exists for `listMessages` or `download` |
| 403 | The caller lacks the `declaration.submit` permission |
| 404 | Declaration not found |
| 409 | Another C168 of the company is still being processed (`code: C168_IN_PROCESSING`, with `otherDeclarationId`) |

---

## Agent Result

`POST /api/v1/declarations/{uuid}/agent-result`

Receives the ANAF response from the local agent after the mTLS-proxied request completes. The server reads the response, extracts the upload index, sets the declaration status to `processing` and starts the status check. A response that carries an error, a login page or an HTTP status of 400 or more sets the status to `error` with `errorMessage`.

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | `application/json` |

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Declaration UUID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `statusCode` | integer | No | HTTP status code from ANAF response; a value of 400 or more marks the declaration as `error` |
| `headers` | object | No | Response headers from ANAF |
| `body` | string | No | Response body from ANAF (JSON, XML or the portal's HTML answer) |

### Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/declarations/a1b2c3d4/agent-result \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid" \
  -H "Content-Type: application/json" \
  -d '{"statusCode": 200, "body": "{\"id_solicitare\": \"5000012345\"}"}'
```

### Response

Returns the declaration object with status `processing`, or with status `error` and `errorMessage` when ANAF refused the filing. Both answer 200.

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d394",
  "status": "processing",
  "anafUploadId": "5000012345",
  "errorMessage": null,
  "metadata": {
    "uploadResult": {"id_solicitare": "5000012345"},
    "submittedViaAgent": true
  }
}
```

The other fields are the ones described in [get declaration](/api-reference/declarations/get).

## Error Codes

Errors have the body `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 400 | The request body is not valid JSON |
| 401 | Missing or invalid authentication token |
| 403 | The caller lacks the `declaration.submit` permission |
| 404 | Declaration not found |
