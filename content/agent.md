---
title: Storno Agent
description: The local agent that lets Storno talk to ANAF SPV with your qualified digital certificate (USB token) for declarations and the SPV inbox
---

# Storno Agent

ANAF's SPV web service (declarations, receipts, the SPV inbox with somații, decizii, notificări) accepts only your **qualified digital certificate** over mutual TLS. The OAuth token that powers e-Factura is not accepted there. Your certificate lives on a USB token whose private key cannot be exported, so the call has to be made from the computer the token is plugged into.

The Storno Agent is a small program that runs on your computer, listens only on `127.0.0.1` (published as `https://agent.storno.ro:17394`, a name that resolves to your own machine), and proxies exactly those ANAF requests using the certificate on your token. Your PIN is entered in the Storno web app and never leaves your machine.

What goes through the agent:

- submitting tax declarations (D300, D390, D394, D100, D112 …) and fetching their receipts
- the **SPV inbox archive**: every message ANAF puts in your Spațiul Privat Virtual, archived and classified, with push notifications for somații and other critical documents

Everything else in Storno (e-Factura, invoices, sync) works without the agent.

## Install

Download from [get.storno.ro/agent](https://get.storno.ro/agent) and pick your platform:

| Platform | Package | Notes |
|---|---|---|
| macOS Apple Silicon | `storno-agent-macos-arm64.zip` (Storno Agent.app) | Move the app to `~/.storno-agent/` or Applications and open it once. macOS may ask you to allow it under Privacy & Security. |
| macOS Intel | `storno-agent-macos-x64.zip` | same |
| Windows | `storno-agent-win-x64.exe` | Uses the Windows certificate store; the token's own middleware must be installed |
| Linux | `storno-agent-linux-x64` | Uses PKCS#11 (`pkcs11-tool`, `curl` with the `pkcs11` engine, `openssl`) |

The web app can also start the agent for you through the `storno-agent://` link once it is installed. Updates are offered from inside the agent (`/health` reports the latest release); the agent's own TLS certificate for `agent.storno.ro` renews itself from `get.storno.ro`, no reinstall needed when it expires.

## Certificates and tokens

Run this in a terminal to see what the agent can use:

```bash
storno-agent certificates      # from the .app: ~/.storno-agent/Storno\ Agent.app/Contents/MacOS/storno-agent certificates
```

It lists every usable identity with subject, issuer and expiry, and on macOS/Linux also prints the detected PKCS#11 module and anything still missing.

### Windows

Install the middleware that came with your token (SafeNet Authentication Client, Feitian, certSIGN, Longmai). The certificate then appears in the Windows certificate store and the agent uses it directly; the PIN prompt is handled by the middleware or by Storno.

### macOS with a Keychain-aware token

Tokens whose vendor ships a CryptoTokenKit driver (most SafeNet/Thales eTokens) appear in Keychain Access after installing the middleware, and the agent uses them through the system `security` tools. No further setup.

### macOS with a PKCS#11-only token (Longmai mToken CryptoID — Trans Sped, CertDigital)

Some middleware installs only a PKCS#11 library and no Keychain driver, so Safari, Chrome and the system tools never see the certificate. The agent handles these through OpenSSL's PKCS#11 engine. You need:

1. **The right vendor library.** For the Longmai mToken CryptoID standard token (the blue Trans Sped / CertDigital stick, USB id `4C4D:F703`) use the Trans Sped **"macOS Sonoma"** kit (`CryptoIDE_UserTools_Mac_v2.2.23.1017`): its `libcryptoide_pkcs11.dylib` is universal (Apple Silicon + Intel) and works. Copy that file to `~/.storno-agent/lib/libcryptoide_pkcs11.dylib`, or install the kit's app. Avoid the older CertDigital kit (`/opt/CryptoIDE`, Intel-only and buggy) and the FIPS kits (they only see the FIPS model of the token).
2. **Homebrew tools of the same CPU architecture as the library:**
   ```bash
   brew install curl libp11 opensc
   ```
   If your library is Intel-only on an Apple Silicon Mac, `storno-agent certificates` says so and points to `scripts/build-pkcs11-toolchain.sh`, which builds a matching toolchain in `~/.storno-agent/` without administrator rights.
3. Run `storno-agent certificates` again: it must show your certificate with issuer and expiry. Then pick it in Storno under **Company → ANAF → Agent**.

The same library also makes the token usable in Firefox (Settings → Privacy & Security → Security Devices → Load) for logging into anaf.ro. Safari and Chrome cannot use PKCS#11-only tokens.

### Linux

Install the vendor's PKCS#11 `.so`, plus `opensc`, `curl` and `libp11` from your distribution. The agent auto-detects common module paths; otherwise:

```bash
storno-agent config --pkcs11-module /usr/lib/libeTPkcs11.so
```

A small always-on Linux box with the token plugged in is the practical way for an office or accounting firm to keep the SPV inbox synced without a laptop being open.

## Using it

- **Declarations**: open a declaration in Storno and submit it; the app asks for the certificate and PIN the first time, then reuses the session.
- **SPV inbox**: **Documente SPV → Sincronizează cu ANAF**. The agent lists the last 60 days of messages, Storno archives and classifies them, the agent fetches each PDF. Somații, inactivation/VAT-cancellation decisions and risk reports trigger an immediate push + email; other decisions and notices a push; the rest are summarised. PDFs are kept for the company's retention period (default 5 years) and can be downloaded from the page at any time.

Never test a PIN by guessing: tokens lock after a few wrong attempts and need the PUK from the vendor application.

## Automatic monitoring (unattended SPV sync)

Since agent 1.7.0 the agent can check the SPV inbox on its own, without the web app being open. Enable it under **Company → ANAF → Monitorizare SPV automată** after selecting the certificate and entering the PIN:

1. Storno creates a dedicated API key limited to the `declaration.view` and `declaration.submit` scopes.
2. The browser hands the key, the PIN and the certificate id to the agent on `127.0.0.1`.
3. The agent keeps the two secrets in the operating system's secure store (macOS Keychain, Windows DPAPI, Linux libsecret, or a `0600` file when none is available) and writes only the schedule to `~/.storno-agent/monitor.json`.
4. Every *N* hours (1 to 24, default 6) the agent lists the last 60 days of SPV messages with the certificate, sends them to Storno, and fetches the PDFs Storno does not have yet. New somații and decisions trigger the usual push/email notifications.

The computer must be on and the token plugged in. After consecutive failures the interval backs off (up to 24 h) and the last error is shown on the ANAF page. **Sincronizează acum** runs a cycle immediately, **Dezactivează** removes the entry, deletes the secrets and revokes the API key.

For an office, put the token in a small always-on machine (a Linux box works, see the Linux section) and enable monitoring there for every company the certificate is enrolled for.

Agent endpoints used by the web app: `GET /monitor` (status), `POST /monitor` (enroll), `POST /monitor/{companyId}/run`, `DELETE /monitor/{companyId}`. They accept only requests from `app.storno.ro` carrying the `X-Storno-Agent: 1` header.

## Security

- Binds to `127.0.0.1` only; CORS restricted to `app.storno.ro`.
- Only `webserviced.anaf.ro` and `epatrim.anaf.ro` can be reached through it.
- The PIN is kept in memory for the current session only and is redacted from logs. With automatic monitoring enabled it is stored in the OS secure store (Keychain / DPAPI / libsecret) together with the scoped API key; disabling monitoring deletes both.
- The bundled `agent.storno.ro` certificate serves loopback traffic exclusively.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Browser says the agent certificate expired | old agent, before self-renewal | update the agent; since 1.6.0 it refreshes the certificate itself |
| `No certificates found` | middleware missing, wrong library, token not plugged in | see the platform section above, then `storno-agent certificates` |
| Certificate listed but ANAF answers "Pagina logout" / login page | PIN not accepted, or the certificate has no SPV rights on that CUI | check the PIN in the vendor app; verify the CUI is enrolled for this certificate in SPV |
| `SSL engine cannot load client cert` | PKCS#11 library or toolchain architecture mismatch | `storno-agent certificates` shows the module architecture and what is missing |
| The PDF of a document is "pending" | the agent has not fetched it yet | run **Sincronizează cu ANAF** again; pending files are retried every sync |

API reference: [agent endpoints for declarations](/api-reference/declarations/agent), [SPV inbox sync](/api-reference/spv/sync).
