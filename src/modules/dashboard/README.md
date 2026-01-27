# Dashboard (`/modules/dashboard`)

## Overview
The central dashboard that provides an overview of all business domains. It functions as a container that aggregates and displays widgets provided by other registered modules.

## Access Control
- **Category**: Core
- **Permissions**: Global access (Role-based views).
- **Minimum Role**: `OPERADOR`

## Architecture
- **Widget System**: Uses a `dashboard.widgets` hook to collect components from loaded modules.
- **Layout Engine**: Organizes widgets based on priority and user role.
- **Hero Widgets**: Top-level priority (e.g., Shift Control).

## Hooks
### Provided
- `dashboard.widgets`: The main hook for other modules to register their widgets.
- `dashboard.kpi_cards`: For smaller, key performance indicator cards.
- `dashboard.charts`: For analytical charts.
- `dashboard.quick_actions`: For global quick actions.

### Consumed
- `sales.metrics`
- `materials.stock_status`
- `staff.attendance`
- `finance.pending_invoices`
- And many others via `dashboard.widgets`.

## Dependencies
- None (Core Foundation)
