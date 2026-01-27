# Operations Module (`/admin/operations`)

## Overview
Operations is the heart of the daily business logic. It groups key revenue-generating and service-delivery functions including Sales, Fulfillment, Rentals, Memberships, and Production.

## Access Control
- **Roles**: Varies by sub-module. Broadly `OPERADOR` and above.

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Sales (POS)** | `/sales` | `sales/page.tsx` | Point of Sale and order management. |
| **Fulfillment** | `/fulfillment` | `fulfillment/page.tsx` | Order processing (Kitchen/Delivery). |
| **Rentals** | `/rentals` | `rentals/page.tsx` | Equipment and space rentals. |
| **Memberships** | `/memberships` | `memberships/page.tsx` | Subscription and member management. |
| **Production** | `/production` | `production/page.tsx` | Manufacturing and assembly. |

## Dependencies
- `crm`: For customer linking.
- `supply-chain`: For inventory checks.
- `finance`: For billing and transactions.
