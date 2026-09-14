---
title: Create Declaration
description: Create a new tax declaration with data auto-populated from invoices
method: POST
endpoint: /api/v1/declarations
---

# Create Declaration

Creates a new tax declaration in `draft` status. The declaration's `data` field is automatically populated by aggregating invoice data for the specified type and period. The resulting draft can be reviewed, edited, validated, and submitted to ANAF.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | Yes | Company UUID to scope the request |
| `Content-Type` | string | Yes | Must be `application/json` |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Declaration type: `d394`, `d300`, `d390`, `d100`, `d112` |
| `year` | integer | Yes | Fiscal year (e.g., 2026) |
| `month` | integer | Yes | Fiscal month (1–12) |
| `periodType` | string | No | Period type override (e.g., `monthly`, `quarterly`). Defaults to the standard period for the declaration type |

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/declarations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "d394",
    "year": 2026,
    "month": 1
  }'
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/declarations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'd394',
    year: 2026,
    month: 1
  })
});

const data = await response.json();
```

## Response

Returns `201 Created` with the new declaration object.

```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "d394",
  "year": 2026,
  "month": 1,
  "periodType": "monthly",
  "status": "draft",
  "data": {
    "totalSalesBase": "84033.61",
    "totalSalesVat": "15966.39",
    "totalPurchasesBase": "42016.81",
    "totalPurchasesVat": "7983.19",
    "invoiceCount": 47
  },
  "metadata": {
    "generatedAt": "2026-02-10T08:00:00Z",
    "invoiceCountAtGeneration": 47
  },
  "errorMessage": null,
  "anafUploadId": null,
  "xmlPath": null,
  "recipisaPath": null,
  "createdAt": "2026-02-10T08:00:00Z",
  "updatedAt": "2026-02-10T08:00:00Z",
  "createdBy": "user-uuid-here"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique identifier of the created declaration |
| `type` | string | Declaration type |
| `year` | integer | Fiscal year |
| `month` | integer | Fiscal month |
| `periodType` | string \| null | Resolved period type |
| `status` | string | Always `draft` on creation |
| `data` | object | Auto-populated fiscal data aggregated from invoices for the period |
| `metadata` | object | Generation metadata including timestamp and invoice count snapshot |
| `errorMessage` | string \| null | Always `null` on creation |
| `anafUploadId` | string \| null | Always `null` on creation |
| `xmlPath` | string \| null | Always `null` on creation |
| `recipisaPath` | string \| null | Always `null` on creation |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 last-updated timestamp |
| `createdBy` | string | UUID of the authenticated user |

## D300 (decont de TVA)

`data.rows` is keyed by ANAF's own XML attribute names (`R9_1` = base of row 9, `R9_2` = its VAT, …), in whole lei, so the XML is written exactly as populated and the values can be edited before filing. The form version follows the period (`data.layout`):

| Period | Layout | Standard rows |
|---|---|---|
| until 07/2025 | `legacy` | 19 % → R9, 9 % → R10, 5 % → R11 |
| 08–12/2025 | `v2025h2` | 21 % → R9, 11 % → R10, plus R69 / R70 / R71 (sales) and R74 / R75 / R24 (purchases) for the old 19 / 9 / 5 % |
| from 01/2026 | `v2026` | 21 % → R9, 11 % → R10; old rates only as regularisations |

How invoices are placed:

- **Sales** are taken by issue date. Taxable lines go to the rate's row; category `AE` (or invoice type *taxare inversă*) to row 13 (base only); intra-community goods to row 1, intra-community services and exports to rows 3 / 3.1; exempt with deduction to row 14, exempt without to row 15; OSS (art. 314–315) to row 17; a line at a rate the form no longer has, or an invoice issued to the company's own CUI, is a regularisation (row 16). Category `O` and the margin / travel-agent regimes stay out of the return.
- **Purchases** are taken by the date they were recorded in Storno. Domestic taxable lines go to rows 24 / 25; a supplier invoice dated before the period, or at an abrogated rate, is a regularisation (row 33). Reverse charge is self-assessed on both sides: domestic `AE` → rows 12 (12.1 / 12.2 by rate) and 26 (26.1 / 26.2); intra-community goods → rows 5 / 5.1 and 20 / 20.1; services from the EU → rows 7 / 7.1 and 22 / 22.1; services from outside the EU → rows 7 and 22. Exempt purchases and imported goods go to row 29. Foreign-currency invoices use the invoice's exchange rate.
- Rows are rounded to whole lei (half up); totals (rows 19, 30, 35, 37, 44, 45) are sums of rows; row 42 of the previous period's D300 is carried into row 42 (`R38_2`) when no refund was requested.

The header the validator requires is filled from the company: declarant (`representative` split into name / first name, `representativeRole`), `caenCode`, the default bank account, `tip_decont` (L / T), the checkboxes (`N`), `temei` (0) and the payment reference `nr_evid` (computed). Missing prerequisites are listed in `data.warnings` (`MISSING_CAEN`, `MISSING_REPRESENTATIVE`, `MISSING_BANK_ACCOUNT`, `UNMAPPED_LINES`); the validator refuses the return without them.

## Validation Rules

- `type` must be one of: `d394`, `d300`, `d390`, `d100`, `d112`
- `year` must be a valid 4-digit year
- `month` must be between 1 and 12
- A declaration of the same `type`, `year`, and `month` must not already exist for the company

## Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request body structure |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `forbidden` | Invalid or missing X-Company header |
| 409 | `conflict` | A declaration for this type and period already exists |
| 422 | `validation_error` | Validation failed (e.g., invalid type, invalid month) |
| 500 | `internal_error` | Server error occurred |

## Next Steps

After creating a declaration:
1. Review and optionally edit the auto-populated data (`PATCH /api/v1/declarations/{uuid}`)
2. Recalculate if invoices were added or changed (`POST /api/v1/declarations/{uuid}/recalculate`)
3. Validate to generate the XML (`POST /api/v1/declarations/{uuid}/validate`)
4. Submit to ANAF (`POST /api/v1/declarations/{uuid}/submit`)
