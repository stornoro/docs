---
title: Imports — platforms, web shops and the cash register
description: Upload a platform statement (Uber, Bolt, Glovo, Tazz), a WooCommerce or PrestaShop order export or the A4200 XML of a fiscal cash register and get invoices and receipts — previewable, idempotent and revertible
method: POST
endpoint: /api/v1/import/upload
---

# Imports

Every import goes through the same four steps, whatever the source is: **upload** the file, read the **preview** (the first rows, the detected columns and the mapping the source's mapper suggests), confirm or fix the **mapping**, then **execute**. A finished job can be **reverted**, which deletes everything it created.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/import/sources` | sources, the import types each one supports and the file formats it accepts |
| `POST` | `/api/v1/import/upload` | upload a file (`importType`, `source`, `file`); answers with the job in status `preview` |
| `GET` | `/api/v1/import/template?importType=&source=` | a CSV template; with `source` it uses that platform's own column layout |
| `GET` | `/api/v1/import/{id}/preview` | detected columns, the first rows, `suggestedMapping`, `targetFields` |
| `PATCH` | `/api/v1/import/{id}/mapping` | save `columnMapping` (source column → target field) |
| `POST` | `/api/v1/import/{id}/execute` | run the import, with `importOptions` |
| `POST` | `/api/v1/import/{id}/cancel` | stop a running import, keeping what it already created |
| `POST` | `/api/v1/import/{id}/revert` | delete everything the job created and mark it `reverted` |
| `GET` | `/api/v1/import/history` | past jobs with their counters |

**Idempotency.** Every document an import creates carries a key made of the source, the company and the row's external id (the trip / order id, the group of a statement, the fiscal id of a receipt). Re-uploading the same file creates nothing: the rows come back as *skipped*.

**Amounts and VAT.** Amounts are read in the currency of the export (`1.234,56`, `1,234.56`, `€12.50` and `12,50 lei` are all understood) and, when the currency is not RON, the document keeps the BNR exchange rate of its date. The company's own VAT rates decide the rate of each line; a commission invoiced by an EU platform is a reverse-charge purchase (tax category `AE`, no VAT amount, invoice type *services art. 278*) when the company is a VAT payer, and a plain expense when it is not.

**Summary.** An import that aggregates rows reports what it built in `job.summary`: the documents of a platform statement, the daily totals of a cash register file.

## Platform statements — `importType: platform_sales`

Sources: `uber`, `bolt`, `glovo`, `tazz`. One row per trip, order or transaction; the persister groups the rows and builds **one sales invoice to the platform** for what the end customers paid and **one purchase invoice from the platform** for its commission.

Options for `execute`:

| Option | Values | Meaning |
|---|---|---|
| `groupBy` | `week` (default), `day`, `order` (`trip` is an alias) | how many documents the statement becomes |
| `platformName`, `platformCif`, `platformCountry` | free text | the platform entity on the documents, when the statement is issued by another one than the default |

Target fields the mapping step works with: `externalId`, `date`, `description`, `counterparty`, `gross`, `tips`, `tolls`, `vat`, `commission`, `commissionVat`, `payout`, `currency`, `status`. Commissions exported as negative numbers (deductions from the payout) are read as positive amounts.

### Uber

The **Payments** CSV of the Fleet or Driver portal. Expected columns: `Trip ID`, `Trip date`, `Driver`, `Event type`, `Fare`, `Tips`, `Tolls`, `Taxes`, `Service fee`, `Currency`, `Total`, `Status`. A trip usually has more than one row (the fare, a tip added later, an adjustment); the rows of one trip are summed.

Default platform: *Uber B.V.*, NL. For a VAT-paying company the sales invoice is an intra-community service (`AE`, services art. 278) and the service fee becomes a reverse-charge purchase invoice.

### Bolt

The ride / earnings report of the Fleet Portal (Reports → weekly or daily report → CSV). Expected columns: `Ride ID`, `Date`, `Driver`, `Ride type`, `Gross earnings`, `Tip`, `Toll`, `VAT`, `Bolt commission`, `Commission VAT`, `Net earnings`, `Currency`, `Status`. Default platform: *Bolt Operations OÜ*, EE. The received-invoice CSV (Invoices → export) keeps its own mapper and is imported as `invoices_received`.

### Glovo

The orders export of the Manager Portal (Orders → Download, or the orders report e-mailed to partners). Expected columns: `Order ID`, `Order date`, `Customer`, `Order type`, `Order total`, `Tips`, `Delivery fee`, `VAT`, `Commission`, `Commission VAT`, `Payout`, `Currency`, `Status`. Default platform: *Glovoapp23 S.L.*, ES — set `platformName` / `platformCif` / `platformCountry` when the statement names the Romanian entity.

### Tazz

The orders export of the partner portal (Rapoarte → Comenzi → Export). Expected columns: `Nr. comandă`, `Data`, `Client`, `Tip comandă`, `Total comandă`, `Bacșiș`, `Taxă livrare`, `TVA`, `Comision`, `TVA comision`, `De încasat`, `Monedă`, `Status`. The platform is a Romanian company, so its commission carries Romanian VAT and the sales invoice uses the VAT of the export (or the company's default rate when the export has none).

## Web shop orders — `importType: invoices_issued`

Sources: `woocommerce`, `prestashop`. One row per order becomes **one issued invoice to the customer**, numbered `WC-<reference>` / `PS-<reference>`. The customer becomes a client (CUI, CNP, name, billing address, e-mail, phone from the export); an order without a name is invoiced to *Persoană fizică*. Clients created this way are deleted again by `revert`.

Only orders whose status is paid or completed are imported; `importOptions.includeAll = true` imports the others too.

Lines come from the export's line-item cell when it has one (`Tricou alb x 2 = 120.00 | Șapcă x 1 = 45.00`), otherwise the invoice gets a single line `Comandă #<reference>`. When the export carries both the total and the tax, that split is used; when it only carries the gross total, it is split with the company's default VAT rate.

### WooCommerce

Orders → Export (or an export plugin). Expected columns: `Order ID`, `Order Number`, `Order Date`, `Status`, `Customer Name` (or `Billing First Name` + `Billing Last Name`), `Billing Company`, `VAT Number`, `Billing Email`, `Billing Phone`, `Billing Address 1`, `Billing City`, `Billing State`, `Billing Postcode`, `Billing Country`, `Line items`, `Order Subtotal`, `Tax Total`, `Shipping Total`, `Discount Total`, `Order Total`, `Currency`, `Payment Method Title`. Statuses `completed`, `processing` and their Romanian equivalents count as paid (the `wc-` prefix is ignored).

### PrestaShop

Orders → Export. The admin export is `ID, Reference, New client, Delivery, Customer, Total, Payment, Status, Date` and its total is gross with the currency symbol (`165,00 lei`). Statuses *Payment accepted*, *Shipped*, *Delivered* and their Romanian equivalents count as paid. Extended exports (customer e-mail, company, VAT number, products, tax) are recognised through their column names.

## Fiscal cash register — `importType: receipts`, `source: cash_register`

The XML a fiscal cash register (AMEF) exports for ANAF's A4200 reporting: a message per fiscal day whose `<bon>` elements are the receipts and whose `<rB>` element is the Z report. Upload one XML file or a `.zip` with a whole month (only this source accepts ZIP).

Each `<bon>` becomes one issued **receipt** (`Receipt`), numbered `<device serial>-Z<z report>-B<number>`, keeping the fiscal identifier `idB` (device serial, date, time, Z report number and receipt number) in `fiscalNumber` and the device serial in `deviceSerial`. Payments are split into cash / card / other, and one receipt line is created per VAT level of the receipt — or per product line when the file carries them. The Z report itself creates nothing; it feeds the daily summary (`job.summary.days[]`: receipts, total, VAT, cash, card, other, the Z reports of the day and the number of receipts each one declares).

Options for `execute`:

| Option | Meaning |
|---|---|
| `cashRegisterName` | the name the imported receipts carry; defaults to the device serial in the file |
| `vatGroups` | what the register's VAT groups mean, e.g. `{"1": "21", "2": "11", "3": "5", "4": "0"}`; used when the file reports a group index (`A`, `B`, `C`, `1`, `2`, …) instead of a percentage |
| `paymentTypes` | what the register's payment codes mean, e.g. `{"1": "cash", "3": "card"}`; the default reads `tipP` 1 as card, 3 as cash and everything else as other |

Receipts are keyed by their fiscal identifier, so importing the same day twice creates nothing, and `revert` deletes the receipts (and their lines) the job created.

In the official file the `cota` attribute is the VAT percentage itself (`0`, `5`, `9`, `11`, `21`); a register that reports a group index instead is corrected with `vatGroups`. Files written with the older AMEF field names (`ID_BON`, `DATA_EMITERE_BF`, `CENTRAL` with `total_bon` / `total_tva` / `total_plata_card` / `total_plata_numerar`, `COTE` with `cota` / `val_cota`, `ARTICOL` with `den_art` / `cantitate` / `pret` / `valoare`, `BENEF` with `cif_beneficiar`) are read as the same fields.

The official A4200 file carries only totals per VAT rate, no product lines. Files exported by the register's own software in a richer, unsigned layout are read leniently: date, time and number as attributes or child elements, `<pl>` payments, `<linie>` / `<art>` product lines and a customer CUI are all picked up when present. A file the register encrypted or signed cannot be read — export the plain XML journal.
