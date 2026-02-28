---
title: CLI / MCP Server
description: Use the Storno.ro MCP server to manage invoices through AI assistants like Claude Code, Cursor, and Windsurf.
---

# CLI / MCP Server

The Storno CLI is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes the full Storno.ro API as AI-callable tools. It lets you manage invoices, clients, payments, and e-invoice submissions through natural language in any MCP-compatible AI assistant.

## Features

- **228 tools** covering the complete e-invoicing workflow
- Works with **Claude Code**, **Claude Desktop**, **Cursor**, **Windsurf**, and any MCP client
- Automatic JWT token refresh
- Multi-company support with context switching
- File uploads and binary downloads (PDF, XML, exports)

## Installation

```bash
npm install -g storno-cli
```

Requires Node.js 20 or later.

## Configuration

The CLI uses environment variables for authentication and configuration:

| Variable | Default | Description |
|----------|---------|-------------|
| `STORNO_BASE_URL` | `https://api.storno.ro` | API endpoint |
| `STORNO_TOKEN` | — | JWT access token |
| `STORNO_REFRESH_TOKEN` | — | Refresh token for automatic rotation |
| `STORNO_COMPANY_ID` | — | Default company UUID |
| `STORNO_EMAIL` | — | Email for auto-login on startup |
| `STORNO_PASSWORD` | — | Password for auto-login on startup |

### Authentication methods

**1. Pre-configured token** (recommended for production):

Set `STORNO_TOKEN` and optionally `STORNO_REFRESH_TOKEN`. The server auto-refreshes expired tokens.

**2. Auto-login on startup:**

Set `STORNO_EMAIL` and `STORNO_PASSWORD`. The server authenticates automatically when it starts.

**3. Interactive login:**

Call the `auth_login` tool from your AI assistant with your credentials.

## IDE Setup

### Claude Code / Claude Desktop

Add to your MCP configuration (`~/.claude/claude_desktop_config.json` or project `.mcp.json`):

```json
{
  "mcpServers": {
    "storno": {
      "command": "storno-cli",
      "env": {
        "STORNO_TOKEN": "your-jwt-token",
        "STORNO_COMPANY_ID": "company-uuid"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "storno": {
      "command": "storno-cli",
      "env": {
        "STORNO_TOKEN": "your-jwt-token",
        "STORNO_COMPANY_ID": "company-uuid"
      }
    }
  }
}
```

### Windsurf

Add to your Windsurf MCP settings:

```json
{
  "mcpServers": {
    "storno": {
      "command": "storno-cli",
      "env": {
        "STORNO_TOKEN": "your-jwt-token",
        "STORNO_COMPANY_ID": "company-uuid"
      }
    }
  }
}
```

## Tool Categories

The 228 tools are organized into these categories:

### Authentication (7 tools)

| Tool | Description |
|------|-------------|
| `auth_login` | Authenticate with email and password |
| `auth_register` | Create a new user account |
| `auth_refresh` | Rotate expired JWT tokens |
| `auth_me` | Get current user profile |
| `auth_update_profile` | Update name, phone, timezone, password |
| `auth_forgot_password` | Request password reset email |
| `auth_reset_password` | Complete password reset with token |

### Companies (8 tools)

| Tool | Description |
|------|-------------|
| `companies_list` | List all companies with e-invoice sync status |
| `companies_get` | Get company details |
| `companies_create` | Create company via CIF lookup |
| `companies_update` | Modify company settings |
| `companies_delete` | Delete company and all data |
| `companies_upload_logo` | Upload company logo (PNG/JPG/SVG, max 2MB) |
| `companies_delete_logo` | Remove company logo |
| `companies_select` | Set active company context for the session |

### Invoices (21 tools)

| Tool | Description |
|------|-------------|
| `invoices_list` | Filter by status, date, client with pagination |
| `invoices_get` | Full invoice details with line items and payments |
| `invoices_create` | Create a draft invoice |
| `invoices_update` | Edit a draft invoice |
| `invoices_delete` | Delete a draft invoice |
| `invoices_issue` | Finalize and generate UBL XML + PDF |
| `invoices_submit` | Submit to e-invoice provider |
| `invoices_validate` | Pre-flight UBL validation (quick or full) |
| `invoices_cancel` | Cancel with reason |
| `invoices_restore` | Undo cancellation |
| `invoices_pdf` | Download PDF (base64) |
| `invoices_xml` | Download UBL 2.1 XML |
| `invoices_email` | Send invoice with attachments |
| `invoices_email_defaults` | Get pre-filled email subject/body |
| `invoices_email_history` | Track delivery status |
| `invoices_events` | Timeline of status changes |
| `invoices_attachments` | Download file attachments |
| `invoices_payment` | Toggle paid/unpaid status |
| `invoices_verify_signature` | Validate ANAF digital signature |
| `invoices_advance_payment` | Create advance/prepayment invoice |
| `invoices_correct_invoice` | Issue correction/debit note |

### Proforma Invoices (10 tools)

| Tool | Description |
|------|-------------|
| `proforma_invoices_list` | List draft quotes |
| `proforma_invoices_get` | Get proforma details |
| `proforma_invoices_create` | Create a draft quote |
| `proforma_invoices_update` | Modify a draft |
| `proforma_invoices_send` | Email to client |
| `proforma_invoices_accept` | Mark as accepted |
| `proforma_invoices_reject` | Mark as rejected |
| `proforma_invoices_convert` | Convert to regular invoice |
| `proforma_invoices_delete` | Remove draft |
| `proforma_invoices_pdf` | Download PDF |

### Recurring Invoices (7 tools)

| Tool | Description |
|------|-------------|
| `recurring_invoices_list` | List schedules |
| `recurring_invoices_get` | Schedule details |
| `recurring_invoices_create` | Define recurrence (daily/weekly/monthly/yearly) |
| `recurring_invoices_update` | Modify schedule |
| `recurring_invoices_delete` | Disable auto-generation |
| `recurring_invoices_pause` | Temporarily pause |
| `recurring_invoices_resume` | Resume after pause |

### Delivery Notes (8 tools)

| Tool | Description |
|------|-------------|
| `delivery_notes_list` | Track shipments |
| `delivery_notes_get` | Delivery details |
| `delivery_notes_create` | Create shipping document |
| `delivery_notes_update` | Modify draft |
| `delivery_notes_issue` | Finalize delivery note |
| `delivery_notes_delete` | Remove draft |
| `delivery_notes_pdf` | Download PDF |
| `delivery_notes_xml` | Download UBL XML |

### ANAF Integration (7 tools)

| Tool | Description |
|------|-------------|
| `anaf_status` | Check e-Factura token validity |
| `anaf_tokens` | List ANAF OAuth tokens by CIF |
| `anaf_create_token_link` | Generate device auth flow URL |
| `anaf_delete_token` | Revoke token |
| `anaf_validate_cif` | Verify token access for a CIF |
| `anaf_sync_trigger` | Manually trigger sync from ANAF SPV |
| `anaf_sync_status` | Check last sync timestamp and counts |

### Webhooks (10 tools)

| Tool | Description |
|------|-------------|
| `webhooks_list` | List event subscribers |
| `webhooks_get` | Webhook details |
| `webhooks_create` | Register endpoint with event types |
| `webhooks_update` | Modify URL, events, active status |
| `webhooks_delete` | Remove webhook |
| `webhooks_test` | Send test payload |
| `webhooks_logs` | Recent delivery history |
| `webhooks_regenerate_secret` | Rotate signing secret |
| `webhooks_retry` | Retry failed deliveries |
| `webhooks_clear_logs` | Clear old delivery logs |

### Other Tools

| Category | Tools | Description |
|----------|-------|-------------|
| Clients | 2 | List and get client details |
| Products | 2 | Product catalog management |
| Payments | 3 | Record and manage payments |
| Receipts | — | Receipt (bon fiscal) management |
| Credit Notes | — | Credit note operations |
| Suppliers | 4 | Supplier catalog |
| Bank Accounts | 4 | Bank account configuration |
| Document Series | 4 | Invoice number series |
| VAT Rates | 4 | VAT rate management |
| Email Templates | 4 | Email template customization |
| Exchange Rates | 2 | BNR currency conversion |
| API Keys | 5 | API key management with scopes |
| Members | 3 | Team management |
| Invitations | 4 | User invitations |
| Notifications | 4 | Notification preferences |
| Reports | 1 | VAT summary reports |
| Exports | 1 | Data export (CSV/Excel/JSON) |
| Dashboard | 1 | Revenue and invoice statistics |
| Admin | 3 | System administration |
| Licensing | 4 | License key management |

## Multi-Company Support

All company-scoped tools support three ways to set the company context:

1. **Environment variable** — Set `STORNO_COMPANY_ID` at startup
2. **Runtime selection** — Call `companies_select` with a company UUID
3. **Per-request override** — Pass `companyId` as a parameter to any tool

## Example Workflows

### Create and email an invoice

```
You: "Create an invoice for Acme SRL, 10 hours of web development at 100 RON/hour, due in 30 days"

The AI will:
1. Call clients_list to find Acme SRL
2. Call invoices_create with the line items and due date
3. Call invoices_issue to finalize
4. Call invoices_email to send it
```

### Check ANAF sync status

```
You: "What's our ANAF sync status?"

The AI will:
1. Call anaf_status to check token validity
2. Call anaf_sync_status to see last sync time and counts
```

### Switch company context

```
You: "Switch to ABC Company"

The AI will:
1. Call companies_list to find the company
2. Call companies_select to set it as active
```

### Generate a monthly report

```
You: "Show me a VAT summary for January 2026"

The AI will:
1. Call reports_vat with the date range
2. Present the summary with totals by VAT rate
```
