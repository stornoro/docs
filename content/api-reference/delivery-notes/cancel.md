---
title: Cancel Delivery Note
description: Cancel a delivery note when delivery will not occur
method: POST
endpoint: /api/v1/delivery-notes/{uuid}/cancel
---

# Cancel Delivery Note

Cancels a delivery note by transitioning it to `cancelled` status. This action is used when a planned delivery will not occur, or when a delivery needs to be invalidated for any reason.

Unlike deletion, cancellation keeps the delivery note as a record. A cancelled delivery note can be restored to draft or deleted.

## Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token for authentication |

## Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `uuid` | string | Yes | The UUID of the delivery note to cancel |

## Request Body

The endpoint takes no body.

## Request

```bash {% title="cURL" %}
curl -X POST https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Company: company-uuid-here"
```

```javascript {% title="JavaScript" %}
const response = await fetch('https://api.storno.ro/api/v1/delivery-notes/950e8400-e29b-41d4-a716-446655440000/cancel', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-Company': 'company-uuid-here'
  }
});

const data = await response.json();
```

## Response

Returns the delivery note with `status = cancelled` and the `cancelledAt` timestamp. The object has the fields described in [Get delivery note](/api-reference/delivery-notes/get#response); the example is abridged:

```json
{
  "id": "950e8400-e29b-41d4-a716-446655440000",
  "number": "DN0012",
  "client": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "name": "Client SRL",
    "cui": "12345678"
  },
  "status": "cancelled",
  "issueDate": "2026-02-18",
  "dueDate": "2026-03-18",
  "currency": "RON",
  "subtotal": "5000.00",
  "vatTotal": "1050.00",
  "total": "6050.00",
  "issuedAt": "2026-02-18T14:30:00+00:00",
  "cancelledAt": "2026-02-19T09:15:00+00:00",
  "convertedInvoice": null
}
```

## State Changes

### Status Transition
- **Before:** Any status except `converted` or `cancelled`
- **After:** `status = cancelled`

### Timestamp
- Sets `cancelledAt` to the current time

### Restrictions Applied
Once cancelled:
- Cannot be converted to invoice
- Cannot be issued or edited
- Can be restored to `draft`, or deleted

## Validation Rules

### Status Requirement
Can cancel delivery note in these statuses:
- `draft` - Not yet issued
- `issued` - Issued but not yet converted

Cannot cancel delivery note in these statuses:
- `converted` - Already converted to invoice (use credit note instead)
- `cancelled` - Already cancelled

A delivery note whose `etransportStatus` is `uploaded` or `ok` cannot be cancelled either.

### Business Logic
Cancelling a delivery note indicates:
- Delivery will not occur
- Order was cancelled
- Goods not available
- Error in delivery planning
- Client requested cancellation

## Error Codes

Errors have the form `{"error": "message"}`.

| Status Code | Description |
|-------------|-------------|
| 401 | Missing or invalid authentication token |
| 403 | Permission denied |
| 404 | Delivery note not found or not in the caller's organization |
| 422 | The delivery note is already cancelled, already converted, or submitted to e-Transport (`etransportStatus` `uploaded` or `ok`) |

### Example error response

```json
{
  "error": "This delivery note is already cancelled."
}
```

## Cancel vs Delete

### Cancel
- **Use when:** Delivery was planned but won't occur
- **Preserves:** Full audit trail and historical data
- **Status:** `cancelled`
- **Can be done:** At any status (except converted/cancelled)
- **Inventory:** Can be returned to available stock

### Delete
- **Use when:** Delivery note created by mistake
- **Preserves:** Nothing visible: the record is soft-deleted and no longer listed
- **Status:** N/A
- **Can be done:** In `draft` or `cancelled` status
- **Inventory:** No inventory impact (wasn't committed)

## Workflow Integration

### Cancellation Flow
1. Determine cancellation is necessary
2. **Call cancel endpoint** (`POST /api/v1/delivery-notes/{uuid}/cancel`) ← You are here
3. Update inventory systems (return stock to available)
4. Notify relevant stakeholders
5. Cancel related transport orders
6. Update CRM and project management systems

### Notification Strategy
After cancellation:
- Notify logistics team
- Update warehouse/inventory system
- Cancel transport booking
- Inform client if they're expecting delivery
- Log reason in CRM
- Update project status

## Inventory Implications

When cancelling a delivery note:

### For Draft Delivery Notes
- Items were reserved but not yet committed
- Return reserved items to available stock
- No physical movement occurred

### For Issued Delivery Notes
- If goods already shipped, arrange return
- If goods in transit, coordinate with logistics
- Update warehouse records
- Restock returned items

## Integration Points

### Warehouse Management
- Return reserved inventory to available
- Cancel pick list
- Update stock locations
- Recount if necessary

### Logistics Systems
- Cancel transport order
- Notify driver if in transit
- Update route planning
- Close shipment record

### ERP/Accounting
- Update order status
- Cancel related purchase orders
- Update financial projections
- Record cancellation for reporting

## Best Practices

1. **Record the reason** - Keep the reason in `internalNote` through the update endpoint, since the cancel call stores none
2. **Coordinate returns** - If goods already shipped
3. **Update inventory** - Restore stock levels immediately
4. **Communicate promptly** - Notify all affected parties
5. **Track patterns** - Monitor cancellation reasons to improve processes
6. **Document thoroughly** - Use internal notes for detailed context
7. **Follow up** - If due to temporary issue, reschedule delivery
8. **Update systems** - Sync status to all integrated systems

## Analytics and Reporting

### Cancellation Metrics
Track these metrics for process improvement:
- Cancellation rate by status (draft vs issued)
- Time between creation and cancellation
- Cancellations by client or product
- Cost of cancelled deliveries

### Process Improvement
Use cancellation data to:
- Identify unreliable clients
- Improve inventory planning
- Optimize delivery scheduling
- Reduce out-of-stock situations
- Better qualify orders before preparation

## Recovery After Cancellation

Common next steps after cancellation:

### Undo Accidental Cancellation
If the delivery note was cancelled by mistake, use the `POST /api/v1/delivery-notes/{uuid}/restore` endpoint to restore it back to `draft` status. The delivery note can then be edited and re-issued.

### Temporary Cancellation
1. **Reschedule delivery** - Create new delivery note for later date
2. **Reserve inventory** - Keep items reserved for rescheduled delivery
3. **Coordinate with client** - Agree on new delivery date

### Permanent Cancellation
1. **Return to stock** - Make items available for other orders
2. **Cancel order** - Close the entire order in system
3. **Update forecast** - Adjust sales projections
4. **Learn from it** - Document the reason for future reference

### Partial Cancellation
1. **Create new delivery note** - With reduced quantities
2. **Return excess** - Restock items not needed
3. **Adjust order** - Update order to reflect actual delivery

## Special Scenarios

### Goods Already in Transit
```
1. Cancel delivery note in system
2. Contact driver/logistics immediately
3. Arrange return to warehouse
4. Update inventory on return
5. Create return documentation
```

### Partial Delivery Completed
```
1. Cannot cancel converted portion
2. May need to issue credit note for delivered portion
3. Cancel remaining undelivered portion
4. Create separate delivery note for future delivery if needed
```

### Cross-Border Shipment
```
1. Cancel delivery note
2. Handle customs documentation
3. Arrange return shipment if needed
4. Update international logistics partners
5. Handle any customs duties/fees
```

## Compliance Notes

### Documentation Requirements
- Keep cancelled delivery notes for audit period
- Document cancellation reason clearly
- Retain communication with client
- Track inventory movements

### Tax Implications
- Cancelled delivery notes don't generate revenue
- No VAT implications if not converted
- May affect period-end reporting
- Consider inventory valuation impacts

## After Cancellation

Next steps after cancelling:
1. Verify inventory updated correctly
2. Confirm transport cancellation
3. Update client records
4. Close related tasks/tickets
5. Create new delivery note if rescheduling
6. Document lessons learned
