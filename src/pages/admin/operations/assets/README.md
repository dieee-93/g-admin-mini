# Assets Module (`/admin/operations/assets`)

## 📋 Overview
The **Assets** module handles the tracking, maintenance, and lifecycle management of physical assets (machinery, vehicles, equipment).

## Access Control
- **Roles**: `ADMINISTRADOR`, `GERENTE`, `JEFE_OPERACIONES`
- **Permissions**: `operations.assets.view`, `operations.assets.manage`

## 🗺️ Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Asset Dashboard** | `/` | `page.tsx` | Overview of asset status and maintenance alerts. |
| **Asset Registry** | `(modal)` | `AssetForm` | Registration of new physical assets. |
| **Maintenance** | `(drawer)` | `MaintenanceLog` | Tracking of repairs and scheduled maintenance. |

## 🏗️ Structure
```
src/pages/admin/operations/assets/
├── page.tsx            # Main orchestrator
├── components/         # Asset-specific UI
└── hooks/              # Business logic
```
