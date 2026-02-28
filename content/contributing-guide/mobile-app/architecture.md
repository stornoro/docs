---
title: Mobile App Architecture
description: Overview of the Storno mobile app's architecture, patterns, and conventions.
---

# Mobile App Architecture

This guide explains the architecture and conventions used in the Storno mobile app. Understanding these patterns will help you contribute effectively.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native | 0.81.x |
| Platform | Expo | 54.x |
| Navigation | Expo Router | 6.x |
| Language | TypeScript | 5.9.x (strict mode) |
| State Management | Zustand | 5.x |
| Server State | TanStack React Query | 5.x |
| HTTP Client | Axios | 1.x |
| Real-time | Centrifuge (WebSocket) | 5.x |
| i18n | i18next + react-i18next | 25.x / 16.x |
| Auth Storage | Expo Secure Store | 15.x |
| Error Tracking | Sentry | 7.x |

## Project Structure

```
mobile/
├── app/                        # Expo Router — file-based navigation
│   ├── (auth)/                 # Auth screens (login, register, MFA)
│   ├── (tabs)/                 # Main app with tab navigation
│   │   ├── invoices/           # Invoice CRUD
│   │   ├── proforma-invoices/  # Proforma invoices
│   │   ├── delivery-notes/     # Delivery notes
│   │   ├── receipts/           # Receipts
│   │   ├── efactura/           # e-Factura status & messages
│   │   ├── notifications/      # Notification list
│   │   └── menu/               # Settings, clients, products, reports
│   ├── _layout.tsx             # Root layout
│   └── +not-found.tsx          # 404 screen
├── src/
│   ├── api/                    # API modules (one file per feature)
│   ├── components/             # React components by feature
│   │   ├── ui/                 # Shared UI primitives
│   │   ├── shared/             # Shared business components
│   │   ├── invoices/           # Invoice-specific components
│   │   ├── clients/            # Client-specific components
│   │   └── ...                 # Other feature components
│   ├── hooks/                  # Custom React hooks
│   ├── stores/                 # Zustand stores
│   ├── theme/                  # Design tokens (colors, spacing, typography)
│   ├── types/                  # TypeScript type definitions
│   ├── i18n/                   # Translation files (en.ts, ro.ts)
│   ├── utils/                  # Utilities (storage, dates, permissions, etc.)
│   └── constants/              # App constants
├── assets/                     # Icons, splash screen, images
├── fastlane/                   # Google Play deployment automation
├── scripts/                    # Helper scripts
├── app.config.ts               # Expo configuration
├── eas.json                    # EAS build profiles
└── package.json
```

## Navigation

The app uses **Expo Router** with file-based routing. Routes are defined by the file structure in `app/`.

### Route Groups

- `(auth)` — Authentication screens: login, register, forgot-password, confirm-email, mfa-verify
- `(tabs)` — Main application with bottom tab navigation

### Tab Bar

The bottom tab bar shows 5 visible tabs:

1. **Dashboard** — Overview statistics
2. **Invoices** — Invoice management
3. **e-Factura** — ANAF e-invoice status
4. **Notifications** — In-app notifications
5. **Menu** — Settings, clients, products, reports, and more

Additional document types (proforma invoices, delivery notes, receipts) are accessible via navigation but hidden from the tab bar.

### Navigation Conventions

- Tab press at root level emits scroll-to-top / refresh events
- Tab press on deep stacks pops back to the root screen
- Use `router.push()` for forward navigation, `router.back()` for going back
- Use `router.replace()` when you don't want the user to go back (e.g., after login)

## State Management

The app uses a two-layer state approach:

### Global State — Zustand

Zustand stores manage app-wide state that isn't tied to server data:

| Store | Purpose |
|-------|---------|
| `authStore` | Authentication tokens, user data, login/logout flows |
| `companyStore` | Company list, selected company, company switching |
| `settingsStore` | User preferences (server host, biometrics, language) |
| `toastStore` | Toast notification queue |
| `confirmStore` | Confirmation dialog state |
| `actionSheetStore` | Action sheet modal state |

### Server State — React Query

TanStack React Query manages all data fetched from the API:

- **Stale time:** 5 minutes — data is considered fresh for 5 minutes
- **Retry:** 2 attempts on failure
- **Refetch on focus:** Enabled — data refreshes when app comes to foreground
- **Cache isolation:** Company-scoped queries are cleared when switching companies

```typescript
// Example: Fetching invoices
const { data, isLoading } = useQuery({
  queryKey: ['invoices', companyId, filters],
  queryFn: () => invoiceApi.list(filters),
});
```

## API Layer

### Client Configuration

Two Axios instances exist in `src/api/client.ts`:

- **`authClient`** — No interceptors, used for login/register
- **`client`** — Auth interceptors attached, used for all authenticated requests

### Request Interceptors

The authenticated client automatically:

1. Attaches `Authorization: Bearer <token>` header
2. Attaches `X-Organization` header
3. Attaches `X-Company` header (from selected company)
4. Sets `baseURL` from settings store

### Response Interceptors

On receiving a `401 Unauthorized`:

1. Attempts to refresh the token using the refresh token
2. Retries the original request with the new token
3. Logs the user out if refresh fails

### API Module Convention

Each feature has its own API file in `src/api/`:

```typescript
// src/api/invoices.ts
export const invoiceApi = {
  list: (params) => client.get('/v1/invoices', { params }),
  detail: (uuid) => client.get(`/v1/invoices/${uuid}`),
  create: (data) => client.post('/v1/invoices', data),
  update: (uuid, data) => client.put(`/v1/invoices/${uuid}`, data),
  delete: (uuid) => client.delete(`/v1/invoices/${uuid}`),
};
```

## Real-time Updates

The app uses **Centrifuge** (WebSocket) for real-time updates:

- Invoice changes, company updates, and notifications arrive in real-time
- The WebSocket connection is managed across app state transitions (foreground/background)
- Channel-based subscriptions with automatic reconnection
- Configured in `src/api/centrifugo.ts`

## Authentication Flow

1. **Login** — Email/password, Google Sign-In, or Passkey
2. **MFA** — If enabled, prompts for TOTP or backup code
3. **Token Storage** — JWT and refresh token stored in Expo Secure Store (encrypted)
4. **Biometric Lock** — Optional Face ID / Touch ID when app is backgrounded
5. **Auto-refresh** — Tokens are automatically refreshed on 401 responses
6. **Logout** — Clears tokens, user data, and query cache

## Permissions

The app uses a granular permission system:

```typescript
import { usePermissions, P } from '../hooks/usePermissions';

const { can } = usePermissions();

if (can(P.INVOICES_CREATE)) {
  // Show create button
}
```

Permissions are checked throughout the UI to show/hide features based on the user's role.

## Component Architecture

### Feature Components

Components are organized by feature domain in `src/components/`:

```
components/
├── ui/              # Reusable UI primitives (Button, Input, Card, etc.)
├── shared/          # Shared business components (filters, pickers, etc.)
├── invoices/        # Invoice list items, forms, detail sections
├── clients/         # Client-related components
└── ...
```

### Styling

- Pure React Native `StyleSheet` — no external CSS or Tailwind
- Design tokens from `src/theme/` (colors, spacing, typography)
- Light theme only (currently)
- Consistent use of the color palette defined in `theme/colors.ts`

## Error Handling

- **Sentry** captures uncaught errors and breadcrumbs
- **ErrorBoundary** wraps the root layout
- **Toast notifications** for user-facing errors
- **`translateApiError()`** utility converts backend error codes to i18n keys

## Key Conventions

When contributing, follow these patterns:

1. **One API file per feature** in `src/api/`
2. **Use React Query hooks** for data fetching — don't call API functions directly in components
3. **Use Zustand stores** only for app-wide state not tied to server data
4. **Use `useTranslation()`** for all user-facing text — never hardcode strings
5. **Follow the existing component structure** — feature components in their domain folder, shared components in `ui/` or `shared/`
6. **TypeScript strict mode** — all types must be explicit, no `any`
