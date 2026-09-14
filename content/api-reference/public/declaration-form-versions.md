---
title: ANAF form versions
description: The current validator and PDF version of every ANAF declaration form, what changed lately, and whether this installation's validators lag behind
method: GET
endpoint: /api/v1/public/declarations/form-versions
---

# ANAF form versions

ANAF replaces declaration forms without much notice: a new PDF version, a new XSD, a new validator jar. A declaration built or validated with the previous version is rejected at filing. DUKIntegrator's own updater reads a manifest (`versiuni.xml`) that lists, for every form, the validator version (`J…`) and the PDF version (`P…`); Storno reads the same manifest every day, records each form's versions and when they changed, and shows the changes before anyone files.

## Request

```
GET /api/v1/public/declarations/form-versions
```

Public, cached for 15 minutes.

## Response

```json
{
  "checkedAt": "2026-09-14T05:30:02+00:00",
  "changedRecently": ["D300"],
  "localOutdated": ["D100", "D112"],
  "forms": [
    { "form": "D300", "storno": true, "versionJ": "J3.2.1", "versionP": "P2.0.3", "previousJ": "J3.2.0", "previousP": "P2.0.3", "changedAt": "2026-09-10T05:30:01+00:00", "firstSeenAt": "2026-09-01T05:30:00+00:00", "localJ": "J3.2.1", "localP": "P2.0.3", "localOutdated": false, "historyUrl": "http://static.anaf.ro/…/D300IstoriaVersiunilor.txt" }
  ]
}
```

| Field | Meaning |
|---|---|
| `storno` | Storno builds, validates or files this form itself |
| `changedRecently` | Storno forms whose version moved in the last 30 days: rebuild declarations made before `changedAt` |
| `localJ` / `localP`, `localOutdated` | the versions installed on this server (from the manifest saved by `update-jars.sh`) and whether they lag behind ANAF; fix with `php bin/console app:anaf:update-validators` |
| `historyUrl` | ANAF's own change log for the form |

The web app shows a notice on the declarations page while a Storno form changed recently or the local validators are outdated. MCP: `declaration_form_versions`. The daily check runs as `app:anaf:form-versions` (05:30); D212 and C168 are PDF forms outside this manifest and are covered by Storno's own builders.
