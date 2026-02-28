---
title: Recurring Invoices
description: How to set up automatic invoice generation on a schedule.
---

# Recurring Invoices

Recurring invoices allow you to automatically generate invoices on a defined schedule. This is useful for subscription services, retainers, rent, and other periodic billing.

## How It Works

1. Create a recurring invoice template with client, lines, and schedule
2. Storno.ro generates invoices automatically on the scheduled dates
3. Optionally, invoices are emailed to the client automatically

## Frequencies

| Frequency | Value | Description |
|-----------|-------|-------------|
| Weekly | `weekly` | Every week on a specific day |
| Biweekly | `biweekly` | Every two weeks |
| Monthly | `monthly` | Every month on a specific day |
| Bimonthly | `bimonthly` | Every two months |
| Quarterly | `quarterly` | Every three months |
| Semiannual | `semiannual` | Every six months |
| Annual | `annual` | Once per year |

### Frequency Day

The `frequencyDay` parameter (1-31) specifies which day of the month (or week for weekly) the invoice should be generated. If the month has fewer days (e.g., February), the last day of the month is used.

### Frequency Month

For `annual` frequency, `frequencyMonth` (1-12) specifies the month.

## Creating a Recurring Invoice

```bash
curl -X POST https://api.storno.ro/api/v1/recurring-invoices \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "{client_uuid}",
    "seriesId": "{series_uuid}",
    "frequency": "monthly",
    "frequencyDay": 1,
    "nextIssuanceDate": "2026-03-01",
    "currency": "RON",
    "dueDateType": "relative",
    "dueDateDays": 30,
    "notes": "Servicii lunar de mentenanță IT",
    "lines": [
      {
        "description": "Mentenanță IT - lunar",
        "quantity": 1,
        "unitPrice": 2000,
        "vatRateId": "{vat_rate_uuid}",
        "unitOfMeasure": "buc"
      }
    ]
  }'
```

## Due Date Configuration

| Type | Parameter | Description |
|------|-----------|-------------|
| `relative` | `dueDateDays` | Due date is N days after issue date |
| `fixed` | `dueDateFixedDay` | Due date is always on a specific day of the month |

## Stop Date

Set a `stopDate` to automatically stop generating invoices after a certain date:

```json
{
  "stopDate": "2026-12-31"
}
```

After the stop date, no more invoices will be generated, but the recurring invoice remains in the system.

## Auto-Email

When enabled, generated invoices can be automatically emailed to the client:

```json
{
  "autoEmailEnabled": true,
  "autoEmailTime": "09:00",
  "autoEmailDayOffset": 0
}
```

| Parameter | Description |
|-----------|-------------|
| `autoEmailEnabled` | Enable automatic emailing |
| `autoEmailTime` | Time of day to send (HH:mm format) |
| `autoEmailDayOffset` | Days after invoice generation to send (0 = same day) |

## Price Rules

Recurring invoice lines support dynamic pricing:

| Rule | Description |
|------|-------------|
| `fixed` | Use the specified `unitPrice` as-is |
| `exchange_rate` | Convert from `referenceCurrency` to invoice currency using BNR rate |
| `markup` | Apply `markupPercent` on top of the exchange rate price |

### Exchange Rate Example

Bill in RON but base price on EUR rate:

```json
{
  "lines": [
    {
      "description": "Hosting - monthly",
      "quantity": 1,
      "unitPrice": 100,
      "priceRule": "exchange_rate",
      "referenceCurrency": "EUR"
    }
  ]
}
```

The actual price will be calculated using the BNR exchange rate on the day of generation.

## Managing Recurring Invoices

### Toggle Active/Inactive

```bash
curl -X POST https://api.storno.ro/api/v1/recurring-invoices/{uuid}/toggle \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

### Manual Trigger

Generate an invoice immediately without waiting for the schedule:

```bash
curl -X POST https://api.storno.ro/api/v1/recurring-invoices/{uuid}/issue-now \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}"
```

## Tracking

Each recurring invoice tracks:

| Field | Description |
|-------|-------------|
| `nextIssuanceDate` | When the next invoice will be generated |
| `lastIssuedAt` | When the last invoice was generated |
| `lastInvoiceNumber` | Number of the most recently generated invoice |
| `isActive` | Whether generation is enabled |

## Document Type

Recurring invoices can generate either regular invoices or credit notes:

```json
{
  "documentType": "invoice"
}
```

| Value | Description |
|-------|-------------|
| `invoice` | Generate regular invoices (default) |
| `credit_note` | Generate credit notes |
