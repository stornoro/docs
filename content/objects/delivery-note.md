---
title: Delivery Note
description: Delivery note object for goods shipment documentation
---

# Delivery Note

The DeliveryNote object represents shipping documents that accompany goods deliveries. Delivery notes can be issued for shipments and optionally converted into invoices later.

## Attributes

| Attribute | Type | In List | In Detail | Description |
|-----------|------|---------|-----------|-------------|
| id | UUID | ✓ | ✓ | Unique identifier |
| number | string | ✓ | ✓ | Delivery note number (e.g., "DN-2024-001") |
| status | DeliveryNoteStatus | ✓ | ✓ | Status: draft, issued, converted, cancelled |
| currency | string | ✓ | ✓ | 3-letter currency code (e.g., "RON", "EUR") |
| issueDate | date | ✓ | ✓ | Date the delivery note was issued (YYYY-MM-DD) |
| dueDate | date | ✓ | ✓ | Expected delivery date (YYYY-MM-DD) |
| subtotal | decimal | ✓ | ✓ | Subtotal before VAT |
| vatTotal | decimal | ✓ | ✓ | Total VAT amount |
| total | decimal | ✓ | ✓ | Total amount including VAT |
| clientName | string | ✓ | ✓ | Virtual field: name of the client |
| client | Client | ✗ | ✓ | Full Client object |
| documentSeriesId | UUID | ✗ | ✓ | UUID of the assigned document series. Auto-assigned from the default `delivery_note` series if not specified at creation |
| documentSeries | string | ✗ | ✓ | Document series prefix |
| discount | decimal | ✗ | ✓ | Total discount amount |
| notes | text | ✗ | ✓ | Notes about the delivery |
| mentions | text | ✗ | ✓ | Additional mentions on delivery note |
| internalNote | text | ✗ | ✓ | Internal notes (not visible to client) |
| deliveryLocation | string | ✗ | ✓ | Delivery address |
| projectReference | string | ✗ | ✓ | Project or reference number |
| issuerName | string | ✗ | ✓ | Name of the person issuing the delivery note |
| issuerId | string | ✗ | ✓ | ID/CNP of the issuer |
| salesAgent | string | ✗ | ✓ | Sales agent name |
| deputyName | string | ✗ | ✓ | Deputy/driver name |
| deputyIdentityCard | string | ✗ | ✓ | Deputy ID card number |
| deputyAuto | string | ✗ | ✓ | Deputy vehicle registration |
| exchangeRate | decimal | ✗ | ✓ | Exchange rate used (for foreign currencies) |
| convertedInvoice | object | ✗ | ✓ | Reference to converted invoice (if status is converted) |
| issuedAt | datetime | ✗ | ✓ | Timestamp when issued |
| cancelledAt | datetime | ✗ | ✓ | Timestamp when cancelled |
| lines | array | ✗ | ✓ | Array of DeliveryNoteLine objects |
| etransportOperationType | integer | ✗ | ✓ | e-Transport operation type code (30=TTN domestic) |
| etransportVehicleNumber | string | ✗ | ✓ | Vehicle registration number for transport |
| etransportTrailer1 | string | ✗ | ✓ | First trailer registration number |
| etransportTrailer2 | string | ✗ | ✓ | Second trailer registration number |
| etransportTransporterCountry | string | ✗ | ✓ | Transporter country code (ISO 3166-1 alpha-2) |
| etransportTransporterCode | string | ✗ | ✓ | Transporter CUI/CIF code |
| etransportTransporterName | string | ✗ | ✓ | Transporter company name |
| etransportTransportDate | date | ✗ | ✓ | Planned transport date (YYYY-MM-DD) |
| etransportStartCounty | integer | ✗ | ✓ | Route start county code (Romanian county) |
| etransportStartLocality | string | ✗ | ✓ | Route start locality name |
| etransportStartStreet | string | ✗ | ✓ | Route start street name |
| etransportStartNumber | string | ✗ | ✓ | Route start street number |
| etransportStartOtherInfo | string | ✗ | ✓ | Route start additional info |
| etransportStartPostalCode | string | ✗ | ✓ | Route start postal code |
| etransportEndCounty | integer | ✗ | ✓ | Route end county code |
| etransportEndLocality | string | ✗ | ✓ | Route end locality name |
| etransportEndStreet | string | ✗ | ✓ | Route end street name |
| etransportEndNumber | string | ✗ | ✓ | Route end street number |
| etransportEndOtherInfo | string | ✗ | ✓ | Route end additional info |
| etransportEndPostalCode | string | ✗ | ✓ | Route end postal code |
| etransportUit | string | ✓ | ✓ | e-Transport UIT (unique identifier from ANAF) |
| etransportStatus | string | ✓ | ✓ | e-Transport status: uploaded, ok, nok, validation_failed, upload_failed |
| etransportErrorMessage | text | ✗ | ✓ | e-Transport error message from ANAF |
| etransportSubmittedAt | datetime | ✗ | ✓ | Timestamp when submitted to e-Transport |
| createdAt | datetime | ✓ | ✓ | Timestamp when created |
| updatedAt | datetime | ✓ | ✓ | Timestamp of last update |
| deletedAt | datetime | ✓ | ✓ | Soft delete timestamp (null if not deleted) |

## DeliveryNoteLine Attributes

| Attribute | Type | In List | In Detail | Description |
|-----------|------|---------|-----------|-------------|
| id | UUID | ✗ | ✓ | Unique identifier |
| position | integer | ✗ | ✓ | Line position order |
| description | string | ✗ | ✓ | Product or service description |
| quantity | decimal | ✗ | ✓ | Quantity |
| unitOfMeasure | string | ✗ | ✓ | Unit of measure label (e.g., "box", "kg") |
| unitPrice | decimal | ✗ | ✓ | Unit price |
| vatRate | decimal | ✗ | ✓ | VAT rate percentage |
| vatAmount | decimal | ✗ | ✓ | VAT amount |
| lineTotal | decimal | ✗ | ✓ | Total line amount including VAT |
| discount | decimal | ✗ | ✓ | Discount amount |
| productCode | string | ✗ | ✓ | Product code or SKU |
| tariffCode | string | ✗ | ✓ | Customs tariff code (4-8 digits) |
| purposeCode | integer | ✗ | ✓ | Purpose code for TTN (101=Commerce, 704=Transfer, 705=Client stock, 9901=Other) |
| unitOfMeasureCode | string | ✗ | ✓ | UN/ECE unit of measure code (e.g., KGM, LTR, MTR) |
| netWeight | decimal | ✗ | ✓ | Net weight in kg |
| grossWeight | decimal | ✗ | ✓ | Gross weight in kg |
| valueWithoutVat | decimal | ✗ | ✓ | Value without VAT in RON |

## Example

```json
{
  "id": "d0e1f2a3-b4c5-6789-4567-890123456789",
  "number": "DN-2024-001",
  "status": "issued",
  "currency": "RON",
  "issueDate": "2024-02-18",
  "dueDate": "2024-02-20",
  "subtotal": 1500.00,
  "vatTotal": 285.00,
  "total": 1785.00,
  "clientName": "Distribution SRL",
  "client": {
    "id": "e1f2a3b4-c5d6-7890-5678-901234567890",
    "type": "company",
    "name": "Distribution SRL",
    "cui": "34567890",
    "vatCode": "RO34567890",
    "isVatPayer": true,
    "address": "Strada Transport, nr. 15",
    "city": "Timisoara",
    "email": "logistics@distribution.ro"
  },
  "documentSeriesId": "850e8400-e29b-41d4-a716-446655440000",
  "documentSeries": "DN",
  "discount": 0.00,
  "notes": "Handle with care - fragile items",
  "mentions": "Driver will collect signature upon delivery",
  "internalNote": "Priority delivery",
  "deliveryLocation": "Strada Transport, nr. 15, Timisoara",
  "projectReference": "PROJ-2024-008",
  "issuerName": "Ion Popescu",
  "issuerId": "1850123456789",
  "salesAgent": "Maria Ionescu",
  "deputyName": "Vasile Georgescu",
  "deputyIdentityCard": "AB123456",
  "deputyAuto": "B-123-XYZ",
  "exchangeRate": 1.0000,
  "convertedInvoice": null,
  "issuedAt": "2024-02-18T08:00:00+02:00",
  "cancelledAt": null,
  "etransportOperationType": 30,
  "etransportVehicleNumber": "B-123-XYZ",
  "etransportTrailer1": null,
  "etransportTrailer2": null,
  "etransportTransporterCountry": "RO",
  "etransportTransporterCode": "12345678",
  "etransportTransporterName": "Transport SRL",
  "etransportTransportDate": "2024-02-20",
  "etransportStartCounty": 40,
  "etransportStartLocality": "Bucuresti",
  "etransportStartStreet": "Strada Industriilor",
  "etransportStartNumber": "10",
  "etransportStartOtherInfo": null,
  "etransportStartPostalCode": "010000",
  "etransportEndCounty": 35,
  "etransportEndLocality": "Timisoara",
  "etransportEndStreet": "Strada Transport",
  "etransportEndNumber": "15",
  "etransportEndOtherInfo": null,
  "etransportEndPostalCode": "300000",
  "etransportUit": "RO240218ABC123",
  "etransportStatus": "ok",
  "etransportErrorMessage": null,
  "etransportSubmittedAt": "2024-02-18T08:05:00+02:00",
  "lines": [
    {
      "id": "f2a3b4c5-d6e7-8901-6789-012345678901",
      "position": 1,
      "description": "Product A - Box of 50",
      "quantity": 10.0,
      "unitOfMeasure": "box",
      "unitPrice": 150.00,
      "vatRate": 19.00,
      "vatAmount": 285.00,
      "lineTotal": 1785.00,
      "discount": 0.00,
      "productCode": "PROD-A-50",
      "tariffCode": "39269097",
      "purposeCode": 101,
      "unitOfMeasureCode": "KGM",
      "netWeight": 25.00,
      "grossWeight": 27.50,
      "valueWithoutVat": 1500.00
    }
  ],
  "createdAt": "2024-02-18T07:00:00+02:00",
  "updatedAt": "2024-02-18T08:00:00+02:00",
  "deletedAt": null
}
```

## Workflow

1. **Draft**: Delivery note is created with line items
2. **Issued**: Delivery note is issued and accompanies the goods
3. **e-Transport Submitted** (optional): After issuing, the delivery note can be submitted to ANAF's e-Transport system — status transitions to `uploaded`, then `ok` (UIT received) or `nok` (rejected)
4. **Converted**: Optionally converted to an invoice after delivery
5. **Cancelled**: Can be cancelled if delivery doesn't occur

## e-Transport Integration

e-Transport is Romania's ANAF system for declaring goods transported on national roads. Companies that meet the legal threshold must declare transport movements before the goods depart.

### How it works

- After a delivery note is issued, it can be submitted to e-Transport via the [Submit Delivery Note to e-Transport](/api-reference/delivery-notes/submit-etransport) endpoint
- The submission sends the transport declaration to ANAF and sets `etransportStatus` to `uploaded`
- ANAF processes the declaration asynchronously: if accepted, `etransportStatus` becomes `ok` and the `etransportUit` field is populated with the UIT; if rejected, the status becomes `nok` and `etransportErrorMessage` contains the rejection reason
- Validation failures before submission result in a `validation_failed` status; network or connectivity issues result in `upload_failed`

### UIT (Unique Identifier of Transport)

The UIT is the transport's official tracking number issued by ANAF upon successful declaration. It must accompany the goods during transport and can be checked by authorities. The UIT is stored in the `etransportUit` field.

### Status flow

```
(not submitted) → uploaded → ok      (UIT received, transport approved)
                           → nok     (rejected by ANAF, see etransportErrorMessage)
                → validation_failed  (data failed validation before submission)
                → upload_failed      (submission failed due to connectivity issues)
```

### Line item fields for e-Transport

Each delivery note line supports additional e-Transport-specific fields: `tariffCode` (customs tariff code), `purposeCode` (reason for transport), `unitOfMeasureCode` (UN/ECE code), `netWeight`, `grossWeight`, and `valueWithoutVat`. These are required by ANAF for a valid transport declaration.

## Notes

- Delivery notes track the physical movement of goods
- They can be converted to invoices after successful delivery
- Deputy fields track the person transporting the goods
- Delivery location can differ from client's registered address
- PDFs are generated using the company's [PDF template configuration](/objects/pdf-template-config)
