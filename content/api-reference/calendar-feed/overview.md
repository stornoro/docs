---
title: Calendar subscription
description: A personal iCalendar link with the expiries (vehicles, contracts, certificates) and the fiscal deadlines, for Apple Calendar, Google Calendar and Outlook, refreshed by the calendar app itself
method: GET
endpoint: /api/v1/calendar-feed
---

# Calendar subscription

The calendar subscription puts the dates a company must not miss into the calendar people already look at: the [expiry items](/api-reference/fleet/overview) (RCA, ITP, rovinietă, CASCO, the digital certificate, contracts, permits) and the [fiscal deadlines](/api-reference/fiscal-calendar/overview). Each member gets a personal iCalendar link, adds it once to Apple Calendar, Google Calendar or Outlook, and the calendar app refreshes it on its own schedule: a renewed item moves to its new date, a filed declaration drops out, a company the member loses access to disappears.

There is one subscription per user and organization. It covers every company the member can see in that organization:

- expiries need the `settings.view` permission;
- fiscal deadlines need `declaration.view`.

Either part can be switched off with `includeExpiries` / `includeFiscal`.

## Events

Every event is an all-day event on the due date, with a stable `UID` so calendar apps update it instead of duplicating it.

| Source | Title | Alarms (09:00 local time) |
|---|---|---|
| Expiry item | `Expiră RCA · B 01 ABC · Dacia Logan` (the item's label, then the vehicle or the company) | at the item's `remindDaysBefore` threshold and the day before |
| Fiscal deadline | `D300 · Decont de TVA · Exemplu SRL` | 3 days and 1 day before |

The description carries the company, the vehicle, the policy number and issuer for an expiry, the period for a declaration, and a link back to the right Storno page. Only open expiry items and unfiled deadlines are listed; fiscal deadlines cover the next 366 days plus the unfiled ones of the last month.

## The link

```
https://api.storno.ro/api/v1/calendar/feed/{id}/{signature}.ics
```

The link is the credential: calendar apps cannot log in, so anyone holding the link can read the deadlines. Show it only to the member it belongs to. Nothing secret is stored server side (the signature is an HMAC of the feed id and its version), so the same link can be shown again at any time. Issuing a new link with `regenerate: true` invalidates every older one; turning the subscription off makes every link answer `404`. A link also stops working when the member leaves the organization or is deactivated.

The response is `text/calendar; charset=utf-8` with `Cache-Control: private, max-age=900`. Requests are limited to 120 per hour per link.

## Adding it

- **iPhone, iPad, Mac:** open `webcalUrl`. Calendar shows the Subscribe sheet; the subscription syncs to the other Apple devices through iCloud.
- **Google Calendar (and Android):** open `googleCalendarUrl` in a browser and confirm, or in Google Calendar on the web choose *Other calendars → From URL* and paste `url`. The calendar then appears in the Google Calendar app on the phone. Google refreshes subscribed calendars less often, up to about a day.
- **Outlook:** open `outlookUrl`, or *Add calendar → Subscribe from web* and paste `url`.

The dashboard has the subscription under *Setări → Notificări* and on the fleet, expiries and fiscal calendar pages; the mobile app under *Meniu → Setări → Abonament în calendar* and on the fleet and fiscal calendar screens.

## Endpoints

### `GET /api/v1/calendar-feed`

The caller's subscription in the current organization.

```json
{
  "enabled": true,
  "url": "https://api.storno.ro/api/v1/calendar/feed/01a1…/3f9c….ics",
  "webcalUrl": "webcal://api.storno.ro/api/v1/calendar/feed/01a1…/3f9c….ics",
  "googleCalendarUrl": "https://calendar.google.com/calendar/render?cid=webcal%3A%2F%2F…",
  "outlookUrl": "https://outlook.live.com/calendar/0/addfromweb?url=…&name=Storno",
  "includeExpiries": true,
  "includeFiscal": true,
  "canSeeExpiries": true,
  "canSeeFiscal": true,
  "createdAt": "2026-10-05T09:00:00+03:00",
  "lastFetchedAt": "2026-10-05T11:12:40+03:00"
}
```

When it is off: `{ "enabled": false, "canSeeExpiries": true, "canSeeFiscal": true }`. `lastFetchedAt` is updated at most once an hour.

### `POST /api/v1/calendar-feed`

Turns the subscription on and returns it (`201` when created, `200` when it already existed and keeps its link).

| Field | Type | Description |
|---|---|---|
| `regenerate` | boolean | Issue a new link; every older link stops working |
| `includeExpiries` | boolean | Include expiry items (default `true`) |
| `includeFiscal` | boolean | Include fiscal deadlines (default `true`) |

### `PATCH /api/v1/calendar-feed`

Changes `includeExpiries` and / or `includeFiscal`. Answers `404` with `code: NOT_ENABLED` when the subscription is off.

### `DELETE /api/v1/calendar-feed`

Turns the subscription off. Returns `{ "enabled": false }`.

### `GET /api/v1/calendar/feed/{id}/{signature}.ics`

The iCalendar body. Public, no authentication; `HEAD` is accepted too. Unknown, stale (regenerated) or revoked links answer `404`.

## MCP tools

`calendar_feed_get`, `calendar_feed_enable`, `calendar_feed_update`, `calendar_feed_disable`; see [CLI / MCP Server](/integrations/cli).
