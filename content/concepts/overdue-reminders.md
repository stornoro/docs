---
title: Overdue reminders
description: How Storno.ro emails clients about overdue invoices on the steps a company sets.
---

# Overdue reminders

A company can have its clients reminded by email when an issued invoice passes its due date. The company sets the steps, in days after the due date, and each step is one email per invoice. Nobody has to press a button.

## How it works

1. Turn the reminders on for the company and, if the defaults do not fit, set the steps
2. Every day at 09:30 UTC Storno.ro looks for issued invoices that are overdue and still have a balance
3. When a step falls due for an invoice, the client gets that step's email with the invoice PDF attached
4. The reminders for an invoice stop when it is fully paid

The reminders are off by default.

## Turning them on

```bash
curl -X PATCH https://api.storno.ro/api/v1/companies/{company_uuid} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "overdueRemindersEnabled": true,
    "overdueReminderSteps": [
      { "days": 3 },
      { "days": 10, "subject": "Factura [[invoice_number]] a depășit scadența" },
      { "days": 30 }
    ]
  }'
```

Company responses return `overdueRemindersEnabled` and the steps in effect in `overdueReminderSteps`, sorted by `days`. See [Update Company](/api-reference/companies/update).

## Steps

| Field | Description |
|-------|-------------|
| `days` | Days after the due date when the step is sent. A whole number from 1 to 365, unique across the steps |
| `subject` | Email subject. One line, up to 200 characters, without `<` or `>`. Optional |
| `body` | Email body, up to 5000 characters. Optional |

A company has 1 to 5 steps. Without steps of its own it uses the default ones: 3, 7 and 14 days. Send `"overdueReminderSteps": null` to go back to the defaults.

A step without `subject` or `body` uses the default text, which is in Romanian. The default subject is `Reamintire de plata: factura [[invoice_number]]`. The default body names the invoice, its issue and due dates, the balance and the days overdue.

Each step is sent once per invoice. After a step is sent, only a step with more days can follow for that invoice.

## The 2-day grace

A step is sent on its day or up to 2 days late. A step that is more than 2 days late is never sent.

The grace covers a missed run: an outage, a send error, or the daily email limit. The next day's run sends what is still inside the 2 days.

The cut-off protects clients from old news. When you turn the reminders on, or import years of invoice history, nobody gets an email about an invoice whose steps passed long ago. Such an invoice gets a reminder only if a later step is still ahead of it.

Example with the default steps and an invoice due on 1 November:

| Date | Days overdue | What happens |
|------|--------------|--------------|
| 4 November | 3 | The 3-day step is sent |
| 5 or 6 November | 4 or 5 | The 3-day step is sent if the earlier runs missed it |
| 7 November | 6 | Nothing. The 3-day step is too late |
| 8 November | 7 | The 7-day step is sent |
| 15 November | 14 | The 14-day step is sent |

## Which invoices get a reminder

An invoice gets a reminder when all of these are true:

- it is an outgoing invoice with a due date in the past
- it is not a draft and not cancelled
- it has a balance left to pay
- its client has an email address and has not unsubscribed from the company's emails
- neither the invoice nor its client is excluded from reminders

The email goes to the client's email address.

A partial payment does not stop the reminders. The next step still goes out, and `[[balance]]` shows what is left. A payment that covers the invoice stops them.

## Variables

`subject` and `body` take these variables:

| Variable | Description |
|----------|-------------|
| `[[client_name]]` | Client name |
| `[[invoice_number]]` | Invoice number |
| `[[total]]` | Invoice total |
| `[[balance]]` | What is left to pay on the invoice |
| `[[currency]]` | Invoice currency |
| `[[due_date]]` | Due date |
| `[[issue_date]]` | Issue date |
| `[[days_overdue]]` | Whole days past the due date |
| `[[company_name]]` | Your company name |
| `[[client_outstanding]]` | Everything the client owes, in the invoice currency |

`[[days_overdue]]` also works in the emails you send yourself with [Send invoice email](/api-reference/invoices/email). It is 0 for an invoice that is not overdue.

## Limits

- Reminders need a plan that includes email sending.
- Each reminder counts toward the plan's daily limit of document emails, together with the invoice, delivery note and receipt emails you send. When the limit is reached, the rest of the company's reminders wait for the next run and go out if they are still inside the 2-day grace.
- A company in read-only mode sends no reminders.

## Excluding a client or an invoice

Set `overdueRemindersDisabled` on a client to keep all its invoices out of the reminders:

```bash
curl -X PATCH https://api.storno.ro/api/v1/clients/{client_uuid} \
  -H "Authorization: Bearer {token}" \
  -H "X-Company: {company_uuid}" \
  -H "Content-Type: application/json" \
  -d '{"overdueRemindersDisabled": true}'
```

Exclude a single invoice with [Overdue reminders for an invoice](/api-reference/invoices/overdue-reminders):

```bash
curl -X POST https://api.storno.ro/api/v1/invoices/{invoice_uuid}/overdue-reminders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

Send `{"enabled": true}` to include the invoice again. Steps that passed while it was excluded are not sent afterwards, apart from one that fell due at most 2 days ago.

## History

Every reminder is in the invoice's email log, next to the emails you sent yourself. [Get email history](/api-reference/invoices/email-history) returns it with `category` `payment_reminder` and the step in `templateUsed` (`Reamintire la 7 zile`).

The invoice itself tracks the latest step:

| Field | Description |
|-------|-------------|
| `overdueRemindersDisabled` | `true` when the reminders skip this invoice |
| `lastOverdueReminderDays` | The latest step sent, in days after the due date. Null until a reminder goes out |
| `lastOverdueReminderAt` | When that step was sent |

## Self-hosted installations

The scheduler runs the command every day at 09:30 UTC. You can also run it by hand:

```bash
docker compose exec backend php bin/console app:invoice:send-overdue-reminders --dry-run
```

| Option | Description |
|--------|-------------|
| `--dry-run` | Lists the reminders that would be sent and sends nothing |
| `--company=<uuid>` | Handles one company only |
| `--date=YYYY-MM-DD` | Runs as if today were that date. Works only together with `--dry-run` |

The command prints one line per reminder and ends with the number sent, the number of errors and the skipped invoices by reason. A second instance started while one is running exits without sending. A reminder that was blocked or failed is tried again by the next day's run while it is inside the 2-day grace.
