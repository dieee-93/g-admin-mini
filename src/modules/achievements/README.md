# Achievements & Requirements System (`/modules/achievements`)

## Overview
The Achievements & Requirements System is a 3-layer validation and gamification engine. It ensures business capabilities are operational before use (Mandatory), suggests improvements (Suggested), and rewards usage (Cumulative).

## Access Control
- **Category**: System
- **Permissions**: `gamification` module permissions.
- **Minimum Role**: `OPERADOR`

## Architecture
- **Mandatory Layer**: Blocks commercial operations if requirements are not met (e.g., "Printer not connected").
- **Suggested Layer**: Non-blocking improvements (e.g., "Add a description to this item").
- **Cumulative Layer**: Gamification achievements (e.g., "100 Sales Processed").

## Hooks
### Provided
- `achievements.register_requirement`: Register a new requirement for a capability.
- `achievements.validate_commercial_operation`: Validate if an action can proceed.
- `achievements.get_progress`: Get completion % for a capability.
- `dashboard.widgets`: Dashboard status widget.

### Consumed
- `sales.capability_requirements`
- `fulfillment.onsite.capability_requirements`
- `ecommerce.capability_requirements`
- `delivery.capability_requirements`

## API Exports
- `validateOperation(capability, action, context)`
- `getProgress(capability, context)`
- `getRequirements(capability)`
- `isOperational(capability, context)`

## Dependencies
- `gamification` (Permission Module)
- `shared/ui`
