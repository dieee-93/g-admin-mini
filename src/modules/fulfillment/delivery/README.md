# Fulfillment Delivery (`/modules/fulfillment/delivery`)

## Overview
Complete delivery management system. Handles zones, driver assignment, route optimization, and GPS tracking coordinates.

## Access Control
- **Category**: Operations
- **Permissions**: `operations` permissions.
- **Minimum Role**: `OPERADOR`

## Features
- **Address Validation**: Check if address is within delivery zones.
- **Driver Assignment**: Auto or manual assignment of drivers.
- **Route Optimization**: Suggest best driver/route.
- **GPS Tracking**: Real-time location updates.

## Hooks
### Provided
- `fulfillment.delivery.dispatched`
- `fulfillment.delivery.driver_assigned`
- `fulfillment.delivery.in_transit`
- `fulfillment.delivery.completed`

### Consumed
- `sales.order_placed`: To queue delivery orders.
- `production.order_ready`: To trigger driver assignment.
- `staff.driver_location_update`: Real-time GPS.

## Dependencies
- `fulfillment` (Parent)
- `sales`
