# Executive Module (`/admin/executive`)

## Overview
The Executive module provides high-level business intelligence, strategic dashboards, and natural language query capabilities for C-Level decision making.

## Access Control
- **Roles**: `ADMINISTRADOR`, `GERENTE`
- **Permissions**: `executive.view`

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Executive Dashboard** | `/dashboards` | `dashboards/page.tsx` | C-Suite view with KPIs and NLP BI. |

## Key Sections
- **C-Suite Dashboard**: High-level KPIs (Revenue, Churn, ARR).
- **Natural Language BI**: AI-powered conversational analytics.
- **External Data**: Integration with competitive market data.
- **Advanced Charts**: detailed visualizations for strategic planning.

## Dependencies
- `shared/ui`
- `ModuleEventBus` for cross-module data aggregation.
