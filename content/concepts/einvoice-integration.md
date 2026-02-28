---
title: E-Invoicing (Multi-Country)
description: Multi-country e-invoicing support for Romania (ANAF), Germany (XRechnung), Italy (SDI), Poland (KSeF), and France (Factur-X).
---

# E-Invoicing (Multi-Country)

Storno.ro supports e-invoicing across 5 EU countries through a unified API. Each country has its own XML format, validation rules, and government API, but the submission interface is the same.

## Supported Providers

| Provider | Country | Format | Government System |
|----------|---------|--------|-------------------|
| `anaf` | Romania | UBL 2.1 (CIUS-RO) | ANAF SPV / e-Factura |
| `xrechnung` | Germany | UBL 2.1 (XRechnung 3.0) | ZRE (Zentraler Rechnungseingang) |
| `sdi` | Italy | FatturaPA XML v1.2 | SDI (Sistema di Interscambio) |
| `ksef` | Poland | FA(2) XML | KSeF (Krajowy System e-Faktur) |
| `facturx` | France | CII XML (Factur-X EN 16931) | Chorus Pro (B2G) |

## Architecture

### Unified Submission Flow

All providers share the same submission endpoint:

```bash
POST /api/v1/invoices/{uuid}/submit-einvoice
Content-Type: application/json

{"provider": "xrechnung"}
```

- **ANAF** (`provider: "anaf"`): Routes through the existing Romanian e-Factura flow (same behavior as `POST /invoices/{uuid}/submit`). Uses ANAF OAuth tokens, UBL XML generation, and SPV submission.
- **Foreign providers**: Creates an `EInvoiceSubmission` record, generates country-specific XML, stores it via Flysystem, and optionally submits to the government API if credentials are configured.

### Two-Tier Processing

Each foreign provider supports two modes:

1. **XML-only** (no API credentials): Generates compliant XML that can be downloaded and uploaded manually to the government portal.
2. **Full automation** (with API credentials): Generates XML, submits via API, and polls for status updates.

### Entity Model

```
Invoice ──→ EInvoiceSubmission (per provider)
Company ──→ CompanyEInvoiceConfig (per provider)
Client  ──→ einvoiceIdentifiers (JSON field)
```

**EInvoiceSubmission** tracks each submission:
- `provider`: Which system (xrechnung, sdi, ksef, facturx)
- `status`: pending → submitted → accepted/rejected/error
- `externalId`: Government system's tracking ID
- `xmlPath`: Path to generated XML in storage
- `metadata`: Provider-specific response data

**CompanyEInvoiceConfig** stores per-company credentials:
- `provider`: Which system
- `enabled`: Active toggle
- `config`: Provider-specific JSON (API keys, certificates, etc.)

## Provider Configuration

### Germany (XRechnung)

For automated B2G submission via ZRE:

```bash
# Save ZRE credentials
POST /api/v1/companies/{uuid}/einvoice-config
{
  "provider": "xrechnung",
  "enabled": true,
  "config": {
    "clientId": "your-zre-client-id",
    "clientSecret": "your-zre-client-secret"
  }
}
```

Without credentials, XRechnung XML is generated and stored for manual upload.

**Client requirements:**
- Set `einvoiceIdentifiers.xrechnung.leitwegId` on the client for B2G routing (Leitweg-ID is mandatory per BR-DE-1).

### Italy (SDI)

Supports direct submission (with digital certificate) or via intermediary:

```bash
# Via intermediary
POST /api/v1/companies/{uuid}/einvoice-config
{
  "provider": "sdi",
  "enabled": true,
  "config": {
    "apiEndpoint": "https://intermediary.example.com/api",
    "apiKey": "your-api-key"
  }
}
```

**Client requirements:**
- Set `einvoiceIdentifiers.sdi.codiceDestinatario` (7-char routing code) for Italian B2B recipients.
- Set `einvoiceIdentifiers.sdi.pecAddress` for individual recipients without a routing code.
- Foreign recipients automatically get `XXXXXXX` as CodiceDestinatario.

### Poland (KSeF)

```bash
POST /api/v1/companies/{uuid}/einvoice-config
{
  "provider": "ksef",
  "enabled": true,
  "config": {
    "authToken": "your-ksef-auth-token",
    "nip": "1234567890"
  }
}
```

### France (Factur-X / Chorus Pro)

Chorus Pro is for B2G (business-to-government) invoicing:

```bash
POST /api/v1/companies/{uuid}/einvoice-config
{
  "provider": "facturx",
  "enabled": true,
  "config": {
    "clientId": "your-piste-client-id",
    "clientSecret": "your-piste-client-secret",
    "siret": "12345678901234"
  }
}
```

For B2B, Factur-X XML is generated and embedded in PDF/A-3 for direct exchange.

### Romania (ANAF)

ANAF configuration is managed through the dedicated ANAF token system (not through `einvoice-config`). See [ANAF Integration](./anaf-integration.md).

However, ANAF submissions can also be triggered through the unified endpoint:

```bash
POST /api/v1/invoices/{uuid}/submit-einvoice
{"provider": "anaf"}
```

This is equivalent to `POST /api/v1/invoices/{uuid}/submit`.

## Client E-Invoice Identifiers

Clients can store per-provider routing identifiers in the `einvoiceIdentifiers` JSON field:

```json
{
  "xrechnung": {
    "leitwegId": "04011000-1234512345-06"
  },
  "sdi": {
    "codiceDestinatario": "ABCDEFG",
    "pecAddress": "client@pec.it"
  },
  "facturx": {
    "serviceCode": "SERVICE-001"
  }
}
```

Set via the client API:

```bash
PATCH /api/v1/clients/{uuid}
{
  "einvoiceIdentifiers": {
    "sdi": {"codiceDestinatario": "ABCDEFG"}
  }
}
```

## Submission Lifecycle

```
Submit → Validate → Generate XML → Store XML → (Optional) API Submit → Poll Status
```

1. **Validate**: Country-specific validation rules are checked before XML generation.
2. **Generate XML**: Country-specific XML is generated (UBL, FatturaPA, FA(2), or CII).
3. **Store XML**: XML is stored in the company's Flysystem storage.
4. **API Submit** (optional): If credentials are configured, XML is submitted to the government API.
5. **Poll Status**: Async message handler polls for acceptance/rejection.

## Validation Rules

Each provider has country-specific validation:

- **XRechnung**: BR-DE rules (mandatory BuyerReference, seller Contact with Name/Phone/Email, SEPA payment codes)
- **SDI**: FatturaPA rules (Partita IVA, Codice Fiscale, CodiceDestinatario routing, Natura codes)
- **KSeF**: Polish rules (NIP format, mandatory Adnotacje section, VAT rate grouping)
- **Factur-X**: French rules (SIREN/SIRET, CII element ordering, Chorus Pro SIRET)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/einvoice/providers` | List available providers |
| `POST` | `/api/v1/invoices/{uuid}/submit-einvoice` | Submit to provider |
| `GET` | `/api/v1/invoices/{uuid}/einvoice-submissions` | List submissions |
| `GET` | `/api/v1/companies/{uuid}/einvoice-config` | List configs |
| `POST` | `/api/v1/companies/{uuid}/einvoice-config` | Create/update config |
| `DELETE` | `/api/v1/companies/{uuid}/einvoice-config/{provider}` | Delete config |

## Self-Service Provider Configuration

Foreign e-invoice providers (XRechnung, SDI, KSeF, Factur-X) require API credentials that each business must obtain from their national authority or intermediary. Storno provides a self-service configuration flow:

### Credential Management

1. **Settings > E-Invoice Providers** — configure credentials for each provider
2. Credentials are encrypted at rest using `libsodium` symmetric encryption
3. API responses return masked values (e.g., `****ab12`) — raw credentials are never exposed
4. Password fields show "leave empty to keep current" when editing existing configs

### Connection Testing

Before saving, users can test their credentials against the provider's API:

- **XRechnung**: OAuth2 client credentials exchange with ZRE
- **SDI**: Intermediary API status check, or certificate password validation
- **KSeF**: Session initialization with auth token + NIP
- **Factur-X**: OAuth2 client credentials exchange with Chorus Pro (PISTE)

### Provider Credential Requirements

| Provider | Country | Credentials |
|----------|---------|-------------|
| ANAF | Romania | OAuth tokens (managed separately via e-Factura > ANAF Tokens) |
| XRechnung | Germany | `clientId`, `clientSecret` (ZRE portal) |
| SDI | Italy | Certificate password (direct) or `apiEndpoint` + `apiKey` (intermediary like Aruba/Namirial) |
| KSeF | Poland | `authToken`, `nip` (from KSeF portal) |
| Factur-X | France | `clientId`, `clientSecret`, `siret` (from PISTE/AIFE portal) |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/companies/{uuid}/einvoice-config` | List configs (masked credentials) |
| `POST` | `/api/v1/companies/{uuid}/einvoice-config` | Create/update config (encrypts on save) |
| `POST` | `/api/v1/companies/{uuid}/einvoice-config/test` | Test connection |
| `DELETE` | `/api/v1/companies/{uuid}/einvoice-config/{provider}` | Delete config |

### Migration from Plain-Text

Existing plain-text configs are automatically used (legacy fallback). Run the one-time migration command to encrypt them:

```bash
php bin/console app:einvoice:encrypt-configs
```
