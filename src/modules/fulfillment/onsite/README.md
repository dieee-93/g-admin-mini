# Fulfillment Onsite (`/modules/fulfillment/onsite`)

## Overview
Onsite service management, replacing the legacy "Floor" module. Manages tables, reservations, and assigning orders to physical locations within the restaurant.

## Access Control
- **Category**: Operations
- **Permissions**: `operations` permissions.
- **Minimum Role**: `OPERADOR`

## Features
- **Table Management**: Visual floor plan and status.
- **Order Assignment**: Link orders to tables.
- **Quick View**: Rapid access to table status.

## Hooks
### Provided
- `fulfillment.onsite.table_status`: Real-time status updates.
- `settings.hours.tabs`: Operating hours configuration.
- `sales.pos.context_selector`: Table selection in POS.

### Consumed
- `sales.order_placed`

## Dependencies
- `sales`
