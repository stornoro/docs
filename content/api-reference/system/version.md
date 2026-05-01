---
title: System Version
description: Backend, web and mobile version metadata for client update prompts
---

# System Version

Public, unauthenticated endpoint that returns the running backend version
plus the latest and minimum supported versions for each client surface.
Used by the mobile app to prompt users when a newer build is available
in their store, and by tooling that needs a quick liveness probe.

---

## Get Version

```http
GET /api/v1/version
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| platform | string | No | One of `ios`, `android`, `huawei`. When supplied, the response includes a flat `client` object with the matching mobile platform's metadata so callers don't need to branch. |
| version | string | No | The current client version (e.g. `1.4.2`). Only honoured when `platform` is also set. The server uses it to compute an upgrade `tier` so the client doesn't have to compare versions itself. Build metadata (`+build.42`) is stripped before comparison. The same value can be supplied via the `X-App-Version` request header instead — the query param wins if both are present. |

### Response

Version values are illustrative — call the endpoint for current values.

```json
{
  "version": "<backend-version>",
  "web": {
    "latest": "<web-version>",
    "min": "<web-min-version>",
    "releaseNotes": "https://github.com/stornoro/storno/releases"
  },
  "mobile": {
    "ios": {
      "latest": "<ios-version>",
      "min": "<ios-min-version>",
      "storeUrl": "https://apps.apple.com/app/storno-ro/id6761785908"
    },
    "android": {
      "latest": "<android-version>",
      "min": "<android-min-version>",
      "storeUrl": "https://play.google.com/store/apps/details?id=com.storno.app"
    },
    "huawei": {
      "latest": "<huawei-version>",
      "min": "<huawei-min-version>",
      "storeUrl": "https://appgallery.huawei.com/app/<appgallery-app-id>"
    }
  }
}
```

When called with `?platform=ios` the response also includes:

```json
{
  "platform": "ios",
  "client": {
    "latest": "<ios-version>",
    "min": "<ios-min-version>",
    "storeUrl": "https://apps.apple.com/app/storno-ro/id6761785908"
  }
}
```

When called with both `?platform=ios&version=1.0.0` (or via the `X-App-Version` header), the response also includes a `gate` object with the resolved upgrade tier so the client does not need to compare versions:

```json
{
  "gate": {
    "tier": "blocking",
    "min": "1.2.0",
    "latest": "1.5.0",
    "storeUrl": "https://apps.apple.com/app/storno-ro/id6761785908",
    "releaseNotesUrl": null,
    "message": { "ro": "Actualizare critica de securitate.", "en": "Critical security update." }
  }
}
```

#### `gate.tier` values

| Tier | Meaning |
|------|---------|
| `blocking` | Client `version` is below `min`. The client must render a non-dismissible "must update" screen and refuse to render the rest of the app until the user updates. The server **also enforces this** — see "Server enforcement" below. |
| `recommended` | Client `version` is at or above `min` but below `latest`. The client should render a dismissible "update available" prompt. |
| `ok` | Client is at or above `latest`. Render nothing. |
| `unknown` | Platform was supplied but no `version` was passed. Render nothing. |

### Field reference

| Field | Description |
|-------|-------------|
| `version` | Backend build read from `VERSION.txt`. |
| `web.latest` | Latest web build (mirrors `version`). |
| `web.min` | Lowest web version still supported by the API. |
| `web.releaseNotes` | URL with the changelog for the web build. |
| `mobile.{platform}.latest` | Latest binary published in that platform's store. |
| `mobile.{platform}.min` | Lowest mobile version still allowed to call the API. Only bumped when a breaking server change ships. |
| `mobile.{platform}.storeUrl` | Deep link the in-app prompt opens for the Update button. |

### Recommended client behavior

- Cold-start and on app foreground, GET this endpoint with `?platform=` and the
  current client version (either as `?version=` or via the `X-App-Version` header).
- Switch on `gate.tier`:
  - `blocking` → render a full-screen blocker. Only action is the Update
    button (opens `storeUrl`). Do not render the rest of the navigator.
  - `recommended` → render a dismissible modal with the Update button and
    `gate.message` (localised) underneath. Persist the dismissed `latest`
    so the prompt does not re-fire until a newer build is published.
  - `ok` / `unknown` → render nothing.

### Notification fan-out

When the admin endpoint `PUT /api/v1/admin/version-overrides/{platform}` is
called with `"notify": true` in the body, the server dispatches a
`BroadcastVersionGateMessage` after persisting the override. The handler:

1. Queries telemetry for every user who has reported activity on the platform
   in the last 30 days (matched by `(user_id, platform, app_version)`).
2. For each user, resolves the tier against the new effective `min`/`latest`.
3. Creates an in-app `Notification` with a tier-appropriate title and body (uses
   the server-supplied `messageOverride[locale]` if present, else falls back to
   the bundled `notifications.<locale>.yaml` strings).
4. The notification fans out automatically to Centrifugo (real-time bell
   refresh) and the push transport via the existing
   `SendExternalNotificationMessage` pipeline. Push delivery respects the
   user's `respectQuietHours` flag — except for `blocking` tier, which is
   delivered regardless.

Pass `"notify": false` (or omit) to update the override silently (typos,
rollbacks, no-op corrections). The flag is per-call, not persisted.

### Server enforcement

A Symfony event subscriber rejects any incoming request from a mobile client whose
reported version is below `min` with **HTTP `426 Upgrade Required`** and the same
`tier` / `min` / `latest` / `storeUrl` / `message` payload as the gate object.
This stops a stale client that ignores its in-app blocker from continuing to call
the API.

A request is gated when both `X-Platform` (one of `ios`, `android`, `huawei`)
and `X-App-Version` are present. Web traffic, server-to-server calls and any
client that does not set both headers pass through unchanged.

The following paths are **always reachable**, even when the client is below `min`,
so the user can still update + re-authenticate:

- `GET /api/v1/version` — fetch the gate
- `POST /api/auth` and `POST /api/auth/refresh` — log in / refresh
- `POST /api/v1/telemetry` — phone home from a blocked build
- `GET /api/v1/system/health` — health probes
