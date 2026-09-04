---
title: Sync Declarations from ANAF
description: Retired server-side endpoint — answers 409 AGENT_REQUIRED; use the agent flow
method: POST
endpoint: /api/v1/declarations/sync
---

# Sync Declarations from ANAF

```
POST /api/v1/declarations/sync
```

**Retired.** ANAF's SPV web service (`webserviced.anaf.ro/SPVWS2`) accepts only the qualified digital certificate over mutual TLS; the OAuth token used for e-Factura is redirected to the login policy page. A server-side job therefore cannot talk to SPV, and this endpoint no longer queues one. It answers:

```json
{
  "error": "Declaratiile si mesajele SPV se pot prelua doar cu certificatul digital calificat, prin agentul local Storno. Porneste agentul si foloseste sincronizarea din aplicatie.",
  "code": "AGENT_REQUIRED",
  "hint": "Use the agent flow: POST /api/v1/declarations/sync-prepare, then relay ANAF's answer to POST /api/v1/declarations/sync-agent-result. See https://docs.storno.ro/agent"
}
```

with status `409 Conflict`.

## What to use instead

The [local Storno Agent](/agent) holds the certificate. The web app drives it automatically; for integrations the same flow is exposed as:

1. `POST /api/v1/declarations/sync-prepare` — returns the ANAF URL (and token) the agent must call with the certificate
2. the agent performs the ANAF request (`https://agent.storno.ro:17394/proxy`)
3. `POST /api/v1/declarations/sync-agent-result` — relay ANAF's raw answer; Storno updates the declarations

See [Agent endpoints](/api-reference/declarations/agent). The complete SPV inbox (somații, decizii, notificări, recipise) uses the same pattern under [SPV inbox sync](/api-reference/spv/sync).

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token |
| `X-Company` | string | Yes | Company UUID |

Requires the `declaration.submit` permission (the permission check still runs before the 409).
