# Settings (`/modules/settings`)

## Overview
Foundation for system configuration. Acts as a central registry where other modules can inject their own settings pages, effectively decentralizing configuration management while keeping a unified UI.

## 🏗️ Architecture
**Type**: Foundation Module
**Category**: Core

### Key Integration Points
| Integration | Type | Description |
|-------------|------|-------------|
| **All Modules** | Consumed | Any module can register a settings section (e.g., "Tax Rates" in Finance). |
| **Integrations** | Host | Central hub for managing external API keys and connections. |
| **Diagnostics** | Host | Provides system health checks and logging tools. |

---

## Features
- **Section Registry**: Dynamic injection of settings panels.
- **Integration Manager**: Unified interface for managing 3rd party connections (MercadoPago, AFIP).
- **Diagnostics**: Network tests, version checks, and cache clearing.
- **Enterprise Features**: Feature flag management and license handling.

---

## 🪝 Hooks & Extension Points

### Provided Hooks
#### 1. `settings.sections`
- **Purpose**: Allows other modules to add a card to the main settings grid.
- **Payload**:
  - `id`: Unique identifier
  - `title`: Display name
  - `component`: React component for the settings page
  - `icon`: Icon for the grid card

#### 2. `settings.integrations`
- **Purpose**: Register an external service configuration card.

#### 3. `settings.diagnostics`
- **Purpose**: Add custom health checks (e.g., "Check Printer Connection").

---

## 🔌 Public API (`exports`)

### Configuration Management
```typescript
// Get a system-wide setting
const { value } = await registry.getExports('settings').getSetting('currency_symbol');

// Update a setting
await registry.getExports('settings').setSetting('theme_mode', 'dark');
```

### Registry
```typescript
// Register a new settings page programmatically
await registry.getExports('settings').registerSection({
  id: 'loyalty',
  title: 'Loyalty Program',
  component: LoyaltySettingsPage
});
```

---

## 🔒 Access Control
- **Minimum Role**: `ADMINISTRADOR`
- **Scope**: Global system modification.

---

**Last Updated**: 2025-01-25
**Module ID**: `settings`
