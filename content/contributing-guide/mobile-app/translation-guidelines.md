---
title: Translation Guidelines
description: How to add or update translations in the Storno mobile app.
---

# Translation Guidelines

The Storno mobile app supports multiple languages. This guide covers how translations work and how to add or update them.

## Supported Languages

| Language | Code | Status |
|----------|------|--------|
| Romanian | `ro` | Primary language |
| English | `en` | Secondary language |

Romanian is the primary language since Storno is focused on the Romanian market (e-Factura / ANAF integration). English is the fallback language.

## How i18n Works

The app uses **i18next** with **react-i18next** for internationalization:

- Translation files are TypeScript objects in `src/i18n/`
- The language is auto-detected from the device locale on first launch
- Users can manually change the language in the app settings
- The selected language is persisted to local storage

### File Structure

```
src/i18n/
├── index.ts    # i18next configuration
├── en.ts       # English translations
└── ro.ts       # Romanian translations
```

### Using Translations in Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return <Text>{t('invoices.title')}</Text>;
}
```

## Adding New Translation Keys

When adding a new feature that includes user-facing text:

### 1. Add to Both Language Files

Always add the key to **both** `en.ts` and `ro.ts` simultaneously:

```typescript
// src/i18n/en.ts
export const en = {
  // ...
  myFeature: {
    title: 'My Feature',
    description: 'This is a new feature',
    actions: {
      save: 'Save',
      cancel: 'Cancel',
    },
  },
};

// src/i18n/ro.ts
export const ro = {
  // ...
  myFeature: {
    title: 'Funcția mea',
    description: 'Aceasta este o funcție nouă',
    actions: {
      save: 'Salvează',
      cancel: 'Anulează',
    },
  },
};
```

### 2. Use Consistent Key Naming

Follow the existing naming conventions:

- **Namespace by feature:** `invoices.title`, `clients.actions.delete`
- **Use camelCase** for key names
- **Group related keys** under a common parent (e.g., `actions`, `errors`, `labels`)
- **Use descriptive names** — `invoices.emptyState` not `invoices.es`

### 3. Never Hardcode Strings

All user-facing text must go through the translation system:

```typescript
// Correct
<Text>{t('invoices.noResults')}</Text>

// Incorrect — hardcoded string
<Text>No invoices found</Text>
```

## Updating Existing Translations

When modifying an existing translation:

1. Update the key in **both** language files
2. Make sure the meaning is preserved in both languages
3. If you're unsure about a Romanian translation, leave a comment in the PR

## Translation Key Structure

The translation files follow a hierarchical structure organized by feature:

```
root
├── common          # Shared terms (save, cancel, delete, loading, etc.)
├── auth            # Login, register, MFA screens
├── invoices        # Invoice list, detail, create/edit
├── proforma        # Proforma invoices
├── deliveryNotes   # Delivery notes
├── receipts        # Receipts
├── clients         # Client management
├── suppliers       # Supplier management
├── products        # Product management
├── companies       # Company management
├── efactura        # e-Factura / ANAF integration
├── dashboard       # Dashboard statistics
├── settings        # Settings screens
├── notifications   # Notifications
├── reports         # Reports (VAT, sales, balances)
├── errors          # Error messages
└── validation      # Form validation messages
```

## Best Practices

1. **Keep translations short** — Mobile screens have limited space. Prefer concise text.
2. **Be consistent** — Use the same term for the same concept everywhere (e.g., always "Factură" for invoice, not sometimes "Factură" and sometimes "Document fiscal").
3. **Preserve placeholders** — If a translation contains dynamic values like `{{count}}` or `{{name}}`, keep them in both languages.
4. **Don't translate brand names** — "Storno", "e-Factura", "ANAF" stay as-is in all languages.
5. **Test on device** — After adding translations, verify that the text fits on screen without being truncated.

## Full-Stack Parity

When updating translations, remember that the same changes may need to be applied across:

- **Frontend** — `frontend/i18n/`
- **Mobile** — `mobile/src/i18n/`

Keep terminology consistent across all platforms.
