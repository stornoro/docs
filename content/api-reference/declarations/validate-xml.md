---
title: Validate Declaration XML
description: Validate any ANAF declaration XML with ANAF's own DUKIntegrator validators, with or without an account
method: POST
endpoint: /api/v1/public/declarations/validate
---

# Validate Declaration XML

Runs a declaration XML through **ANAF's own validator** (DUKIntegrator with the form's `DxxxValidator.jar`, the same jars the ANAF portal uses), so the answer is the one SPV would give. Nothing is stored.

Two variants share the same behaviour:

| Endpoint | Auth | Limit |
|---|---|---|
| `POST /api/v1/public/declarations/validate` | none | 60 requests / hour / IP |
| `POST /api/v1/declarations/validate-xml` | Bearer token or API key with `declaration.view` | account limits |

Any form present in ANAF's manifest can be validated once its jars are installed on the server: D212, C168, D177, D700, D100, D112, D300, D390, D394 and the rest of the built-in set are always available.

## Request

Either JSON:

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/public/declarations/validate \
  -H "Content-Type: application/json" \
  -d '{"type": "D212", "xml": "<d212 xmlns=\"mfp:anaf:dgti:d212:declaratie:v11\" an_r=\"2025\" cif=\"1900101123456\" …/>"}'
```

or the raw file:

```bash {% title="cURL" %}
curl -X POST "https://api.storno.ro/api/v1/public/declarations/validate?type=C168" \
  -H "Content-Type: application/xml" \
  --data-binary @c168.xml
```

| Field | Type | Required | Description |
|---|---|---|---|
| `xml` | string | Yes (JSON variant) | The declaration document, at most 4 MB |
| `type` | string | No | Form code such as `D212`, `C168`, `D300`. Inferred from the root element when omitted |

## Response

```json
{
  "valid": false,
  "type": "D212",
  "namespace": "mfp:anaf:dgti:d212:declaratie:v11",
  "namespaceCorrected": true,
  "errors": [
    "E: cif: CNP-ul nu este valid",
    "E: cap11[1].venit_brut: valoare obligatorie"
  ],
  "warnings": [],
  "elapsedMs": 41,
  "xml": "<d212 xmlns=\"mfp:anaf:dgti:d212:declaratie:v11\" …"
}
```

`errors` and `warnings` are ANAF's messages, verbatim. When the root namespace was missing or belonged to another reporting period, Storno applies the namespace the validator asked for and validates again; `namespaceCorrected` is then `true` and `xml` carries the corrected document, which is the one to upload.

## Errors

| Status | Code | Meaning |
|---|---|---|
| 400 | `INVALID_JSON` / `INVALID_XML` | Body is not JSON with an `xml` field, or not an XML document |
| 413 | `PAYLOAD_TOO_LARGE` | More than 4 MB |
| 422 | `UNKNOWN_TYPE` | The form could not be inferred; send `type` |
| 429 | `RATE_LIMITED` | Hourly limit reached |
| 503 | `VALIDATOR_UNAVAILABLE` | The validation service is restarting; retry in a minute |

Validators are refreshed from ANAF's manifest weekly (`app:anaf:update-validators`), so a form version published by ANAF is picked up without a release.
