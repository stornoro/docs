---
title: Create Declaration
description: Create a new tax declaration with data auto-populated from invoices
method: POST
endpoint: /api/v1/declarations
---

# Create Declaration

Creates a new tax declaration in `draft` status. The declaration's `data` field is automatically populated by aggregating invoice data for the specified type and period. The resulting draft can be reviewed, edited, validated, and submitted to ANAF.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Declaration type: `d394`, `d300`, `d390`, `d301`, `d398`, `d100`, `d112`, `d212`, `c168` |
| `year` | integer | Yes | Fiscal year (e.g., 2026) |
| `month` | integer | Yes | Fiscal month (1–12) |
| `periodType` | string | No | Period type override (e.g., `monthly`, `quarterly`). Defaults to the standard period for the declaration type |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/declarations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "d394",
    "year": 2026,
    "month": 1
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'd394',
    year: 2026,
    month: 1
  })
});

const data = await response.json();
```

## Response

Returns `201 Created` with the new declaration object.

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d394",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "draft",
  "data": {
    "totalSalesBase": "84033.61",
    "totalSalesVat": "15966.39",
    "totalPurchasesBase": "42016.81",
    "totalPurchasesVat": "7983.19",
    "invoiceCount": 47
  },
  "metadata": {
    "generatedAt": "2026-02-10T08:00:00Z",
    "invoiceCountAtGeneration": 47
  },
  "errorMessage": null,
  "anafUploadId": null,
  "xmlPath": null,
  "recipisaPath": null,
  "createdAt": "2026-02-10T08:00:00Z",
  "updatedAt": "2026-02-10T08:00:00Z",
  "createdBy": "user-uuid-here"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier of the created declaration |
| `type` | string | Declaration type |
| `year` | integer | Fiscal year |
| `month` | integer | Fiscal month |
| `periodType` | string \| null | Resolved period type |
| `status` | string | Always `draft` on creation |
| `data` | object | Auto-populated fiscal data aggregated from invoices for the period |
| `metadata` | object | Generation metadata including timestamp and invoice count snapshot |
| `errorMessage` | string \| null | Always `null` on creation |
| `anafUploadId` | string \| null | Always `null` on creation |
| `xmlPath` | string \| null | Always `null` on creation |
| `recipisaPath` | string \| null | Always `null` on creation |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 last-updated timestamp |
| `createdBy` | string | UUID of the authenticated user |

## D300 (decont de TVA)

`data.rows` is keyed by ANAF's own XML attribute names (`R9_1` = base of row 9, `R9_2` = its VAT, …), in whole lei, so the XML is written exactly as populated and the values can be edited before filing. The form version follows the period (`data.layout`):

| Period | Layout | Standard rows |
|---|---|---|
| until 07/2025 | `legacy` | 19 % → R9, 9 % → R10, 5 % → R11 |
| 08–12/2025 | `v2025h2` | 21 % → R9, 11 % → R10, plus R69 / R70 / R71 (sales) and R74 / R75 / R24 (purchases) for the old 19 / 9 / 5 % |
| from 01/2026 | `v2026` | 21 % → R9, 11 % → R10; old rates only as regularisations |

How invoices are placed:

- **Sales** are taken by issue date. Taxable lines go to the rate's row; category `AE` (or invoice type *taxare inversă*) to row 13 (base only); intra-community goods to row 1, intra-community services and exports to rows 3 / 3.1; exempt with deduction to row 14, exempt without to row 15; OSS (art. 314–315) to row 17; a line at a rate the form no longer has, or an invoice issued to the company's own CUI, is a regularisation (row 16). Category `O` and the margin / travel-agent regimes stay out of the return.
- **Purchases** are taken by the date they were recorded in Storno. Domestic taxable lines go to rows 24 / 25; a supplier invoice dated before the period, or at an abrogated rate, is a regularisation (row 33). Reverse charge is self-assessed on both sides: domestic `AE` → rows 12 (12.1 / 12.2 by rate) and 26 (26.1 / 26.2); intra-community goods → rows 5 / 5.1 and 20 / 20.1; services from the EU → rows 7 / 7.1 and 22 / 22.1; services from outside the EU → rows 7 and 22. Exempt purchases and imported goods go to row 29. Foreign-currency invoices use the invoice's exchange rate.
- Rows are rounded to whole lei (half up); totals (rows 19, 30, 35, 37, 44, 45) are sums of rows; row 42 of the previous period's D300 is carried into row 42 (`R38_2`) when no refund was requested.

The header the validator requires is filled from the company: declarant (`representative` split into name / first name, `representativeRole`), `caenCode`, the default bank account, `tip_decont` (L / T), the checkboxes (`N`), `temei` (0) and the payment reference `nr_evid` (computed). Missing prerequisites are listed in `data.warnings` (`MISSING_CAEN`, `MISSING_REPRESENTATIVE`, `MISSING_BANK_ACCOUNT`, `UNMAPPED_LINES`); the validator refuses the return without them.

## D301 (decont special de TVA)

Monthly, for companies **not registered for VAT** (`vatPayer: false`) that bought goods or services from abroad on which they owe Romanian VAT themselves. Populated from the received invoices recorded in the month (`data.sections`, one row per supplier invoice and operation), with the header and the section totals in `data.rows` under ANAF's attribute names:

| Supplier | Line | Section (`tip_operatie`) |
|---|---|---|
| EU member state | goods | 1 — achiziții intracomunitare de bunuri |
| EU member state | services | 4 — operațiuni cu TVA datorat de beneficiar, repeated as 4.1 (`tip_operatie` 5) when the provider is registered for VAT |
| outside the EU | services | 4 |
| outside the EU | goods | left out (import: the VAT is paid in customs), counted in `invoiceCounts.imports` |
| Romania | any | left out |

Each section carries `nr_doc`, `data_doc` (dd.mm.yyyy), `val_valuta` and `tip_valuta` (the invoice's amount and currency; a currency the form does not list is converted to RON), `curs_valutar` (the invoice's exchange rate, 1 for RON), `baza` (whole lei) and `tva` = base × the standard rate (19 % for invoices dated before 2025-08-01, 21 % after), whole lei, half up. `baza1` … `tva5` are the sums per section and `totalPlata_A` the control sum of all of them; the XML recomputes them from the sections, so a hand-edited table stays consistent. Sections 2 (new means of transport) and 3 (excise goods) are never filled.

The header follows the validator: `d_rec` 0, `mijl_trans` 0, `temei` 2 (an initial return must not use 1), `pers_inreg` 1 (2 when the company holds a VAT code for intra-community acquisitions only), bank name and IBAN of the default bank account, declarant name / first name / role from `representative` and `representativeRole`, and the payment reference `nr_evid` (23 digits: `1030101` + MMYY + `25` + due month/year + `0000` + check digits). Warnings: `COMPANY_IS_VAT_PAYER`, `MISSING_REPRESENTATIVE`, `MISSING_BANK_ACCOUNT`, `UNSUPPORTED_CURRENCY`, `MISSING_EXCHANGE_RATE`, `IMPORTS_EXCLUDED`, `NO_OPERATIONS`.

## D398 (declarația specială de TVA — OSS, regimul UE)

Quarterly (`periodType: quarterly`; pass any month of the quarter, the return is reported under the quarter's last month in `luna_r`). Populated from the sales issued in the quarter with `invoiceTypeCode: special_regime_art_314_315` to customers in **other member states**: one block per member state of consumption in `data.states` (`mscon_state`, the four `vat_total_*` totals, `grand_total`, `due_balance`) and, inside it, one `supplies` row per supply type (1 goods / 2 services, from the product's *service* flag), VAT rate type (1 standard / 2 reduced) and rate. Amounts are in **EUR**, the only currency of the form:

- EUR invoices are taken as they are;
- RON invoices are converted at the **ECB reference rate of the last day of the quarter** or, when nothing was published that day (weekend, holiday), of the next publication day — the rule of art. 315 Cod fiscal for the OSS return. The rate used is reported in `data.eurRate` (`rate`, `date`, `source: ecb`);
- while the quarter is still running, or when the ECB data portal is unreachable, the BNR rate of the day is used instead (`source: bnr`) and the return carries the `EUR_RATE_FALLBACK` warning: regenerate the declaration once the quarter has ended, before filing;
- other currencies go to RON with the invoice's exchange rate, then to EUR as above. `data.eurRate` is `null` when every invoice is in EUR.

The VAT rate is the destination state's: a line's own rate is kept when it is one of that state's rates, otherwise the standard rate applies (live EU rates, with the list ANAF's validator ships as a fallback — `EU_RATES_OFFLINE`); `vat_amount` = base × rate / 100 rounded to 2 decimals. Sales to Romania, to non-EU customers and services to Northern Ireland (XI) are left out (`DOMESTIC_EXCLUDED`, `NON_EU_EXCLUDED`, `XI_SERVICES_EXCLUDED`). The header uses the union scheme (`moes_voes_imp` 1, `e_int` 0), `vat_id_no` = the company's VAT code, `period_start_date` / `period_end_date`, `grand_total_vat_due` (sum of the positive balances) and `nil_vat_return` 1 when there is nothing to declare (`NO_OPERATIONS`); `totalPlata_A` is the form's control sum (`moes_voes_imp` + `nil_vat_return`). `COMPANY_NOT_VAT_PAYER` and `MISSING_EUR_RATE` flag the other prerequisites.

## D394 (declaratia informativa 394)

`data` mirrors the sections of the form (XSD `mfp:anaf:dgti:d394:declaratie:v5`), in whole lei, so the XML is written exactly as populated and passes ANAF's validator (DUKIntegrator). The period follows the VAT period (`periodType` monthly → `tip_D394` = L, quarterly → T with `luna` = last month of the quarter). Invoices are selected like for the D300: sales by issue date, purchases by the date they were recorded; drafts, cancelled and rejected documents are out.

| Key | Content |
|---|---|
| `header` | `luna`, `an`, `tip_D394`, `sistemTVA` (1 when the company applies VAT on collection), `op_efectuate`, company identification (`cui`, `caen`, `den`, `adresa`, `telefon`, `mail`), the legal representative (`denR`, `functie_reprez`, `adresaR`) and who filled the form (`tip_intocmit` 0, `den_intocmit`, `cif_intocmit`, `calitate_intocmit`), `optiune` 0, `prsAfiliat` 0 |
| `partners` | the `op1` rows: one per (`tip_partener`, `cuiP`, `tip`, `cota`) with `denP`, `nrFact` (invoices in the row), `baza`, `tva` (only for L / A) and, for private persons without CNP, `taraP` = RO and the numeric county code `judP` |
| `rezumat1` | one row per (`tip_partener`, `cota`) with the attribute groups the validator demands for that pair, summed from `partners` |
| `rezumat2` | one row per non-zero rate: `nrFacturiL` / `bazaL` / `tvaL`, `nrFacturiA` / `bazaA` / `tvaA`, `nrFacturiAI` / `bazaAI` / `tvaAI` over all partners, fiscal-receipt fields 0 |
| `serieFacturi` | per invoice series used in the period: `tip` 1 (allocated range: 1 → the series counter) and `tip` 2 (first / last number issued in the period) |
| `informatii` | `nrCui1`…`nrCui4` (partners per type; type 2 counts rows), `nrFacturi` (invoices issued), `tvaDed<cota>` / `tvaCol<cota>` (only when `sistemTVA` = 1), `tvaDedAI*` 0, `solicit` 0 and the refund block flags (`achizitiiB<cota>`, `BUN<cota>`, `Prest<cota>`, `valoareScutit`, `LIntra`, `PrestIntra`, `Export`, `efectuat` — 0 / 1, written only when `solicit` = 1) |
| `totalPlata_A` | the control sum: Σ `nrCui1..4` + Σ `rezumat2` (`bazaL` + `bazaA` + `bazaAI`) |
| `sales`, `purchases`, `totals`, `rezumat` | 2-decimal summaries per partner and per rate for display |
| `invoiceCounts`, `excluded` | how many invoices were issued / received / declared and why lines were left out (`simplified`, `own_cui`, `foreign_purchase`, `intra_community`, `export`, `outside_scope`) |
| `warnings` | `{code, message}` — what to fix before filing |

How partners and operations are classified:

- **Partner type**: RO and registered for VAT with a valid CUI → 1; RO not registered for VAT (a company with its CUI, a private person with a CNP, or a private person without identifier) → 2; EU country → 3; elsewhere → 4. Types 3 / 4 are identified by their VAT number with the country prefix. Private persons without an identifier are aggregated into one row per operation type and rate, named `PERSOANE FIZICE`, with the county most of them share.
- **Sales**: lines with VAT → `L` at the line's rate; lines without VAT (exempt, 0 %) → `LS`. Intra-community deliveries (category `K`) and exports (`G`) are declared in D390 / customs and only raise the `LIntra` / `PrestIntra` / `Export` flags; reverse-charge sales (`AE`, type `V`) need the goods-code breakdown (op11) Storno does not keep and are reported in `warnings`.
- **Purchases**: from RO VAT payers with VAT → `A`, without VAT → `AS`; from RO suppliers not registered for VAT (with a CUI) → `N` with the invoice as document (`tip_document` 1). Intra-community acquisitions and imports are not declared in D394; reverse-charge purchases (`C`) and purchases from private persons need op11 and are reported in `warnings`. Suppliers applying VAT on collection cannot be told apart, so their invoices are declared as `A` (not `AI`).
- Invoices to / from the company's own CUI and simplified invoices are left out; a partner with a wrong CUI check digit or without identifier is left out and reported.
- Rows are rounded to whole lei (half up) after grouping; the summaries are sums of rows. Foreign-currency invoices use the invoice's exchange rate.

Warnings: `MISSING_CAEN`, `MISSING_REPRESENTATIVE`, `MISSING_ADDRESS`, `MISSING_PHONE` (the validator refuses the declaration without them), `PARTNER_WITHOUT_ID`, `PARTNER_INVALID_CUI`, `PARTNER_WITHOUT_COUNTY`, `REVERSE_CHARGE_SALES_SKIPPED`, `REVERSE_CHARGE_PURCHASES_SKIPPED`, `INDIVIDUAL_SUPPLIER_SKIPPED`, `UNSUPPORTED_RATE`, `VAT_ON_COLLECTION_BY_INVOICE`.

## D406 (SAF-T)

The standard audit file (`AuditFile`, schema `Ro_SAFT_Schema_v2.4.9`, namespace `mfp:anaf:dgti:d406:declaratie:v1`), built from the company's documents of the period. The period follows the VAT period — `periodType: monthly` (`HeaderComment` L) or `quarterly` (T); a company not registered for VAT reports quarterly. Invoices are selected like for the VAT return (sales by issue date, purchases by the date they were recorded; drafts, cancelled and rejected documents are out) and the payments are the ones recorded on those invoices inside the period.

| Key | Content |
|---|---|
| `header` | the `Header`: `registrationNumber` (`RO` + CUI for a VAT payer), name and address (`region` = ISO county code), the contact built from `representative` and the phone, the VAT registration (`100010` registered, `100040` VAT on collection, `100020` not registered), the bank accounts (IBAN), `headerComment` L / T, `taxAccountingBasis` A and the reporting period |
| `accounts` | the accounts used, with the movements of the period (`debit`, `credit`) and the closing balance; opening balances are 0 |
| `customers`, `suppliers` | one row per partner of the period: the SAF-T id, name, city, country, the account (4111 / 401), what was invoiced and settled, and the balances |
| `taxCodes`, `uoms`, `products` | the VAT tax codes (tax type `300`), the units of measure and the products used in the period |
| `journals` | the derived ledger: `VANZARI`, `CUMPARARI`, `BANCA`, `CASA`, each with its transactions and lines |
| `salesInvoices`, `purchaseInvoices`, `payments` | the source documents, with their lines, tax information and totals |
| `counts`, `totals` | how many entries each section has and the totals per section (the ledger's `debit` equals its `credit`) |
| `mapping` | the document → ledger mapping below, as rows |
| `warnings` | `{code, message}` — what to fix and what an accountant must add |

### Document to ledger mapping

Storno keeps documents, not a double-entry ledger, so `GeneralLedgerEntries` is derived from the invoices and payments with this fixed mapping (amounts in RON; a document in another currency also carries its `CurrencyAmount` and the invoice's exchange rate):

| Document | Debit | Credit | Notes |
|---|---|---|---|
| Sales invoice | 4111 (gross) | 707 / 7015 (net, per line) | 707 when the line's product is a service, 7015 otherwise |
| Sales invoice, VAT | 4111 | 4427 | one line per VAT rate |
| Purchase invoice | 604 / 628 (net, per line) | 401 (gross) | 628 for services, 604 otherwise |
| Purchase invoice, VAT | 4426 | 401 | only when the company is registered for VAT; otherwise the VAT stays in the expense and the line is booked gross |
| Receipt | 5121 / 5311 | 4111 | 5311 for a cash payment, 5121 otherwise |
| Payment | 401 | 5121 / 5311 | idem |
| Credit note / storno | the same accounts | the same accounts | the amounts move to the opposite side, so every `DebitAmount` / `CreditAmount` stays ≥ 0 |

Partners are identified the way ANAF's validator demands: `00` + CUI for a Romanian company, `01` / `02` + country + VAT number for an EU / non-EU one, `03` + CNP for a natural person, `04` + a code the company assigns for a natural person who does not give a CNP, `05` / `06` + country + code for a foreign partner without a VAT number. A document whose partner has no identifier at all, or one whose CUI / CNP check digit is wrong, is left out and reported in `warnings`.

VAT is reported with the tax codes of the SAF-T nomenclature (tax type `300`): standard sales `310344` (21 %), `310309` (19 %), `310351` (11 %), `310310` (9 %), `310311` (5 %), VAT on collection `3103xx`, reverse charge `310312`, intra-community deliveries `310301` / `310306`, exports `310313`, exempt `310314` / `310326`, outside the scope `310324`; purchases use the `3011xx` / `3013xx` / `3009xx` / `3001xx` / `3007xx` / `3012xx` series, and a company not registered for VAT the non-deductible `35xxxx` series. Lines that carry no tax (the partner and treasury lines of a journal entry, every payment line) use the pair `000` / `000000` ANAF prescribes.

### What Storno cannot fill

The file passes ANAF's validator, but it is not a complete accounting export. `warnings` says so explicitly:

- `NO_OPENING_BALANCES` — the opening balances of the accounts, customers and suppliers are 0 and the closing balances are only the movements of the period;
- `LEDGER_FROM_DOCUMENTS_ONLY` — entries without a document (payroll, depreciation, the VAT closing 4423 / 4424, bank charges, adjustments), stock (`MovementOfGoods`, `PhysicalStock`) and fixed assets (`Assets`, `AssetTransactions`) are not generated;
- `REVERSE_CHARGE_VAT_NOT_BOOKED` — reverse-charge lines (intra-community acquisitions, imports, art. 331) are reported with the VAT of the invoice (0); the 4426 = 4427 entry for the self-assessed tax is not generated;
- `CASH_MOVEMENTS_NOT_INCLUDED` — cash-register movements without a partner (deposits, withdrawals) are not in the file, because SAF-T wants a partner on every entry;
- `PARTNER_WITHOUT_ID`, `PARTNER_INVALID_ID`, `UNSUPPORTED_RATE`, `MISSING_BANK_ACCOUNT`, `MISSING_ADDRESS`, `MISSING_REPRESENTATIVE`, `MISSING_PHONE`, `NO_OPERATIONS` — the prerequisites the validator refuses the file without, and the documents left out of it.

`GET /declarations/{uuid}/xml` returns the `AuditFile`; `POST /declarations/{uuid}/validate` runs it through ANAF's own D406 validator, which is given the reporting period (the SAF-T file has no period attribute, and without it the validator applies the rules of the oldest period it knows).

## Validation Rules

- `type` must be one of: `d394`, `d300`, `d390`, `d301`, `d398`, `d406`, `d100`, `d112`, `d212`, `c168`
- `year` must be a valid 4-digit year
- `month` must be between 1 and 12
- A declaration of the same `type`, `year`, and `month` must not already exist for the company

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request body structure |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 409 | `conflict` | A declaration for this type and period already exists |
| 422 | `validation_error` | Validation failed (e.g., invalid type, invalid month) |
| 500 | `internal_error` | Server error occurred |

## Next Steps

After creating a declaration:
1. Review and optionally edit the auto-populated data (`PATCH /api/v1/declarations/{uuid}`)
2. Recalculate if invoices were added or changed (`POST /api/v1/declarations/{uuid}/recalculate`)
3. Validate to generate the XML (`POST /api/v1/declarations/{uuid}/validate`)
4. Submit to ANAF (`POST /api/v1/declarations/{uuid}/submit`)
