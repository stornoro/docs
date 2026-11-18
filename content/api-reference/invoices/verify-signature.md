---
title: Verify ANAF signature
description: Verify the digital signature on an ANAF-validated invoice
---

# Verify ANAF signature

Verifies the digital signature that ANAF applied to an invoice, using the stored signature file and the invoice XML. The result is also saved on the invoice (`signatureValid`).

```
POST /api/v1/invoices/{uuid}/verify-signature
```

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |
| `X-Company` | string | No | Not used on this route: the invoice is found by its UUID |

## Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | Invoice UUID |

The endpoint takes no body.

## Prerequisites

1. The plan includes signature verification. Plans without it get `402`.
2. The invoice has a stored ANAF signature file, which exists after ANAF validated the invoice. You can download it with `GET /api/v1/invoices/{uuid}/signature`.

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/verify-signature \
  -H "Authorization: Bearer YOUR_TOKEN"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/verify-signature', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const verification = await response.json();

if (verification.valid) {
  console.log('Signature is valid');
} else {
  console.error('Signature verification failed:', verification.message);
}
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns `200 OK` with the verification result.

```json
{
  "valid": true,
  "message": "Signature verified"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether the signature is valid |
| `message` | string | Short result text from the verifier. When verification fails, it describes the reason |

When the invoice has no XML or no stored signature, the response is `404` with `{"valid": false, "message": "Semnatura indisponibila"}`.

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `402` | Signature verification is not available on the plan: `{"error": "...", "code": "PLAN_LIMIT"}` |
| `403` | The invoice belongs to another organization, or the user cannot view invoices |
| `404` | Invoice not found, or no signature is stored for it (see above) |

## Related endpoints

- [Submit to ANAF](/api-reference/invoices/submit) - Submit the invoice to get a signature
- [Download XML](/api-reference/invoices/xml) - Download the XML
- [Invoice events](/api-reference/invoices/events) - View validation history
- [Get invoice details](/api-reference/invoices/get) - Check validation status
