---
title: ANAF nomenclators
description: County, locality, street and fiscal-office codes required by ANAF declaration XML, served from Storno's local mirror
method: GET
endpoint: /api/v1/public/anaf/nomenclator/strazi/{judet}/{localitate}
---

# ANAF nomenclators

Every ANAF declaration XSD wants addresses as **codes**: `judet` (county), `cod_localit`, `cod_strada`, plus `ufisc` for the fiscal office. ANAF publishes them through the nomenclator service behind its web forms; Storno mirrors them locally so lookups are instant and independent of ANAF's availability. Public, cached one hour, 600 requests per minute per IP.

| Endpoint | Returns |
|---|---|
| `GET /api/v1/public/anaf/nomenclator/judete` | counties (`code`, `name`) |
| `GET /api/v1/public/anaf/nomenclator/organe-fiscale/{judet}` | fiscal offices of a county (`code` = `ufisc`, `name`) |
| `GET /api/v1/public/anaf/nomenclator/localitati/{judet}?q=` | localities (`code`, `name`, `siruta`, `codPrimarie`) |
| `GET /api/v1/public/anaf/nomenclator/strazi/{judet}/{localitate}?q=&limit=` | streets (`code`, `name`) |

`q` matches word prefixes and ignores diacritics: `maniu` finds `Bld. Iuliu Maniu`, `stefanesti` finds `Aleea Ştefăneşti`.

```bash {% title="cURL" %}
curl "https://api.storno.ro/api/v1/public/anaf/nomenclator/strazi/40/6?q=azurului"
```

```json
{"data": [{"code": "59", "name": "Str. Azurului"}]}
```

Counties, fiscal offices and localities are refreshed weekly; streets are fetched from ANAF the first time a locality is asked for, then kept and refreshed with the weekly sync (`app:anaf:nomenclator:sync`, `--strazi` for everything).
