# Reporting Module (`/admin/core/reporting`)

## Overview
The Reporting module provides tools for generating custom reports and analyzing business insights across the platform.

## Access Control
- **Roles**: `ADMINISTRADOR`, `GERENTE`, `OPERADOR`
- **Permissions Required**: `reporting.view`, `reporting.export`

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Report Builder** | `/` | `CustomReporting` | Interface for creating and running custom reports. |

## Key Sections
- **Custom Reporting**: A builder interface to select metrics, date ranges, and dimensions for ad-hoc analysis.

## Dependencies
- `shared/ui`: For layout and components.
- `CustomReporting` component (internal).
