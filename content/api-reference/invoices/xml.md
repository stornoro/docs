---
title: Download invoice XML
description: Download the UBL 2.1 XML representation of an invoice
---

# Download invoice XML

Downloads the UBL 2.1 XML file for an issued invoice. The XML is generated automatically when an invoice is issued and is the format required for e-invoice provider submission.

```
GET /api/v1/invoices/{uuid}/xml
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/xml \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000" \
  -o invoice.xml
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/xml', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const xmlText = await response.text();

// Save to file or process
const blob = new Blob([xmlText], { type: 'application/xml' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'invoice.xml';
a.click();
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns the XML file with `Content-Type: application/xml`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1</cbc:CustomizationID>
    <cbc:ID>FAC-2024-001</cbc:ID>
    <cbc:IssueDate>2024-02-15</cbc:IssueDate>
    <cbc:DueDate>2024-03-15</cbc:DueDate>
    <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>RON</cbc:DocumentCurrencyCode>

    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyName>
                <cbc:Name>Your Company SRL</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>Bulevardul Principal 456</cbc:StreetName>
                <cbc:CityName>Bucharest</cbc:CityName>
                <cac:Country>
                    <cbc:IdentificationCode>RO</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>RO12345678</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
        </cac:Party>
    </cac:AccountingSupplierParty>

    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyName>
                <cbc:Name>Acme Corporation SRL</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>Strada Exemplu 123</cbc:StreetName>
                <cbc:CityName>Bucharest</cbc:CityName>
                <cac:Country>
                    <cbc:IdentificationCode>RO</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>RO98765432</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
        </cac:Party>
    </cac:AccountingCustomerParty>

    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="RON">190.00</cbc:TaxAmount>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="RON">1000.00</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="RON">190.00</cbc:TaxAmount>
            <cac:TaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>19.00</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>
    </cac:TaxTotal>

    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="RON">1000.00</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="RON">1000.00</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="RON">1190.00</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="RON">1190.00</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>

    <cac:InvoiceLine>
        <cbc:ID>1</cbc:ID>
        <cbc:InvoicedQuantity unitCode="HUR">10.0</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="RON">1000.00</cbc:LineExtensionAmount>
        <cac:Item>
            <cbc:Description>Web Development Services</cbc:Description>
            <cac:ClassifiedTaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>19.00</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:ClassifiedTaxCategory>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="RON">100.00</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>
</Invoice>
```

### Response headers

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | application/xml | XML content type |
| `Content-Disposition` | attachment; filename="FAC-2024-001.xml" | Suggested filename |
| `Content-Length` | {size} | File size in bytes |

## UBL 2.1 compliance

The generated XML conforms to:
- **UBL 2.1** - Universal Business Language version 2.1
- **EN 16931** - European standard for electronic invoicing
- **CIUS-RO** - Romanian Core Invoice Usage Specification
- **ANAF e-Factura** - Romanian tax authority requirements

## When is XML generated

The XML file is automatically generated when you:
1. [Issue an invoice](/api-reference/invoices/issue)
2. Manually trigger XML generation (via issue endpoint even if already issued)

## Use cases

- Download for manual submission to e-invoice provider
- Archive for compliance and audit purposes
- Integration with accounting systems
- Validation with external tools
- Backup and disaster recovery

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to the specified company |
| `404` | Invoice not found or XML not generated yet |
| `410` | XML file was deleted (regenerate by reissuing) |

## Related endpoints

- [Issue invoice](/api-reference/invoices/issue) - Generate XML file
- [Download PDF](/api-reference/invoices/pdf) - Download PDF version
- [Submit to e-invoice provider](/api-reference/invoices/submit) - Submit the XML to e-invoice provider
- [Validate invoice](/api-reference/invoices/validate) - Validate XML compliance
