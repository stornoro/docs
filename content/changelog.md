---
title: Changelog
description: API version history and breaking changes.
---

# Changelog

All notable changes to the Storno.ro API are documented here.

## 2026-09-17 — Alerta de expirare: e-mail dedicat

### Changed

- **The `expiry.due` reminder is now a real e-mail**, not a plain-text fallback: the subject line names the document, and the message shows the vehicle, the document, its number and issuer, the expiry date and the company, with a button that opens the vehicle (or the list when the item is not tied to one). It turns red on the last day. The notification payload gained `vehicle`, `label`, `kindLabel`, `number`, `provider` and `expiresAtLabel`, so the app and the push message carry the same details.

## 2026-09-15 — Importuri: Uber, Glovo, Tazz, WooCommerce, PrestaShop, casă de marcat A4200

### Added

- **Platform statements** — `POST /api/v1/import/upload` accepts `importType: platform_sales` with source `uber`, `bolt`, `glovo` or `tazz`. The weekly statement or orders export becomes one sales invoice to the platform per group plus the platform's commission as a purchase invoice; `importOptions.groupBy` = `week` (default), `day` or `order`, and `platformName` / `platformCif` / `platformCountry` override the platform entity. A commission from an EU platform is a reverse-charge purchase (`AE`, services art. 278) for a VAT-paying company, a plain expense otherwise.
- **Web shop orders** — sources `woocommerce` and `prestashop` with `importType: invoices_issued` turn one order into one issued invoice (`WC-…` / `PS-…`), create the customer as a client (CUI / CNP / billing address, or *Persoană fizică* when the export has no name) and take the lines from the export's line-item cell. Orders whose status is not paid / completed are skipped unless `importOptions.includeAll` is set; a gross-only total is split with the company's default VAT rate.
- **Fiscal cash register** — source `cash_register` with `importType: receipts` reads the A4200 XML a cash register exports for ANAF (one day per file, or a `.zip` with a month) and creates one issued receipt per bon, keeping its fiscal identifier and the device serial, splitting payments into cash / card / other and creating one line per VAT level. The Z report feeds a daily summary on the job (`summary.days[]`); `importOptions.vatGroups` maps the register's VAT groups to rates and `cashRegisterName` names the device.
- **Templates and summaries** — `GET /api/v1/import/template?importType=&source=` returns the template in the platform's own column layout, the import job gained a `summary` field, and `POST /api/v1/import/{id}/revert` now also deletes the receipts an import created. MCP: `import_upload` / `import_template` / `import_execute` cover the new sources and options and `import_revert` undoes a job. See [Imports](/api-reference/import/overview).

### Fixed

- Invoice imports whose mapper reports the direction as `issued` / `received` (eMAG, Bolt invoices, the new shop exports) now store the direction and link the client; before, those invoices were saved without a direction.

## 2026-09-15 — Parc auto și alerte de expirare

### Added

- **Fleet (parc auto).** `GET/POST /api/v1/vehicles`, `GET/PATCH/DELETE /api/v1/vehicles/{id}` and `GET/POST /api/v1/vehicles/{id}/expiries` keep the company's vehicles (plate, VIN, make, model, year, fuel, ownership own / leasing / rented, driver, active) with, per vehicle, the next expiry and the counts of expired / due / valid documents.
- **Expiry items.** `GET/POST /api/v1/expiries`, `GET/PATCH/DELETE /api/v1/expiries/{id}`, `GET /api/v1/expiries/upcoming?days=60`, `GET /api/v1/expiries/kinds` and `POST /api/v1/expiries/{id}/renew` track everything the company must renew on a date: vehicle documents (`rca`, `itp`, `rovinieta`, `casco`, `tahograf`, `extinctor`, `trusa_medicala`, `licenta_transport`, `copie_conforma`, `leasing`) and company-level items (`certificat_digital`, `contract`, `autorizatie`, `other`). Each item carries `daysLeft` and `status` (`ok`, `due` inside `remindDaysBefore`, `expired`, `renewed`). Renewing creates the next item (the kind's usual validity added to the old expiry unless a date is given) and closes the old one, kept as history (`renewedFromId`).
- **Reminders.** New notification `expiry.due` (e-mail, in-app and push by default) sent to the company members at `remindDaysBefore` days (30 by default), then 7 and 1 days before and on the day, once per threshold; a changed date restarts them. Daily at 08:25 (`app:notifications:expiries --dry-run --date=`).
- Web: pages `/vehicles` (list with next-expiry badges, vehicle detail with its expiries and the renew action) and `/expiries` (all items, filter by kind / vehicle, expired first), dashboard widget "Parc auto: expirări". App: menu "Parc auto" with the vehicle list, detail and renew sheet; the `expiry.due` notification opens the vehicle. MCP: `vehicles_list/get/create/update/delete`, `expiries_list/upcoming/create/get/update/renew/delete`. See [Fleet](/api-reference/fleet/overview).

## 2026-09-15 — D406 SAF-T

### Added

- **D406 (SAF-T) generated from Storno's data.** `POST /declarations` accepts `type: d406` and builds the whole `AuditFile` for the period (monthly or quarterly, following the VAT period): header with the company, its VAT registration and bank accounts, the chart of accounts used, customers and suppliers identified the way ANAF requires (`00` + CUI, `01`/`02` + country + VAT number, `03` + CNP, `04` + a company-assigned code), the VAT tax codes, units of measure and products, a general ledger derived from the documents with a fixed account mapping (4111 / 401, 707 / 7015, 604 / 628, 4426 / 4427, 5121 / 5311) and the source documents — sales invoices, purchase invoices and payments. `GET /declarations/{uuid}/xml` returns the file and `POST /declarations/{uuid}/validate` runs it through ANAF's own D406 validator. `data.warnings` lists what an accountant still has to add: opening balances, entries without a document, stock and fixed assets. See [Create declaration](/api-reference/declarations/create).
- **The fiscal calendar files SAF-T from Storno**: the `D406` item now carries `declarationType: d406`, so the deadline links to the create dialog like the other returns and counts as filed once a D406 for the period is submitted. MCP: `declarations_create` / `declarations_list` accept `d406`.

## 2026-09-15 — Fiscal calendar: rental-contract deadlines

### Added

- **Deadlines from the dosare.** `GET /fiscal-calendar` (and the dashboard card, reminders, MCP `fiscal_calendar`) now lists, for every active rental-contract dosar: `C168` — the 30-day registration / amendment / termination deadline the dosar carries until ANAF accepts the filing; `D212_ESTIMAT` — for a natural person, the estimated Declarația unică due 30 days after a new contract starts; `CONTRACT_END` — the contract's end date, to prepare the addendum or the termination. These items carry `dosarId` / `dosarTitle` and `appliesBecause: rental_contract`; the web page and the app link them to the dosar. C168 reminders keep coming from the dosar (30/7/1/0 days) and are not duplicated by the fiscal reminders. See [Fiscal calendar](/api-reference/fiscal-calendar/overview).

## 2026-09-15 — Dosare: C168 acceptată

### Changed

- **Filing a C168 through the agent** — `GET /declarations/{uuid}/prepare?operation=submit` now renders the DUK PDF with the attachment zip (the scanned contract) exactly like `GET /declarations/{uuid}/pdf`; previously the portal upload of a C168 failed with `500` because the PDF was built without the zip. The upload index is read even when the portal's answer wraps "Indexul este" over a line break.
- **Dosar follow-up on acceptance** — when ANAF accepts a C168 filed from a dosar, the dosar's next step becomes "Înregistrat la ANAF (index …)" and the 30-day deadline is cleared (a termination closes the dosar); an accepted D212 clears the 25 May deadline. The dosar page shows the coded addresses remembered from the C168 as readable lines.
- New console command `app:declarations:check-status [ids]` re-queues the ANAF status check for processing declarations that carry an upload index.
- **Attachments are no longer echoed back.** `data.attachments` of a declaration (the scanned contract of a C168) is returned as `{name, size, mime, stored: true}` by every declaration response instead of the full base64 content, which weighed several megabytes per read. `PATCH /declarations/{uuid}` accepts that same shape back and keeps the stored files; send `contentBase64` only to add or replace a file, and omit a name to drop it.

## 2026-09-15 — Decizia de numerotare

### Added

- **Numbering decision (decizia de numerotare)** — the yearly internal decision required by OMFP 2634/2015 that names the person responsible for allocating document numbers and lists, per document type, the series and the number range allocated for the year. Built from the company's document series (first number = the first number issued that year or the next free one, planned last number = first + `rangeSize` − 1, extended to the highest number already issued). `GET /document-series/numbering-decision` returns it as JSON, `GET /document-series/numbering-decision.pdf` as a print-ready Romanian PDF (title, legal basis, table, signature block); options `year`, `decisionNumber`, `decisionDate`, `responsible`, `rangeSize`. Web: button "Decizie de numerotare" on the document series settings page. MCP: `document_series_numbering_decision` (JSON, or `outFile` for the PDF). See [Numbering decision](/api-reference/document-series/numbering-decision).

## 2026-09-15 — Partner verification and rules

### Added

- **Partner verification (ANAF / VIES).** `POST /api/v1/clients/{uuid}/verify`, `POST /api/v1/suppliers/{uuid}/verify` and the bulk `POST /api/v1/partners/verify-all` check a partner against ANAF (Romanian companies: VAT registration, VAT on collection with its period, inactive taxpayer, RO e-Factura register) or VIES (EU partners) and store the snapshot on the client / supplier (`vatStatusCheckedAt`, `vatRegistered`, `vatOnCollection`, `vatOnCollectionFrom/To`, `inactive`, `efacturaRegistered`, `viesValid`, `verificationNotes`). Partners are re-checked automatically every day at 06:40 once their last check is older than 30 days; a partner that becomes inactive, loses its VAT registration, moves to VAT on collection or fails VIES triggers the new `partner.status_changed` notification (e-mail on by default). Registry outages never fail a request: the previous snapshot is kept and the check is retried. See [Verify partner](/api-reference/clients/verify).
- **Partner rules on clients.** `status` (`active` | `warning` | `blocked`), `creditLimit` and `affiliated` are accepted by create / update and returned in list and detail. A blocked client cannot be picked on the invoice form and `POST /invoices/{id}/issue` refuses it with `422`; a credit limit makes the issue response carry a `warning` (`credit_limit_exceeded`, with the outstanding balance and the projected one) without refusing the invoice. Suppliers carry `affiliated` too, and the D394 populator sets `prsAfiliat = 1` when an affiliated partner is declared.
- MCP tools `partner_verify` and `partners_verify_all`; `clients_create` / `clients_update` accept `status`, `creditLimit`, `affiliated`; suppliers accept `affiliated`.

## 2026-09-14 — D394 rebuilt on the current form

### Changed

- **D394 (declarația informativă 394)** is generated again from scratch for the form in force (schema v5): partner rows (`op1`) per partner type, operation type and rate with whole-lei rounding, the `rezumat1` / `rezumat2` summaries with exactly the attribute groups ANAF's validator demands, the invoice series block (`serieFacturi` tip 1 / 2), the `informatii` block (partner counts, invoices issued, VAT per rate for VAT on collection, refund flags) and the `totalPlata_A` control sum. Private persons without CNP are declared by county, RO suppliers not registered for VAT as `N`, EU / non-EU partners by VAT number. Reverse charge and purchases from private persons (which need the goods-code breakdown) are reported in `data.warnings` instead of being guessed. The XML passes ANAF's validator (DUKIntegrator). See [Create declaration](/api-reference/declarations/create#d394-declaratia-informativa-394).

### Fixed

- The previous D394 populator used rates 19 / 9 / 5 %, invented attributes (`nrParteneri`, `nrT`, `d_rec`) and was rejected by the ANAF validator.

## 2026-09-14 — D301 and D398 populated from invoices

### Added

- **D301 (decont special de TVA)** is now built from the received invoices of companies not registered for VAT: intra-community goods (section 1), services from the EU (section 4 with the 4.1 sub-total) and from outside the EU (section 4), VAT self-assessed at the standard rate in whole lei, the invoice's currency and exchange rate per row, the header and the payment reference the ANAF validator requires. `POST /declarations` with `type: d301`; see [Create declaration](/api-reference/declarations/create#d301-decont-special-de-tva).
- **D398 (OSS, regimul UE)**, new type `d398` (quarterly): special-regime art. 314–315 sales to consumers in other member states grouped per state of consumption, supply type and VAT rate, amounts in EUR, VAT at the destination state's rate, nil return when there is nothing to declare; validated with ANAF's D398 validator. See [Create declaration](/api-reference/declarations/create#d398-declarația-specială-de-tva--oss-regimul-ue). MCP: `declarations_create` accepts `d301` and `d398`.
- **D301 / D398 detail page** on the web: D301 shows the operations table (section, supplier, document, amount and currency, exchange rate, base and VAT in lei) with the totals per section; D398 shows one card per member state of consumption with its supplies (goods / services, standard / reduced rate, taxable amount and VAT in EUR) and the EUR rate used. **D398 exchange rate**: RON invoices are converted at the ECB reference rate of the last day of the quarter (or the next publication day), reported in `data.eurRate`; until the quarter ends the BNR rate of the day is used and the `EUR_RATE_FALLBACK` warning (replacing `EUR_RATE_APPROXIMATE`) asks to regenerate the return before filing.

## 2026-09-14 — Fiscal calendar with deadline reminders

### Added

- **Fiscal calendar**: `GET /fiscal-calendar` lists the declarations a company has to file in the next `days` days (D300, D390, D394, D301, D100, D112, SAF-T, D212, annual financial statements), derived from the company's profile and invoices, with the due date moved past weekends and Romanian legal holidays and a `due` / `overdue` / `filed` status read from the filed declarations. `GET /fiscal-calendar/all` gives the same across every company the caller can see. See [Fiscal calendar](/api-reference/fiscal-calendar/overview). Web: a *Calendar fiscal* page and dashboard widget (individuals included); MCP: `fiscal_calendar` (storno-cli 1.0.44).
- **Company**: `vatPeriod` (`monthly` | `quarterly`, default monthly), `incomeTaxPeriod` (`monthly` | `quarterly`, default quarterly) and `hasEmployees` in `GET` / `PATCH /companies/{uuid}` and in the web settings; the calendar rules follow them.
- **Notification `fiscal.deadline`**: 7, 3 and 1 days before an unfiled deadline, to every member of the company, with `data.code`, `data.dueDate`, `data.declarationType`, `data.period`, `data.companyId`; e-mail on by default, listed in the notification preferences under *Fiscal calendar*.

## 2026-09-14 — Customer statements (situație clienți) with aging bands and e-mail

### Added

- **Customer statement**: `GET /clients/{uuid}/statement` lists a client's unpaid outgoing invoices as of a date (total, paid, outstanding, days overdue), the balance and the outstanding amount split into aging bands (current, 1–30, 31–60, 61–90, 91–120, 121–180, over 180 days); `GET /clients/{uuid}/statement.pdf` renders it as a PDF. See [Customer statement](/api-reference/clients/statement).
- **`GET /clients/statements`**: every client with a positive balance, sorted by balance, with company-wide aging totals.
- **`POST /clients/{uuid}/statement/email`** and **`POST /clients/statements/email`** (bulk, with `minBalance` and `dryRun`): e-mail "Facturi neachitate {company}" with the invoice list, the total to pay, the company IBANs, an optional message and the PDF attached, through the invoice e-mail pipeline (`EmailLog` category `statement`, outbound guard, unsubscribe). An e-mail template with category `statement` overrides the subject/body.
- Web: "Situație facturi" card on the client page (aging, unpaid invoices, send by e-mail, download PDF) and "Trimite situația tuturor clienților cu sold" on the clients list. MCP: `client_statement`, `client_statements`, `client_statement_email`.

## 2026-09-14 — D300 rebuilt on the current form

### Changed

- **D300 (decont de TVA)** is generated again from scratch for the form in force: 21 % / 11 % rows, the 08–12/2025 transitional rows for 19 / 9 / 5 %, regularisation rows for old rates and for supplier invoices dated before the period, reverse charge self-assessed on both sides (rows 5 / 7 / 12 with their deductible mirrors), row-level rounding to whole lei and all totals. `data.rows` now uses ANAF's attribute names (`R9_1`, `R17_2`, …); the header carries the declarant, CAEN, bank account, `tip_decont`, checkboxes and the computed payment reference `nr_evid`, so the XML passes ANAF's validator (DUKIntegrator). See [Create declaration](/api-reference/declarations/create#d300-decont-de-tva).
- **Company**: new `caenCode` (4 digits) in the API, the web settings and the mobile app; required by the D300 header.

### Fixed

- The previous D300 populator used rates 19 / 9 / 5 % and row keys that no longer match the form, and its XML was rejected by the ANAF validator (missing header attributes, `d_rec` unknown).

## 2026-09-14 — Received e-Facturi: supplier product memory, VAT rounding, message to the issuer

### Added

- **Supplier product memory**: lines of received e-Facturi are matched to products by the supplier's barcode (BT-157), article code (BT-155) and description, learned on every sync and confirmed when you pick a product on a received invoice; see [Received invoices](/concepts/anaf-integration#received-invoices-product-matching-and-messages-to-the-issuer). The identifiers are kept on the line (`productCode`, `buyerItemIdentification`, `standardItemIdentification`).
- **`POST /invoices/{uuid}/efactura-message`**: message to the issuer of a received invoice through SPV (ANAF RASP), recorded as the `efactura_message_sent` event. MCP: `invoices_efactura_message` (storno-cli 1.0.43).
- **Units of measure**: 16 more units (cutie, pereche, g, t, ml, cm, km, mp, mc, min, sapt, an, kWh, serv, %) in `GET /defaults/invoice` and the apps.

### Changed

- Line VAT on received invoices: a difference under 3 (document currency) between the recomputed lines and the issuer's `TaxSubtotal` is placed on the largest line of that rate, so lines add up to the declared VAT.
- e-Factura XML: category `E` on invoices under the special regimes art. 311 / art. 312 now carries `VATEX-EU-309` / `VATEX-EU-F` with the matching reason text (was `VATEX-EU-132` for every exemption).

### Fixed

- Unit `pachet` was sent to ANAF as `PK`, which is not a UN/ECE Recommendation 20 code; it is now `XPK` (older stored values are rewritten on generation).

## 2026-09-14 — Cloud certificates in the Storno Agent

### Added

- **Storno Agent 1.8.0**: certificates are listed with a `kind` (`token`, `cloud`, `software`) and, on Windows, the key `provider`. Cloud certificates (Trans Sped EasySign, certSIGN / DigiSign cloud) are used without a PIN: the vendor app approves each operation, requests wait up to three minutes for it. `POST /pin` answers `pinless: true` for them; automatic SPV monitoring refuses cloud certificates. Overrides in `config.json`: `cloudCertificateIds`, `cloudCertificateProviders`. See [Cloud certificates on Windows](/agent#cloud-certificates-on-windows-trans-sped-easysign-certsign-cloud-digisign-cloud-agent-180).
- **MCP (storno-cli 1.0.42)**: `agent_certificates` returns `kind` and `provider`; `agent_sign_pdf`, `agent_submit_declaration_pdf` and `declarations_file_via_agent` skip the PIN requirement for cloud and software certificates.

## 2026-09-14 — StareD112 on every host, filings made elsewhere

### Added

- **StareD112 fallback hosts** — declaration status and recipisa are asked from `www.anaf.ro`, `stare.anaf.ro` and `epatrim.anaf.ro` in turn (the first was down for days in September); `GET /api/v1/public/declarations/status/{index}/{cui}` reports the `host` that answered and takes `?ghiseu=1` for a counter registration number. Status checks now run on the async transport with 5-minute retries instead of at once. MCP: `anaf_declaration_status` with `ghiseu`.
- **Declarations made elsewhere, filed by Storno** — `POST /api/v1/declarations/upload` takes the ANAF PDF produced by DUKIntegrator, by the filled ANAF form or by another program besides XML (the embedded XML is read); uploaded documents are now validated and filed exactly as uploaded instead of being regenerated from their attributes (child elements were lost before). Web: the upload drop zone takes PDFs. MCP: `declarations_upload`. See [upload](/api-reference/declarations/upload).
- **ANAF form versions watched** — `GET /api/v1/public/declarations/form-versions` reads DUKIntegrator's manifest daily (`app:anaf:form-versions`), records every form's validator/PDF version and when it changed, flags Storno forms changed in the last 30 days and validators installed behind ANAF; notice on the declarations page. MCP: `declaration_form_versions`. See [form versions](/api-reference/public/declaration-form-versions).
- **Filings made outside Storno** — `PATCH /api/v1/declarations/{uuid}` with `filedExternally: {index, ghiseu}` records a declaration filed on the portal by hand, from another program or at the counter; Storno follows its state and fetches the recipisa. Web: *Depusă în altă parte* on the declaration page. MCP: `declarations_update` with `filedExternally`.

## 2026-09-08 — dosare (case files), D212 from Storno, deadline reminders

### Added

- **Individual persons as companies** — `POST /api/v1/companies` with `type: "individual"`, `cnp`, `name`, `city`, `state` adds a persoană fizică (CNP checked, nothing fetched from ANAF, never a VAT payer); `type` / `isIndividual` on every company response, `refresh-anaf` refused with `400 INDIVIDUAL`, a CNP given as `cif` refused with `422 CNP_NOT_CIF`. The D212 prefill of a person carries their CNP; the rental portfolio reports `landlordIsCompany` from the company type. `company.cif` is now BIGINT. Web and mobile: *Firmă (CUI) / Persoană fizică (CNP)* when adding a company. MCP: `companies_create` with `type`, `cnp`, `name`, `address`, `city`, `state`. See [create company](/api-reference/companies/create).
- **Drag and drop imports** — the bank statements, borderou and marketplace pages take files dropped anywhere on the page: the import opens with the file attached and the bank account preselected (the only one, or the one used last time); several files dropped together are imported one after another with the same settings.
- **An individual person's dashboard and pages** — for a company of type `individual`, `GET /api/v1/dashboard/widgets/catalog` and `/config` return only the widgets about them (`dosare-actions` first, sync state, amounts to pay, expenses, activity, recent invoices; `audience: individual`), `PUT /config` refuses the others; new widget `dosare-actions` (what to do with ANAF) for every company, hidden by default for companies. Web and mobile hide the selling pages for a person (recurring/proforma invoices, delivery notes, receipts, products, sales and VAT reports, series, categories, VAT rates, PDF and email templates, POS) and the onboarding checklist becomes company → ANAF → first dosar → SPV sync.
- **SPV requests for a CNP** — `GET /api/v1/spv/requests/types` returns the list the SPV form offers the company's identifier (a CNP sees the person types: D212, `Duplicat declaratie unica`, `Adeverinte Venit`, `Istoric declaratii PF`, `Venituri Formular Banca`, `Detalii neconcordante D112 REVISAL`, C168, fișa rol…; a CUI the company ones), with `audience` per type and `?all=1` for the whole catalog; `prepare` refuses a type outside that list and applies the form's period rules for website-form types. MCP: `spv_request_types` takes `companyId` / `all`. See [SPV requests](/api-reference/spv/requests).
- **CNP wherever the company is an individual person** — the web app, the mobile app and the PDF documents (invoice, storno, proforma, aviz, bon fiscal) label the company's identifier `CNP` instead of `CIF`/`CUI` when the company has `type: individual`; a 13-digit party identifier on an invoice reads `CNP` too.
- **Expired e-Factura messages** — ANAF stops serving a message's file 60 days after publishing it and answers the download with a plain-text refusal; the sync now records such messages with status `expired` (plain-language explanation in `errorMessage`, `expired` count in the sync result) instead of logging an error on every run. Typical on the first sync of a person's SPV with a long window.
- **Mobile: dosare and links** — the app gets the case files (actions feed, rental portfolio, list with deadlines, detail with the linked client, billing with the tenant and timeline) and the *Legături* card on client, supplier, invoice, recurring invoice and SPV message screens; filing stays on the web, where the certificate is.
- **Related records** — `GET /api/v1/related/{type}/{id}` for `client`, `supplier`, `invoice`, `recurring_invoice`, `declaration`, `spv_document`, `spv_request`, `dosar`: everything in the company connected to that record, grouped, each item with its status, date and page. Dosare now carry `client` / `supplier` (`{id, name}`), linked by the tenant's CUI or CNP on create and edit or set with `PATCH` `clientId` / `supplierId` (null unlinks), and `GET /api/v1/dosare?clientId=&supplierId=` filters by them; tenant matching also accepts a client's CNP. The web app shows a *Legături* card on the client, supplier, invoice, recurring invoice, declaration, SPV message and dosar pages, and the dosar links to its client (pick or unlink from the page). MCP: `related_get`. See [related records](/api-reference/related/overview).

- **Storno Agent 1.7.8 — remembered PIN** — `POST /pin`, `GET/DELETE /pin/{certificateId}` on the local agent keep the certificate PIN in the OS secure store (Keychain, DPAPI, libsecret) after checking it on the token; `GET /certificates` reports `pinStored` and `secretStore`. Requests to `/proxy`, `/batch`, `/sign`, `/sign-and-submit`, `/batch-sign-and-submit`, `/spv-web-request` and monitor enrollment may omit `pin` when it is remembered. Web app: *Company → ANAF → Agent → Salvează preferința* remembers it permanently (badge + *Uită PIN-ul*). MCP: `agent_sign_pdf`, `agent_submit_declaration_pdf`, `declarations_file_via_agent` work without `pin`/`STORNO_AGENT_PIN` when the agent remembers it. The SPV monitor waits a minute after the computer wakes from sleep and retries "token not ready" errors (`pkcs11 engine::object not found`) before recording a failure.

- **Dosare** — `GET/POST /api/v1/dosare`, `GET …/actions`, `GET …/stats`, `GET/PATCH/DELETE …/{id}`, `POST …/{id}/attach|detach`, `POST …/annual-return`, `GET …/{id}/d212-prefill`, `POST …/{id}/d212`, `GET/POST …/{id}/document/{type}`: case files grouping declarations, SPV requests and ANAF messages around a rental contract, a filing year of the Declarația unică, the periodic returns or the fiscal standing; automatic linking of recipisas (by upload index) and answers (by `id_solicitare`) by the inbox sync; the "needs attention / at ANAF / new answers" feed; the rental portfolio with expected vs declared rent; the termination agreement and the sworn statement prefilled from the dosar. `dosarId` on declarations, SPV requests and SPV documents. MCP: `dosare_*` (12 tools). See [dosare](/api-reference/dosare/overview).
- **D212 and C168 filed from Storno** — declaration types `d212` and `c168` take the form input (`data.input`, schema from the public form spec) and, for C168, the attachments (`data.attachments`); prepare builds the XML with Storno's rules, validates with DUKIntegrator, renders the PDF with the zip and the agent files it. The D212 rent scenario is prefilled from the rental dosare. MCP: `declarations_create` (with `data`, `dosarId`), `declarations_update`, `declarations_file_via_agent` (prepare, sign, upload, record the index in one call).
- **Dosar files and C168 from the dosar** — `POST /api/v1/dosare/{id}/files` (contract scan, addendum, termination document), `GET …/c168-prefill`, `POST …/c168` (the C168 built from the dosar with the files as attachment, coded addresses remembered), `409 C168_IN_PROCESSING` on prepare while another C168 is at ANAF, `GET /api/v1/dosare/stats?format=csv`; two more documents from the dosar: `act_aditional_inchiriere` and `notificare_incetare_inchiriere`. MCP: `dosare_files_upload/download`, `dosare_c168_prefill/create`, `dosare_stats` with `csvOutFile`.
- **Dosare from ANAF's registry** — `GET/POST /api/v1/dosare/registry-proposals` reads the "Registrul contractelor de locațiune" extract (SPV answer or uploaded PDF), reconstructs each contract's state and matches it to existing dosare; `POST /api/v1/dosare/registry-import` creates the missing ones. MCP: `dosare_registry_proposals`, `dosare_registry_import`.
- **Manual filing** — `GET /api/v1/declarations/{uuid}/pdf` now produces the ANAF PDF on demand for drafts (`?inline=1` to view, `?refresh=1` to regenerate), so a person without the agent uploads it in SPV themselves; MCP `declarations_download_pdf`. See [download the ANAF PDF](/api-reference/declarations/download-pdf).
- **Billing with the tenant** — `GET /api/v1/dosare/{id}/billing` links a rental dosar to the tenant's client and supplier records by CUI: recurring invoice, issued invoices with paid / unpaid / overdue state, received invoices, investment compensation balance; the portfolio shows expected vs invoiced for company landlords and honours the rent start date and contractual increases. MCP `dosare_billing`.
- **Deadline reminders** — daily `app:dosare:remind` creates the yearly Declarația unică dosar for taxpayers with rental contracts and notifies 30, 7 and 1 days before a dosar deadline and on the day (`dosar.deadline` notifications). The C168 30-day deadline is set when a rental dosar is created.

## 2026-09-05 — declarations with your own AI, SPV requests, PDF signing

### Added

- **Public declaration tools** (no account, nothing stored): `POST /api/v1/public/declarations/validate` validates any ANAF declaration XML with ANAF's own DUKIntegrator validators, `GET /api/v1/public/declarations/status/{index}/{cui}` reads the processing state from StareD112, `GET /api/v1/public/anaf/nomenclator/*` serves county, locality and street codes from a local mirror. Designed for AI assistants working through the MCP server: the assistant reads the user's documents locally and only asks Storno to validate, look up codes and check status.
- **Declaration forms for AI assistants** — `GET /api/v1/public/declarations/forms`, `GET …/forms/{type}` (specification: input schema, XSD attributes, ANAF rules, example; `?xsd=1`), `POST …/forms/{type}/build` (XML + Storno rules + DUKIntegrator + ANAF's online validator) and `POST /api/v1/public/declarations/pdf` (DUK PDF with the attachment zip embedded). Forms: C168 rental contracts and D212 Declarația unică (rent-income scenario with tax and CASS computed like ANAF's web form). MCP tools `declaration_forms`, `declaration_form_spec`, `declaration_build`, `declaration_pdf`.
- **Legal documents** — `GET /api/v1/public/documents` and `POST /api/v1/public/documents/{type}` generate a rental termination agreement (`conventie_incetare_inchiriere`) or the landlord's sworn statement for C168 (`declaratie_incetare_contract`) as PDF + HTML from structured fields.
- **SPV requests** — `GET /api/v1/spv/requests/types`, `POST /api/v1/spv/requests/prepare`, `POST /api/v1/spv/requests/{uuid}/agent-result`, `GET /api/v1/spv/requests`, `DELETE /api/v1/spv/requests/{uuid}`: file requests to ANAF (fiscal record, registry extracts, C168 register, account statements …) through the agent. Types the web service does not accept (for example C168) go through ANAF's website form automatically.
- **SPV summaries** — every SPV document now carries `summary` (Romanian) and `summaryEn`, a plain-language explanation of what the document is and what to do; `GET /spv/documents/stats` returns `lastSyncedAt`.
- **Storno Agent 1.7.6** — unattended SPV monitoring with the PIN in the OS secure store, `POST /sign` for signing PDFs one by one or in bulk (optional visible signature box), `POST /sign-and-submit` to the e-guvernare portal, batch PDF downloads. MCP tools `agent_sign_pdf`, `agent_submit_declaration_pdf`, `document_generate`, `anaf_declaration_status`, `anaf_nomenclator_*`, `spv_request_*` in `storno-cli` 1.0.25.

### Changed

- **Certificate operations require the PIN** — SPV sync, SPV requests, declaration uploads and monitoring refuse to run without it (`PIN_REQUIRED`); the PIN is never sent to Storno.
- **OAuth-based declaration status sync** is retired: `POST /declarations/sync` without the agent returns `409 AGENT_REQUIRED`.
- SPV message dates (`data_creare`, day-first `DDMMYYYYHHMMSS`) are parsed correctly; existing rows were repaired.

## 2026-09-04 — security hardening

### Changed

- **Document emails** — `POST /invoices|delivery-notes|receipts/{uuid}/email` now require every recipient (`to`, `cc`, `bcc`) to be a client of the company (or the company's / sender's own address), cap recipients at 5, apply per-user burst and per-organization daily limits, and reject phishing-style content. New error codes: `EMAIL_RECIPIENT_NOT_CLIENT`, `EMAIL_TOO_MANY_RECIPIENTS`, `EMAIL_RATE_LIMIT`, `EMAIL_DAILY_LIMIT`, `EMAIL_CONTENT_BLOCKED`.
- **Company scoping** — `X-Company` / `?company` must reference a company of the caller's organization; other ids return `404`. Every uuid-addressed document, supplier, and email template route returns `404` for entities outside the organization. `clientId`, `productId`, and `templateId` in request bodies must belong to the same company.
- **Monthly invoice limit** — enforced on every invoice creation path (conversions, recurring, storno) per organization, not only on `POST /invoices`.
- **Plan gates** — `402 PLAN_LIMIT` is now returned consistently for PDF on all document types, bank statements (borderou), payment links (Stripe Connect and share-link `pay`), recurring invoices, webhooks (update/test/retry), email templates, import follow-up steps, backup download, member reactivation, company restore, and realtime tokens.
- **Rate limits** — invitations (10 pending per organization, 10 sends per hour), password reset and confirmation resend (3 per email per hour), share links (30 per 10 minutes per token), storage and webhook tests (10 per 10 minutes), ANAF/VIES lookups (30 per minute), and a per-organization ANAF budget (60 per minute).
- **Outbound URLs** — webhook URLs must be public HTTPS on port 443; storage endpoints, SMTP hosts, and SDI endpoints must resolve to public addresses.
- **Realtime** — `POST /centrifugo/subscription-token` only issues tokens for the caller's own user channel and companies.
- **PDF templates** — `customCss` is validated (no `<`, `url()`, `@import`, escapes); `fontFamily` must match a simple font-name pattern. Company logos accept PNG, JPG, and WEBP only.
- **Registration** — email is validated, names are limited to 60 characters and may not contain links, line breaks, or email addresses.
- **CSV exports** — cells starting with `=`, `+`, `-`, `@` are prefixed with `'` to neutralize spreadsheet formulas.

## 2026-06-02

### Changed

- **Stripe App refunds** — refunding a Stripe payment now issues a storno reversal of the original e-invoice (negated quantities, inheriting the original series, document type, and per-line VAT rates) instead of a synthetic single-line credit note. A full refund reverses the whole invoice; a partial refund reverses proportionally. Surfaced in the app's **Payment Detail → Refunds** section.

## 2026-04-26 — v2.7.0

### Added

- **Refund receipts** — `POST /receipts/{uuid}/refund` issues a counter-receipt that mirrors lines as negative and inverts payment amounts. Supports full or partial refunds via the `lineSelections` body field; multiple partial refunds against the same parent are allowed until the per-line quantity pool is exhausted. Cancelling a refund releases its quantities back to the pool.
- **Receipt linkage fields** — `Receipt.refundOf` (slim `{id, number}` reference to the parent receipt) and `Receipt.refundedBy` (array of slim refs to active refund receipts; cancelled refunds are excluded).
- **Idempotency keys for receipts** — `Receipt.idempotencyKey` (unique varchar 255) accepted via the `Idempotency-Key` HTTP header (preferred) or the `idempotencyKey` body field. Repeat submissions with the same key return the originally-created receipt instead of duplicating. Used by mobile POS for safe offline retries and ambiguous-timeout recovery.
- **Product categories** — new `ProductCategory` entity with `name`, `color`, `sortOrder`. Full CRUD under `/product-categories`. Optional FK on `Product.category` with `ON DELETE SET NULL`. Used as fallback swatch and grid grouping on the POS.
- **Product fields** — `Product.color` (optional hex swatch shown on the POS product grid; mobile clients fall back to a deterministic palette derived from the product UUID when null) and `Product.sgrAmount` (Romanian SGR / Sistem Garantie-Returnare deposit per unit, e.g. `"0.50"` for plastic beverage bottles; the deposit is VAT-exempt and appears as a separate auto-managed line on POS receipts).
- **Cash register endpoints** — `GET /cash-register/balance`, `GET /cash-register/ledger`, and full CRUD on `/cash-register/movements` (deposits, withdrawals, miscellaneous adjustments). Bank accounts gain `type=cash` with `openingBalance` + `openingBalanceDate` to back the till.

### Changed

- `Idempotency-Key` HTTP header now takes precedence over the body `idempotencyKey` field when both are sent (fixes inverted precedence in earlier preview).
- Refund receipts inherit `internalNote`, `cashRegisterName`, `fiscalNumber`, and customer fiscal data from the parent receipt.
- Receipt detail PDFs render `BON DE RAMBURSARE` instead of `BON FISCAL` for refund receipts (ro/en/fr/de translations included).

## 2026-02-16

### Documentation

- Published comprehensive API documentation covering all endpoints
- Added object reference for all entity types
- Added concept guides for multi-tenancy, ANAF integration, document lifecycle, series numbering, and recurring invoices

## v1 (Current)

### Features

- **Authentication** — JWT tokens, refresh tokens, Google OAuth, WebAuthn passkeys
- **User Management** — Registration, password reset, email confirmation, profile management, account deletion
- **Organizations** — Multi-tenant with role-based memberships (Owner, Admin, Accountant, Employee)
- **Companies** — Multi-company support with ANAF CIF validation
- **Invoices** — Full lifecycle: create, issue, submit to ANAF, cancel, restore
- **Proforma Invoices** — Create, send, accept/reject, convert to invoice
- **Delivery Notes** — Create, issue, cancel, convert to invoice
- **Credit Notes** — Create and submit as corrective invoices
- **Recurring Invoices** — Scheduled automatic invoice generation with flexible frequencies
- **Payments** — Record, track, and manage payments per invoice
- **ANAF Integration** — OAuth token management, e-Factura sync, XML validation, digital signature verification
- **PDF Generation** — Professional PDF invoices from UBL XML
- **Email** — Send invoices with PDF/XML attachments, customizable templates
- **Export** — CSV and ZIP export of invoices
- **Reports** — VAT reports by period
- **Notifications** — In-app, email, and push notifications with preferences
- **Real-time** — WebSocket updates via Centrifugo
- **Exchange Rates** — BNR exchange rates with currency conversion
- **Admin** — Super admin platform management endpoints

### API Conventions

- All endpoints under `/api/v1/`
- JWT Bearer authentication
- Multi-company context via `X-Company` header
- JSON request/response bodies
- UUID resource identifiers
- Paginated list responses with `page`, `limit`, `total`, `pages`
