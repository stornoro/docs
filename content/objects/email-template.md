---
title: Email Template
description: Email template object for automated communications
---

# Email Template

The EmailTemplate object represents a reusable email template for sending invoices, proformas, and other documents to clients. Templates support variable substitution for personalization.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID | Unique identifier |
| name | string | Template name (internal reference) |
| subject | string | Email subject line (supports variables) |
| body | text | Email body content (HTML or plain text, supports variables) |
| isDefault | boolean | Whether this is the default template for its type |
| createdAt | datetime | Timestamp when created |
| updatedAt | datetime | Timestamp of last update |
| deletedAt | datetime | Soft delete timestamp (null if not deleted) |

## Available Variables

Templates support the following variable substitution:

### Company Variables
- `{{company.name}}` - Company name
- `{{company.cif}}` - Company CIF/CUI
- `{{company.address}}` - Company address
- `{{company.phone}}` - Company phone
- `{{company.email}}` - Company email

### Client Variables
- `{{client.name}}` - Client name
- `{{client.contactPerson}}` - Contact person name
- `{{client.email}}` - Client email

### Document Variables
- `{{document.number}}` - Document number (e.g., "INV-2024-001")
- `{{document.issueDate}}` - Issue date
- `{{document.dueDate}}` - Due date
- `{{document.total}}` - Total amount
- `{{document.currency}}` - Currency code
- `{{document.downloadUrl}}` - PDF download link

### Other Variables
- `{{year}}` - Current year
- `{{date}}` - Current date

## Example - Invoice Email Template

```json
{
  "id": "b4c5d6e7-f8a9-0123-8901-234567890123",
  "name": "Invoice Email - Standard",
  "subject": "Invoice {{document.number}} from {{company.name}}",
  "body": "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n</head>\n<body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333;\">\n  <p>Bună ziua {{client.contactPerson}},</p>\n  \n  <p>Vă transmitem în atașament factura <strong>{{document.number}}</strong> în valoare de <strong>{{document.total}} {{document.currency}}</strong>.</p>\n  \n  <p><strong>Detalii factură:</strong></p>\n  <ul>\n    <li>Număr: {{document.number}}</li>\n    <li>Data emiterii: {{document.issueDate}}</li>\n    <li>Data scadenței: {{document.dueDate}}</li>\n    <li>Total: {{document.total}} {{document.currency}}</li>\n  </ul>\n  \n  <p>Puteți descărca factura aici: <a href=\"{{document.downloadUrl}}\">Download PDF</a></p>\n  \n  <p>Vă mulțumim pentru colaborare!</p>\n  \n  <p>Cu stimă,<br>\n  {{company.name}}<br>\n  {{company.phone}}<br>\n  {{company.email}}</p>\n</body>\n</html>",
  "isDefault": true,
  "createdAt": "2024-01-01T10:00:00+02:00",
  "updatedAt": "2024-01-15T14:30:00+02:00",
  "deletedAt": null
}
```

## Example - Proforma Email Template

```json
{
  "id": "c5d6e7f8-a9b0-1234-9012-345678901234",
  "name": "Proforma Email - Standard",
  "subject": "Proforma {{document.number}} - {{company.name}}",
  "body": "<!DOCTYPE html>\n<html>\n<body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333;\">\n  <p>Bună ziua {{client.contactPerson}},</p>\n  \n  <p>Vă transmitem oferta noastră nr. <strong>{{document.number}}</strong>.</p>\n  \n  <p><strong>Detalii proformă:</strong></p>\n  <ul>\n    <li>Număr: {{document.number}}</li>\n    <li>Data: {{document.issueDate}}</li>\n    <li>Valabilă până la: {{document.dueDate}}</li>\n    <li>Total: {{document.total}} {{document.currency}}</li>\n  </ul>\n  \n  <p>Puteți descărca proforma aici: <a href=\"{{document.downloadUrl}}\">Download PDF</a></p>\n  \n  <p>Rămânem la dispoziția dumneavoastră pentru orice clarificări.</p>\n  \n  <p>Cu stimă,<br>\n  {{company.name}}</p>\n</body>\n</html>",
  "isDefault": true,
  "createdAt": "2024-01-01T10:00:00+02:00",
  "updatedAt": "2024-01-01T10:00:00+02:00",
  "deletedAt": null
}
```

## Example - Payment Reminder Template

```json
{
  "id": "d6e7f8a9-b0c1-2345-0123-456789012345",
  "name": "Payment Reminder",
  "subject": "Reminder: Invoice {{document.number}} - Payment Due",
  "body": "<p>Bună ziua {{client.contactPerson}},</p>\n\n<p>Vă reamintim că factura <strong>{{document.number}}</strong> în valoare de <strong>{{document.total}} {{document.currency}}</strong> ajunge la scadență pe data de <strong>{{document.dueDate}}</strong>.</p>\n\n<p>Dacă ați efectuat deja plata, vă rugăm să ignorați acest mesaj.</p>\n\n<p>Cu stimă,<br>{{company.name}}</p>",
  "isDefault": false,
  "createdAt": "2024-01-05T11:00:00+02:00",
  "updatedAt": "2024-01-05T11:00:00+02:00",
  "deletedAt": null
}
```

## Notes

- Templates support both **HTML** and **plain text** formatting
- Variables are replaced at send time with actual document data
- **isDefault**: Only one template per document type should be default
- Templates can include inline CSS for email styling
- The system validates that all variables used in the template are valid
- Attachments (PDF invoices) are automatically added when sending
- Templates can be duplicated and customized for specific clients or scenarios
- Soft-deleted templates remain in database but are hidden from selection
