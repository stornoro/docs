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

- Cold-start and on app foreground, GET this endpoint with `?platform=`.
- Compare `current` vs `client.latest` (semver). If older, show a dismissible
  "Update available" prompt with a button that opens `storeUrl`.
- Compare `current` vs `client.min`. If older, the prompt is still
  dismissible but should clearly mark the update as required.
- Persist the last dismissed `latest` value so the soft prompt only fires
  again when a newer version is released.
