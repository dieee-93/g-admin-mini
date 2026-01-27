# Rentals Module (`/admin/operations/rentals`)

## Overview
The Rentals module manages the booking and tracking of equipment, spaces, and other assets for temporary use by customers.

## Access Control
- **Roles**: `ADMINISTRADOR`, `GERENTE`, `OPERADOR`
- **Permissions**: `rentals.view`, `rentals.manage`

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Rental Dashboard** | `/` | `page.tsx` | Calendar view of bookings and availability. |
| **New Booking** | `(modal)` | `CreateRentalModal` | Booking creation wizard. |

## Key Sections
- **Availability Calendar**: Visual timeline of asset usage.
- **Asset Inventory**: List of rentable items (linked from Supply Chain).

## Dependencies
- `crm`: For linking rentals to customers.
- `supply-chain`: For asset definitions.
