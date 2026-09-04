---
title: Declaration forms (build, validate, PDF)
description: Build an ANAF declaration from plain JSON, validate it exactly like ANAF (DUKIntegrator plus ANAF's online validator) and get the PDF to upload, without an account
method: POST
endpoint: /api/v1/public/declarations/forms/{type}/build
---

# Declaration forms

These endpoints let any program, and in particular an AI assistant through the [MCP server](/integrations/cli), prepare an ANAF declaration end to end without uploading the taxpayer's documents anywhere: the assistant reads the contract on the user's side, sends Storno only the structured fields, and gets back the XML, ANAF's verdict and the PDF ANAF accepts for upload. No account, nothing stored, 60 requests per hour per IP.

Forms available today:

| Form | What it does | Attachment |
|---|---|---|
| `C168` | Registration, amendment or termination of a rental (lease) contract by the landlord (OPANAF 114/2019). | required: the scanned contract, addendum, or termination document / [sworn statement](/api-reference/public/legal-documents) |

## Catalog and specification

```
GET /api/v1/public/declarations/forms
GET /api/v1/public/declarations/forms/{type}
GET /api/v1/public/declarations/forms/{type}?xsd=1
```

The specification is written for a machine that has to fill the form correctly:

- `input`: the JSON structure Storno expects, every field with type, required/optional (or `requiredWhen`), enumerations with their meaning, and hints (where to get the code, what ANAF wants in it).
- `xml`: root element, namespace, period convention and every XSD attribute per element with its type and constraints, read from ANAF's bundled XSD (`?xsd=1` returns the schema itself).
- `rules`: the business rules ANAF applies, with source. Some come from the DUKIntegrator validator, some only from ANAF's web form (`BR-C168-…`), which is why a file that passes DUK can still be refused online.
- `filing`: the steps after the build, and `example`: a complete input that builds and validates.

## Build

```
POST /api/v1/public/declarations/forms/C168/build
Content-Type: application/json

{ "input": { …see the specification's example… }, "validate": true, "online": true }
```

Storno writes the XML, applies its own checks, validates with ANAF's DUKIntegrator (the portal's validator) and, for C168, sends the XML to ANAF's online validator behind the web form. Set `validate: false` to skip DUK, `online: false` to skip the ANAF call.

```json
{
  "type": "C168",
  "valid": false,
  "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<c168 xmlns=\"mfp:anaf:dgti:c168:declaratie:v3\" …",
  "issues": [
    { "level": "error", "code": "BR-C168-0041", "field": "contracte[0].bun.adresa.codPostal", "message": "Pentru imobil, trebuie completate toate câmpurile de adresă: județ, localitate, bloc/scară/etaj/ap și cod poștal." },
    { "level": "warning", "code": "BR-C168-005911", "field": "contracte[0].locatari[0].cif", "message": "Cif-ul chiriașului este obligatoriu și numeric dacă s-a selectat adresa în România …" }
  ],
  "validation": {
    "duk": { "valid": true, "errors": [], "warnings": [], "elapsedMs": 412 },
    "dukError": null,
    "anafOnline": { "valid": false, "messages": ["[BR-C168-005911] Cif-ul chiriasului este obligatoriu si numeric dacă s-a selectat adresa in România."], "traceId": "…" }
  },
  "next": "Fix the issues / validation errors and build again."
}
```

`valid` is true only when there are no error-level issues, DUK accepts the file and ANAF's online validator (when reachable) accepts it too. Warnings do not block: a termination without the tenant's CNP is refused by the web form but accepted by the e-guvernare portal upload through the agent, which is why that rule is a warning.

Rules applied by the C168 builder, all listed in the specification: required fields and `DD.MM.YYYY` dates (ISO dates are converted); Romanian addresses need the county, locality and street codes from the [nomenclator](/api-reference/public/anaf-nomenclator); the rented property needs a postal code; the declared income share must equal the sum of the co-owners' shares; CNP control digits are verified; the competent fiscal office is written only for a NIF; ownership fraction and share of the good exclude each other. Identifiers are never invented or padded: ANAF rejects them and a false identifier is a false declaration.

## PDF

```
POST /api/v1/public/declarations/pdf
POST /api/v1/public/declarations/pdf?format=pdf
Content-Type: application/json

{ "type": "C168", "xml": "<validated XML>", "attachments": [ { "name": "contract.pdf", "contentBase64": "…" } ] }
```

DUKIntegrator renders ANAF's PDF form with the XML embedded and the attachments zipped inside (PDF, JPG, PNG, TIFF, 10 MB in total; a single `.zip` is used as is). The XML is validated first and a rejected file returns the errors instead of an opaque failure. Without `?format=pdf` the answer is JSON with `pdfBase64`, `bytes`, `fileName` and the next step.

The PDF is what gets uploaded: through the [Storno Agent](/agent) with a qualified certificate (`agent_submit_declaration_pdf`, returns ANAF's index), or by the taxpayer in SPV. Track it with the [status endpoint](/api-reference/public/declaration-status).

## Errors

| Status | Code | Description |
|---|---|---|
| `400` | `INVALID_JSON`, `INVALID_ATTACHMENT` | body is not JSON, or an attachment is not base64 |
| `404` | `UNKNOWN_FORM` | no builder for this type |
| `413` | `PAYLOAD_TOO_LARGE` | build over 512 KB, PDF request over 16 MB |
| `422` | `VALIDATION_FAILED`, `UNKNOWN_TYPE` | attachment missing where required, XML rejected by ANAF, type not given |
| `429` | `RATE_LIMITED` | more than 60 requests per hour from this IP |
| `503` | `VALIDATOR_UNAVAILABLE` | DUKIntegrator not running |
