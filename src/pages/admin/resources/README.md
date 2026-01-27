# Resources Module (`/admin/resources`)

## Overview
The Resources module manages the human capital of the organization, including staff directories, scheduling, and shifts.

## Access Control
- **Roles**: `ADMINISTRADOR`, `GERENTE`, `SUPERVISOR`

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Staff Directory** | `/staff` | `staff/page.tsx` | Employee profiles and roles. |
| **Scheduling** | `/scheduling` | `scheduling/page.tsx` | Shift planning and rosters. |

## Key Sections
- **Staff Profiles**: Manage permissions, roles, and contact info.
- **Roster View**: Weekly/Monthly calendar of staff shifts.

## Dependencies
- `core/settings`: For Role definitions.
