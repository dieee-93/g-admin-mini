# Gamification Module (`/admin/gamification`)

## Overview
The Gamification module drives user engagement through achievements, levels, and rewards. It serves to motivate staff and visualize system adoption metrics.

## Access Control
- **Roles**: All Roles (View own), `ADMINISTRADOR`/`GERENTE` (Manage)
- **Permissions**: `gamification.view`

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Gamification Hub** | `/` | `page.tsx` | User level and recent achievements. |
| **All Achievements** | `/achievements` | `achievements/page.tsx` | Full grid of available badges. |

## Dependencies
- `shared/ui`: Standard UI components.
