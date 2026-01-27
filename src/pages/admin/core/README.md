# Core Administration (`/admin/core`)

## Overview
The Core module acts as the central nervous system of the G-Admin Mini platform. It houses essential administrative tools that cut across specific operational domains, including the main Dashboard, Settings, CRM, and system-wide Reporting/Intelligence.

## Access Control
- **Roles**: Generally available to `ADMINISTRADOR` and `GERENTE` roles.
- **Permissions**: Varies by sub-module (e.g., `settings.manage` for Settings, `dashboard.view` for Dashboard).

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Dashboard** | `/dashboard` | `dashboard/page.tsx` | Central command center with widgets and KPIs. |
| **Settings** | `/settings` | `settings/page.tsx` | Global system configuration (Tax, Profile, Users). |
| **CRM (Customers)** | `/crm/customers` | `crm/customers/page.tsx` | Customer profiles, history, and management. |
| **Intelligence** | `/intelligence` | `intelligence/page.tsx` | AI-driven insights and predictive analytics. |
| **Reporting** | `/reporting` | `reporting/page.tsx` | Core system reports and data export. |

## Dependencies
- **Core Components**: Relies on `shared/ui` for layout and design system.
- **Services**: Integrates with `core/settings` for system-wide configs.
