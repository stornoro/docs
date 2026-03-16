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
Frontend → GET /prepare → gets XML + ANAF token + URL
Frontend → POST https://agent.storno.ro:17394/proxy → local agent uses curl → ANAF SPV
Frontend → POST /agent-result → backend processes ANAF response
```

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

Prepares a declaration for agent-based submission. Returns the XML content, ANAF URL, Bearer token, and CIF.

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
| `operation` | string | No | `submit` (default), `listMessages`, or `download` |
| `downloadId` | string | No | ANAF download ID (required for `operation=download`) |

### Request

```bash {% title="cURL" %}
curl https://api.storno.ro/api/v1/declarations/a1b2c3d4/prepare \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid"
```

### Response (operation=submit)

```json
{
  "xml": "<?xml version=\"1.0\"?>...",
  "anafUrl": "https://webserviced.anaf.ro/SPVWS2/rest/cerere?tip=D394&cui=12345678",
  "anafToken": "eyJ...",
  "declarationType": "D394",
  "cif": "12345678"
}
```

### Response (operation=listMessages)

```json
{
  "anafUrl": "https://webserviced.anaf.ro/SPVWS2/rest/listaMesaje?zile=60",
  "anafToken": "eyJ...",
  "declarationType": "D394",
  "cif": "12345678"
}
```

---

## Agent Result

`POST /api/v1/declarations/{uuid}/agent-result`

Receives the ANAF response from the local agent after the mTLS-proxied request completes. The server parses the response, extracts the upload ID, sets the declaration status to `processing`, and dispatches asynchronous status checking.

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
| `statusCode` | integer | Yes | HTTP status code from ANAF response |
| `headers` | object | No | Response headers from ANAF |
| `body` | string | Yes | Response body from ANAF (JSON or XML) |

### Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/declarations/a1b2c3d4/agent-result \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid" \
  -H "Content-Type: application/json" \
  -d '{"statusCode": 200, "body": "{\"id_solicitare\": \"5000012345\"}"}'
```

### Response

Returns the updated declaration object with status `processing`.

```json
{
  "uuid": "a1b2c3d4",
  "type": "d394",
  "status": "processing",
  "anafUploadId": "5000012345",
  "metadata": {
    "uploadResult": {"id_solicitare": "5000012345"},
    "submittedViaAgent": true
  }
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid JSON, missing fields, or ANAF returned an error |
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Declaration not found |
