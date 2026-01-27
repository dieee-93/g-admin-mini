# Asset Management (`/modules/assets`)

## Overview
Physical asset management and tracking system. Manages equipment, tools, vehicles, and facility assets, covering their entire lifecycle from acquisition to disposal.

## Access Control
- **Category**: Business
- **Permissions**: `operations` module permissions.
- **Minimum Role**: `SUPERVISOR`

## Features
- **Asset Inventory**: Tracking of physical items.
- **Maintenance**: Scheduling and tracking of maintenance tasks.
- **Status Tracking**: Active, In Maintenance, Retired, etc.

## Hooks
### Provided
- `assets.status_updated`: Event when asset status changes.
- `assets.maintenance_due`: Event when maintenance is required.
- `dashboard.widgets`: Asset health summary.
- `assets.row.actions`: Custom actions in asset lists.
- `assets.form.fields`: Custom fields in asset forms.

### Consumed
- `rentals.asset_rented`: Updates status when rented.
- `operations.asset_used`: Updates status when used in operations.

## Dependencies
- `operations` (Permission Module)
