---
title: Verify ANAF signature
description: Verify the digital signature on an ANAF-validated invoice
---

# Verify ANAF signature

Verifies the digital signature applied by ANAF to a validated invoice. This confirms the authenticity and integrity of the invoice XML.

```
POST /api/v1/invoices/{uuid}/verify-signature
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

{% callout type="info" %}
This endpoint requires the invoice to have been submitted to and validated by ANAF.
{% /callout %}

## Prerequisites

Before verifying a signature:

1. Invoice must be submitted to ANAF
2. Invoice must have `validated` status
3. ANAF must have applied a digital signature

## Request

{% code-snippet-group %}

{% code-snippet title="cURL" %}
```bash
curl -X POST https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/verify-signature \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: 550e8400-e29b-41d4-a716-446655440000"
```
{% /code-snippet %}

{% code-snippet title="JavaScript" %}
```javascript
const response = await fetch('https://api.storno.ro/api/v1/invoices/7c9e6679-7425-40de-944b-e07fc1f90ae7/verify-signature', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': '550e8400-e29b-41d4-a716-446655440000'
  }
});

const verification = await response.json();

if (verification.valid) {
  console.log('✓ Signature is valid');
  console.log('Signed by:', verification.signer);
} else {
  console.error('✗ Signature verification failed');
}
```
{% /code-snippet %}

{% /code-snippet-group %}

## Response

Returns signature verification results with signer details and timestamp.

### Valid signature response

```json
{
  "valid": true,
  "signer": "ANAF - Agentia Nationala de Administrare Fiscala",
  "signerCertificate": {
    "subject": "CN=ANAF e-Factura, O=Ministerul Finantelor Publice, C=RO",
    "issuer": "CN=Root CA, O=Autoritatea Nationala de Certificare, C=RO",
    "serialNumber": "1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D",
    "validFrom": "2023-01-01T00:00:00Z",
    "validUntil": "2025-12-31T23:59:59Z",
    "fingerprint": "SHA256:1234567890ABCDEF..."
  },
  "signatureTimestamp": "2024-02-15T10:00:00Z",
  "algorithm": "RSA-SHA256",
  "signatureFormat": "XMLDSig",
  "certificateChainValid": true,
  "timestampValid": true,
  "xmlIntegrityValid": true,
  "verifiedAt": "2024-02-16T15:00:00Z"
}
```

### Invalid signature response

```json
{
  "valid": false,
  "error": "signature_mismatch",
  "errorMessage": "The XML content has been modified after signing",
  "signer": "ANAF - Agentia Nationala de Administrare Fiscala",
  "signatureTimestamp": "2024-02-15T10:00:00Z",
  "verifiedAt": "2024-02-16T15:00:00Z",
  "details": {
    "certificateChainValid": true,
    "timestampValid": true,
    "xmlIntegrityValid": false
  }
}
```

## Response fields

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether the signature is valid |
| `signer` | string | Name of the signing authority |
| `signerCertificate` | object | X.509 certificate details |
| `signatureTimestamp` | string | When the signature was created |
| `algorithm` | string | Signature algorithm used |
| `signatureFormat` | string | Signature format (XMLDSig, XAdES) |
| `certificateChainValid` | boolean | Certificate chain verification |
| `timestampValid` | boolean | Timestamp verification |
| `xmlIntegrityValid` | boolean | XML content integrity check |
| `verifiedAt` | string | When verification was performed |

## Verification checks

The signature verification process includes:

### 1. Certificate validation
- Certificate is issued by trusted CA
- Certificate is not expired
- Certificate chain is complete and valid
- Certificate has not been revoked

### 2. Signature validation
- Signature cryptographically matches the XML
- Signature algorithm is secure
- Signature format conforms to standards

### 3. Content integrity
- XML content has not been modified
- All referenced elements are present
- Hash values match original content

### 4. Timestamp validation
- Timestamp is from trusted authority
- Timestamp is within valid range
- Timestamp matches signature creation

## Why verify signatures

Digital signature verification is important for:

- **Legal compliance** - Ensure invoice authenticity for audits
- **Fraud prevention** - Detect tampered or forged invoices
- **Dispute resolution** - Prove invoice integrity in legal disputes
- **Archival integrity** - Verify archived invoices haven't been altered
- **Third-party validation** - Allow clients to verify invoice authenticity

## Signature validity period

ANAF signatures are typically valid for:
- **Certificate validity** - 2-3 years from issue date
- **Timestamp validity** - Permanent (as long as timestamping service is trusted)
- **Archive validity** - 10+ years with qualified timestamp

{% callout type="warning" %}
Signature verification may fail if performed after the signer certificate expires. Perform verification and archive results for long-term compliance.
{% /callout %}

## Error codes

| Code | Description |
|------|-------------|
| `401` | Missing or invalid authentication token |
| `403` | No access to company |
| `404` | Invoice not found or not validated by ANAF |
| `422` | No digital signature present on invoice |
| `500` | Verification service temporarily unavailable |

## Common verification errors

| Error code | Description | Solution |
|------------|-------------|----------|
| `no_signature` | Invoice has no digital signature | Ensure invoice was validated by ANAF |
| `signature_mismatch` | XML was modified after signing | Re-download original from ANAF |
| `certificate_expired` | Signer certificate has expired | Verification is no longer possible |
| `certificate_revoked` | Certificate was revoked | Contact ANAF support |
| `invalid_chain` | Certificate chain is broken | Check trusted CA certificates |
| `timestamp_invalid` | Timestamp verification failed | Contact ANAF support |

## Related endpoints

- [Submit to ANAF](/api-reference/invoices/submit) - Submit invoice to get signature
- [Download XML](/api-reference/invoices/xml) - Download signed XML
- [Invoice events](/api-reference/invoices/events) - View validation history
- [Get invoice details](/api-reference/invoices/get) - Check validation status
