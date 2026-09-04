---
title: Generate storno XML (public)
description: Generate a validated e-Factura XML for a storno invoice without an account
method: POST
endpoint: /api/v1/public/storno-generator
---

# Generate storno XML (public)

Generates an e-Factura (UBL 2.1, CIUS-RO 1.0.1) XML for a storno invoice from the data you send, runs it through the same XSD and Schematron validation Storno uses before submitting to ANAF, and returns the XML together with the validation report. Nothing is stored and no account is required.

This is the endpoint behind the free tool at [storno.ro/generator-factura-storno](https://storno.ro/generator-factura-storno). It is also useful for testing what a storno looks like before integrating the authenticated invoice API.

The output is the same document shape Storno issues for stornos: an `Invoice` with `InvoiceTypeCode` 380, negated line quantities and a `BillingReference` pointing at the original invoice.

```
POST /api/v1/public/storno-generator
```

## Limits

- No authentication. Rate limited to 30 requests per hour per IP address.
- Request body at most 64 KB, at most 50 lines.
- RON only. For other currencies use the authenticated [invoices API](/api-reference/invoices/create).
- The XML is not sent to ANAF. To submit it, create an account and use [submit invoice](/api-reference/invoices/submit), or upload the file in SPV yourself.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Content-Type` | string | Yes | Must be `application/json` |

## Request body

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `seller` | object | Yes | The issuer of the original invoice (see below) |
| `buyer` | object | Yes | The customer on the original invoice (see below) |
| `original.number` | string | Yes | Number of the invoice being cancelled. Must contain a digit. |
| `original.issueDate` | string | Yes | Issue date of the original invoice, `YYYY-MM-DD` |
| `storno.number` | string | No | Number of the storno invoice. Default `STORNO-<YYYYMMDD>` |
| `storno.issueDate` | string | No | Issue date of the storno, `YYYY-MM-DD`. Default today |
| `storno.notes` | string | No | Free text, max 300 chars. Default `Storno factura #<number> din <date>` |
| `currency` | string | No | Only `RON` is accepted |
| `lines` | array | Yes | 1 to 50 lines exactly as they appear on the original invoice (see below) |

### `seller`

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Legal name |
| `cif` | string | Yes | CUI/CIF, with or without the `RO` prefix |
| `vatPayer` | boolean | No | Default `true`. When `false`, every line must have `vatRate` 0 and lines get VAT category `O` |
| `registrationNumber` | string | No | Trade register number, e.g. `J12/345/2020` |
| `address` | string | Yes | Street address |
| `city` | string | Yes | City. For Bucharest use the sector, e.g. `Sector 3` |
| `county` | string | Yes | County name or ISO 3166-2 code, e.g. `Cluj` or `CJ` |
| `country` | string | No | ISO 3166-1 alpha-2, default `RO` |
| `email`, `phone` | string | No | Contact details |
| `bankAccount`, `bankName` | string | No | IBAN and bank, emitted as payment means |

### `buyer`

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | No | `company` (default) or `individual` |
| `name` | string | Yes | Legal name or person name |
| `cui` | string | For companies | CUI/CIF |
| `cnp` | string | For individuals | 13-digit personal number |
| `vatPayer` | boolean | No | Default `true` for companies, `false` for individuals |
| `registrationNumber` | string | No | Trade register number |
| `address`, `city`, `county` | string | Yes | Same rules as the seller |
| `country` | string | No | Default `RO` |

### `lines[]`

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `description` | string | Yes | Max 200 chars |
| `quantity` | number or string | Yes | Positive, as on the original invoice. The generator negates it. |
| `unitPrice` | number or string | Yes | Positive unit price |
| `vatRate` | number or string | No | One of `0`, `5`, `9`, `11`, `19`, `21`. Default `21` for VAT payers, `0` otherwise |
| `unitOfMeasure` | string | No | `buc` (default), `kg`, `l`, `m`, `ora`, `zi`, `luna`, `set`, `pachet` |
| `vatIncluded` | boolean | No | Unit price already includes VAT. Default `false` |
| `vatCategoryCode` | string | No | UNCL5305 code: `S`, `Z`, `E`, `AE`, `O`, `K`, `G`. Derived when omitted: `O` for non-VAT sellers, `Z` for 0%, `S` otherwise |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/public/storno-generator \
  -H "Content-Type: application/json" \
  -d '{
    "seller": {
      "name": "Exemplu Furnizor SRL",
      "cif": "RO12345678",
      "registrationNumber": "J12/345/2020",
      "address": "Str. Exemplului nr. 1",
      "city": "Cluj-Napoca",
      "county": "Cluj"
    },
    "buyer": {
      "name": "Client Test SRL",
      "cui": "87654321",
      "address": "Bd. Unirii nr. 10",
      "city": "Sector 3",
      "county": "Bucuresti"
    },
    "original": { "number": "FCT-0123", "issueDate": "2026-08-10" },
    "storno": { "number": "STR-0007", "issueDate": "2026-09-04" },
    "lines": [
      { "description": "Servicii consultanta", "quantity": 2, "unitPrice": 100, "vatRate": 21 }
    ]
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/public/storno-generator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    seller: { name: 'Exemplu Furnizor SRL', cif: 'RO12345678', address: 'Str. Exemplului nr. 1', city: 'Cluj-Napoca', county: 'Cluj' },
    buyer: { name: 'Client Test SRL', cui: '87654321', address: 'Bd. Unirii nr. 10', city: 'Sector 3', county: 'Bucuresti' },
    original: { number: 'FCT-0123', issueDate: '2026-08-10' },
    storno: { number: 'STR-0007' },
    lines: [{ description: 'Servicii consultanta', quantity: 2, unitPrice: 100, vatRate: 21 }],
  }),
});
const { xml, valid, errors } = await response.json();
```

## Response

```json
{
  "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Invoice xmlns=\"urn:oasis:names:specification:ubl:schema:xsd:Invoice-2\" ...>...</Invoice>",
  "valid": true,
  "errors": [],
  "warnings": [],
  "schematronChecked": true,
  "totals": {
    "subtotal": "-200.00",
    "vatTotal": "-42.00",
    "total": "-242.00",
    "currency": "RON"
  },
  "filename": "storno-STR-0007.xml"
}
```

| Field | Description |
|-------|-------------|
| `xml` | The UBL 2.1 XML, ready to upload in SPV |
| `valid` | `true` when both XSD and Schematron validation passed |
| `errors` | Validation errors with `message`, `source` (`xsd` or `schematron`) and, when known, `ruleId` and `location` |
| `warnings` | Non-blocking notes, for example when Schematron could not run |
| `schematronChecked` | `false` when only the XSD check ran; treat the XML as unverified against CIUS-RO rules |
| `totals` | Negative amounts of the storno |
| `filename` | Suggested file name |

## Error codes

| Status | `code` | Description |
|--------|--------|-------------|
| 400 | `INVALID_JSON` | Body is not valid JSON |
| 413 | `PAYLOAD_TOO_LARGE` | Body exceeds 64 KB |
| 422 | `VALIDATION_FAILED` | Payload incomplete or invalid. `fieldErrors` maps dotted field paths (`seller.cif`, `lines.0.quantity`) to messages |
| 429 | `RATE_LIMITED` | More than 30 requests in an hour from this IP |
| 500 | `GENERATION_FAILED` | Unexpected failure while generating the XML |
