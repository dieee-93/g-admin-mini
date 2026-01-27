# Fulfillment Pickup (`/modules/fulfillment/pickup`)

## Overview
Management of takeout/pickup orders. Handles time slot scheduling, QR code generation for secure pickup, and customer readiness notifications.

## Access Control
- **Category**: Operations
- **Permissions**: `operations` permissions.
- **Minimum Role**: `OPERADOR`

## Features
- **Time Slot Scheduling**: Manage pickup capacity per slot.
- **QR Confirmation**: Secure hand-off using QR scanning.
- **Ready Notifications**: Auto-notify customers when ready.

## Hooks
### Provided
- `fulfillment.pickup.timeslot_selected`
- `fulfillment.pickup.ready`
- `fulfillment.pickup.confirmed`

### Consumed
- `sales.order_placed`: To queue pickup orders.
- `production.order_ready`: To trigger customer notification.

## Dependencies
- `fulfillment` (Parent)
- `sales`
