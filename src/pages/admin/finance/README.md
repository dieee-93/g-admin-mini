# Finance Module (`/admin/finance`)

## Overview
The core Finance module handles cash management, shifts, and daily liquid assets. It serves as the foundation for financial tracking alongside specialized modules like Billing and Fiscal.

## Access Control
- **Roles**: `ADMINISTRADOR`, `SUPERVISOR`, `CAJERO`
- **Permissions**: `finance.cash.view`, `finance.cash.manage`

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Cash Management** | `/cash` | `cash/page.tsx` | Daily cash flow, openings, and closures. |
| **Finance Dashboard** | `/` | `page.tsx` | Central finance overview. |

## Related Finance Modules

The Finance domain is split into multiple specialized modules:

| Module | Route | Description |
|--------|-------|-------------|
| **Billing** | `/admin/finance-billing` | Recurring billing, subscriptions, and invoicing logic. |
| **Fiscal** | `/admin/finance-fiscal` | Tax compliance (AFIP), IVA, and fiscal reporting. |
| **Corporate** | `/admin/finance-corporate` | B2B accounts, credit management, and corporate relations. |
| **Integrations** | `/admin/finance-integrations` | Payment gateways (MercadoPago, MODO) and bank connections. |

## Key Sections
- **Cash Flow**: Real-time tracking of cash movements.
- **Shift Control**: Management of cashier shifts and reconciliations.

## Dependencies
- `finance-billing`: For invoice integration.
- `shared/ui`: Standard components.
