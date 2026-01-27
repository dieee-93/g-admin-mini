# Tools Module (`/admin/tools`)

## Overview
A collection of utility tools and diagnostic pages for administrators.

## Access Control
- **Roles**: `ADMINISTRADOR` only.

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Alerts Tester** | `/alerts` | `AlertsTestingPage.tsx` | Dashboard for testing system alerts. |
| **Legacy Reporting** | `/reporting` | `reporting/` | Old reporting tools (Superceded by `core/reporting`). |

## Dependencies
- `shared/alerts`: The system being tested.
