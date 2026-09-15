---
title: Fleet (parc auto) and expiry alerts
description: The company's vehicles and everything with an expiry date it must renew — RCA, ITP, rovinietă, CASCO, tahograf, certificat digital, contracts, autorizații — with reminders 30, 7 and 1 days before and on the day, and renewal that keeps the history
method: GET
endpoint: /api/v1/vehicles
---

# Fleet (parc auto) and expiry alerts

Every company or PFA with a car has documents that expire on a date and cost money or a fine when forgotten: the RCA insurance, the ITP inspection, the rovinietă, CASCO, the tachograph calibration, the fire extinguisher, the first-aid kit, the transport licence and its certified copies, the end of a leasing. The company itself has a few more: the digital certificate used for ANAF, the office lease, permits. The fleet module keeps them all as **expiry items**, on a **vehicle** or at company level, tells you how many days are left, reminds the company's members before each one and, when you renew, creates the next item and keeps the old one as history.

## Vehicles

A vehicle carries `plate` (normalised to upper case), `vin`, `make`, `model`, `year`, `fuel` (`benzina`, `motorina`, `gpl`, `hibrid`, `electric`, `altul`), `ownership` (`own`, `leasing`, `rented`), `driverName`, `notes` and `active` (set it to `false` when the car is sold or returned; its items stay). `displayName` is `"B 123 ABC · Dacia Logan"`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/vehicles?active=&search=` | list; `expiries[vehicleId]` gives each vehicle's `nextExpiry` (the soonest open item) and `counts {expired, due, ok}` |
| `POST` | `/api/v1/vehicles` | create (`plate` required) |
| `GET` | `/api/v1/vehicles/{id}` | `vehicle`, `expiries[]` (open items), `counts`, `nextExpiry` |
| `PATCH` | `/api/v1/vehicles/{id}` | update any field, `null` clears an optional one, `active` archives |
| `DELETE` | `/api/v1/vehicles/{id}` | delete the vehicle and all its items, history included |
| `GET` | `/api/v1/vehicles/{id}/expiries?includeClosed=1` | the vehicle's items (closed ones too when asked) |
| `POST` | `/api/v1/vehicles/{id}/expiries` | add an item to the vehicle (same body as `POST /expiries`) |

## Expiry items

| Field | Description |
|---|---|
| `kind` | `rca`, `itp`, `rovinieta`, `casco`, `tahograf`, `extinctor`, `trusa_medicala`, `licenta_transport`, `copie_conforma`, `leasing` (vehicle documents), `certificat_digital`, `contract`, `autorizatie`, `other` (company level; a vehicle may still be attached) |
| `label` | display name; defaults to the kind's name ("RCA", "Trusă medicală") |
| `number`, `provider` | policy / document number and the insurer, ITP station, leasing company, certificate provider |
| `validFrom`, `expiresAt` | dates `YYYY-MM-DD`; `expiresAt` is required |
| `remindDaysBefore` | first reminder this many days before the expiry (default 30, 0–365) |
| `daysLeft` | days until `expiresAt` (negative once passed) |
| `status` | `ok`; `due` when `daysLeft` ≤ `remindDaysBefore`; `expired`; `renewed` once closed |
| `vehicleId`, `vehicle` | the vehicle (`{id, plate, displayName}`) or `null` |
| `renewedFromId`, `closedAt` | the item this one renewed; when it was closed |

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/expiries?kind=&vehicleId=&companyLevel=1&includeClosed=1` | list, soonest first (expired ones first), with `counts` over the open items |
| `GET` | `/api/v1/expiries/upcoming?days=60` | open items expiring within `days` (1–730), expired ones included, as flat rows with `counts {total, expired, due, ok}` — what the dashboard card and the app show |
| `GET` | `/api/v1/expiries/kinds` | the kinds with their default label, whether they belong to a vehicle and the usual validity in months |
| `POST` | `/api/v1/expiries` | create: `{kind, expiresAt, vehicleId?, label?, number?, provider?, validFrom?, remindDaysBefore?, notes?}` |
| `GET` | `/api/v1/expiries/{id}` | `item` and `history[]` (the items it renewed, newest first) |
| `PATCH` | `/api/v1/expiries/{id}` | update; a changed `expiresAt` restarts the reminders; `vehicleId: null` detaches; `closed: true` closes by hand |
| `DELETE` | `/api/v1/expiries/{id}` | delete |
| `POST` | `/api/v1/expiries/{id}/renew` | `{expiresAt?, validFrom?, number?, provider?, notes?}` → `201 {item, previous}` |

Permissions: reading needs `settings.view`, writing `settings.manage`. All routes take the company from `X-Company`.

### Renewal

`POST /expiries/{id}/renew` creates the next item with the same kind, label, vehicle, provider and `remindDaysBefore`, linked to the old one through `renewedFrom`, and closes the old one (`closedAt`, status `renewed`). Without `expiresAt` the usual validity of the kind is added to the old expiry — RCA, rovinietă, CASCO, extinctor, certificat digital, autorizație 12 months; ITP, tahograf 24; trusă medicală 36; licență de transport, copie conformă 120 — counted from today when the item had already expired. `validFrom` defaults to the old expiry date (or today). A closed item cannot be renewed again (`422`).

```http
POST /api/v1/expiries/0192a1b2-…/renew
{"number": "POL-2027-0001"}
```

```json
{
  "item": { "id": "…", "kind": "rca", "label": "RCA", "number": "POL-2027-0001", "validFrom": "2026-10-15", "expiresAt": "2027-10-15", "daysLeft": 395, "status": "ok", "renewedFromId": "0192a1b2-…", "vehicle": { "id": "…", "plate": "B 123 ABC", "displayName": "B 123 ABC · Dacia Logan" } },
  "previous": { "id": "0192a1b2-…", "status": "renewed", "closedAt": "2026-09-15T08:00:00+00:00" }
}
```

## Reminders

The `expiry.due` notification goes to every member of the company at `remindDaysBefore` days before the expiry (30 by default), then 7 and 1 days before and on the day — each threshold once per item; a threshold below `remindDaysBefore` only. Changing `expiresAt` restarts them; already expired items are not reminded daily (they stay `expired` in every list). The notification carries `data.expiryId`, `vehicleId`, `kind`, `expiresAt`, `daysLeft`, `threshold`, `companyId` and `url` (`/vehicles/{id}` or `/expiries`); it is on by default for e-mail, in-app and push (see [Notification preferences](/api-reference/notification-preferences/overview)). The check runs every day at 08:25 (`app:notifications:expiries`, with `--dry-run` and `--date=YYYY-MM-DD`).

## Example

```http
POST /api/v1/vehicles
{"plate": "B 123 ABC", "make": "Dacia", "model": "Logan", "year": 2021, "fuel": "motorina", "ownership": "leasing"}
```

```http
POST /api/v1/vehicles/{id}/expiries
{"kind": "rca", "expiresAt": "2026-10-15", "number": "POL-2026-0001", "provider": "Asigurator SA"}
```

```http
GET /api/v1/expiries/upcoming?days=60
```

```json
{
  "data": [
    { "id": "…", "kind": "itp", "label": "ITP", "expiresAt": "2026-09-12", "daysLeft": -3, "status": "expired", "remindDaysBefore": 30, "vehicleId": "…", "vehicle": { "id": "…", "plate": "B 123 ABC", "displayName": "B 123 ABC · Dacia Logan" } },
    { "id": "…", "kind": "certificat_digital", "label": "Certificat semnătură", "expiresAt": "2026-10-05", "daysLeft": 20, "status": "due", "remindDaysBefore": 30, "vehicleId": null, "vehicle": null },
    { "id": "…", "kind": "rca", "label": "RCA", "number": "POL-2026-0001", "expiresAt": "2026-10-15", "daysLeft": 30, "status": "due", "remindDaysBefore": 30, "vehicleId": "…", "vehicle": { "id": "…", "plate": "B 123 ABC", "displayName": "B 123 ABC · Dacia Logan" } }
  ],
  "counts": { "total": 3, "expired": 1, "due": 2, "ok": 0 },
  "days": 60
}
```

MCP: `vehicles_list`, `vehicles_get`, `vehicles_create`, `vehicles_update`, `vehicles_delete`, `expiries_list`, `expiries_upcoming`, `expiries_create`, `expiries_get`, `expiries_update`, `expiries_renew`, `expiries_delete`.
