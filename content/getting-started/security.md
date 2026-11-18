---
title: Security
description: Security practices, vulnerability reporting, and data protection in Storno.ro.
---

# Security

Storno.ro handles sensitive financial data. This page describes our security practices and how to report vulnerabilities.

---

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

- **Email**: [security@storno.ro](mailto:security@storno.ro)
- **Do not** open a public GitHub issue for security vulnerabilities
- Include a clear description of the vulnerability and steps to reproduce
- We will acknowledge receipt within 48 hours
- We aim to release a fix within 7 days for critical issues

We appreciate responsible disclosure and will credit researchers who report valid vulnerabilities (unless they prefer to remain anonymous).

---

## Authentication & Access Control

### Authentication Methods

| Method | Second Factor Required |
|--------|----------------------|
| Email + Password | Yes (if MFA enabled) |
| Google and Apple sign-in | Yes (if MFA enabled) |
| Passkeys (WebAuthn) | No (inherently multi-factor) |
| API Keys | No (long-lived, scoped tokens) |

### Multi-Factor Authentication (MFA)

- TOTP-based 2FA (Google Authenticator, Authy, etc.)
- 10 single-use backup codes generated on setup
- MFA challenge tokens expire after 5 minutes
- Maximum 5 verification attempts per challenge
- See [Authentication](/getting-started/authentication) for details

### JWT Tokens

- RSA-signed (RS256) access tokens
- Access tokens expire after 1 hour (configurable)
- Refresh tokens expire after 30 days (configurable)
- A refresh returns a new access token and the same refresh token

### API Keys

- Each key carries a list of permission scopes, limited to the permissions its owner has
- Stored as hashed values — the full key is shown only once at creation
- Can be revoked instantly
- No MFA bypass — API keys are for programmatic access only

### Passkeys (WebAuthn)

- FIDO2/WebAuthn standard
- Public key cryptography — no shared secrets
- Phishing-resistant by design
- Biometric or PIN verification handled by the device

---

## Data Protection

### Encryption

| Layer | Method |
|-------|--------|
| In transit | TLS 1.2+ (HTTPS required for all API calls) |
| Database passwords | bcrypt (PASSWORD_DEFAULT) |
| MFA backup codes | bcrypt hashed |
| TOTP secrets | Stored in database (equivalent to a password, useless without current time window) |
| API keys | SHA-256 hashed |
| User storage credentials | AES-256-CBC with per-instance encryption key |

### Data Isolation

- **Multi-tenant architecture**: Organizations are fully isolated at the database level
- **Company context**: API requests carry an `X-Company` header (optional for a single-company organization); a company outside the caller's organization is not found
- **Role-based access control (RBAC)**: 40+ granular permissions across Owner, Admin, Accountant, and Employee roles
- **Soft deletion**: Deleted records are retained for audit trails but excluded from API responses

---

## Rate Limiting

Authentication, ANAF calls and a few other endpoints are rate limited. There is no general per-request limit. The authentication limits are:

- Login: 5 attempts per minute, answered with 401
- Registration: 10 attempts per hour
- MFA verification: 5 attempts per minute
- Password reset: 3 attempts per 15 minutes

See [Rate Limiting](/getting-started/rate-limiting) for the complete reference.

---

## Self-Hosted Security

### License Validation

- JWT license keys are validated offline with an RSA signature check and send nothing to the SaaS server
- A legacy non-JWT key is checked against the SaaS server every 6 hours, sending the key, the instance URL and four counters (organizations, active users, companies, invoices this month)
- The instance also checks the SaaS server for the latest version, cached for 6 hours
- Invoices, clients and other business data are never sent

### Recommendations

- **Keep Docker images updated** — pull the latest images regularly for security patches
- **Use a reverse proxy with SSL** — never expose the backend directly to the internet
- **Set strong secrets** — use `openssl rand -hex 32` for `APP_SECRET`, `JWT_PASSPHRASE`, and Centrifugo keys
- **Restrict database access** — MySQL and Redis should not be accessible from the public internet
- **Enable MFA** — require two-factor authentication for all admin users
- **Rotate API keys** — periodically regenerate API keys, especially after team member departures
- **Monitor logs** — watch for unusual patterns in authentication failures

---

## Compliance

- Storno.ro is designed for multi-country e-invoicing and complies with provider requirements (ANAF, XRechnung, SDI, KSeF, Factur-X)
- XML documents are digitally signed and validated against provider-specific schemas
- All financial data can be exported for audit purposes
- GDPR: Users can request account deletion, which permanently removes all personal data
