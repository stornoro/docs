---
title: Recurring Invoices
description: How to set up automatic invoice generation on a schedule.
---

# Recurring Invoices

Recurring invoices allow you to automatically generate invoices on a defined schedule. This is useful for subscription services, retainers, rent, and other periodic billing.

## How It Works

1. Create a recurring invoice template with client, lines, and schedule
2. On each scheduled date Storno.ro creates the document from the template and issues it
3. Optionally, the email of each invoice to the client is scheduled

## Frequencies

| Frequency | Value | Description |
|-----------|-------|-------------|
| Once | `once` | One issuance, then the template is deactivated |
| Weekly | `weekly` | Every week on a specific weekday |
| Monthly | `monthly` | Every month on a specific day |
| Bimonthly | `bimonthly` | Every two months |
| Quarterly | `quarterly` | Every three months |
| Semiannual | `semi_annually` | Every six months |
| Annual | `yearly` | Once per year |

### Frequency day

`frequencyDay` is required. For `weekly` it is the weekday, 1 to 7. For every other frequency it is the day of the month, 1 to 28. Create returns `400` for a larger value. Days 29 to 31 do not exist, so the month-based schedules never fall on them.

### Frequency month

For `yearly`, `frequencyMonth` (1-12) is required and sets the month.

## Creating a Recurring Invoice

```bash
curl -X POST https://api.storno.ro/api/v1/recurring-invoices \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "{client_uuid}",
    "documentSeriesId": "{series_uuid}",
    "frequency": "monthly",
    "frequencyDay": 1,
    "nextIssuanceDate": "2026-03-01",
    "currency": "RON",
    "dueDateType": "days",
    "dueDateDays": 30,
    "notes": "Servicii lunar de mentenanță IT",
    "lines": [
      {
        "description": "Mentenanță IT - lunar",
        "quantity": 1,
        "unitPrice": 2000,
        "vatRate": 19,
        "unitOfMeasure": "buc"
      }
    ]
  }'
```

## Due Date Configuration

| Type | Parameter | Description |
|------|-----------|-------------|
| `days` | `dueDateDays` | Due date is N days after the issue date |
| `fixed_day` | `dueDateFixedDay` | Due date is on that day of the month (1-28), moved to the next month when the day has already passed |

Without `dueDateType` the generated document has no due date.

## Stop Date

Set a `stopDate` to automatically stop generating invoices after a certain date:

```json
{
  "stopDate": "2026-12-31"
}
```

After the stop date nothing more is generated and the template is deactivated. It remains in the system until deleted.

## Auto-Email

When enabled, each generated invoice gets a scheduled email time:

```json
{
  "autoEmailEnabled": true,
  "autoEmailTime": "09:00",
  "autoEmailDayOffset": 0
}
```

| Parameter | Description |
|-----------|-------------|
| `autoEmailEnabled` | Schedule the email of generated invoices |
| `autoEmailTime` | Time of day to send (HH:MM format, default 09:00) |
| `autoEmailDayOffset` | Days after the issue date to send (0 = same day) |

## VAT on a line

Send `vatRate` (a percentage) or `vatRateId` (the id of one of the company's rates from `GET /api/v1/vat-rates`; the line takes that rate's percentage and category). When both are sent `vatRate` wins. When neither is sent the line gets **21%**, also when the issuing company is not a VAT payer. For a company that is not a VAT payer send `vatRate: "0.00"` on every line. A `vatRateId` that is not a rate of the company is refused with an error; it never falls back to 21%.

## Price rules

Recurring invoice lines support dynamic pricing through `priceRule`:

| Rule | Description |
|------|-------------|
| `fixed` | Use `unitPrice` as is (default) |
| `updated_product` | Use the current default price of the linked product |
| `bnr_rate` | Convert from `referenceCurrency` at the BNR rate of the issue date |
| `bnr_rate_markup` | Same, plus `markupPercent` |
| `expression` | Compute the unit price from `priceExpression` |

The BNR conversion applies when a line has `referenceCurrency` and the template currency is RON.

### Exchange rate example

Bill in RON but base the price on the EUR rate:

```json
{
  "currency": "RON",
  "lines": [
    {
      "description": "Hosting - monthly",
      "quantity": 1,
      "unitPrice": 100,
      "priceRule": "bnr_rate",
      "referenceCurrency": "EUR"
    }
  ]
}
```

The price is calculated with the BNR rate on the day of generation. Placeholders for `notes` and line descriptions are described on [Create recurring invoice](/api-reference/recurring-invoices/create#template-placeholders).

## Managing Recurring Invoices

### Toggle Active/Inactive

```bash
curl -X POST https://api.storno.ro/api/v1/recurring-invoices/{uuid}/toggle \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

### Manual Trigger

Generate and issue a document immediately. The schedule moves on as after a scheduled run, so `nextIssuanceDate` advances by one period:

```bash
curl -X POST https://api.storno.ro/api/v1/recurring-invoices/{uuid}/issue-now \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

The call returns `{"invoiceId", "invoiceNumber", "documentType"}`.

## Tracking

Each recurring invoice tracks:

| Field | Description |
|-------|-------------|
| `nextIssuanceDate` | When the next document will be generated |
| `lastIssuedAt` | When the last document was generated |
| `lastInvoiceNumber` | Number of the most recently generated document |
| `lastInvoiceId` | Id of the most recently generated document |
| `isActive` | Whether generation is enabled |

## Document type

`documentType` selects what a run creates:

| Value | Description |
|-------|-------------|
| `invoice` | Creates a regular invoice and issues it (default) |
| `credit_note` | Creates a credit note and issues it |
| `proforma` | Creates a proforma, sends it and accepts it |

An issued invoice takes its number from the series at once. When the company has `efacturaDelayHours` set (null, 2, 24, 48, 72 or 96) and the client is Romanian, the e-Factura submission is scheduled as for any issued invoice.
