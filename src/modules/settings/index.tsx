// src/modules/settings/index.tsx  
// Exportaciones del módulo de configuraciones del negocio

export * from './types';

// Main Page Component
export { SettingsPage } from './SettingsPage';

// Components
export { SettingsHeader } from './components/SettingsHeader';
export { BusinessProfileSection } from './components/sections/BusinessProfileSection';
export { TaxConfigurationSection } from './components/sections/TaxConfigurationSection';
export { UserPermissionsSection } from './components/sections/UserPermissionsSection';
export { IntegrationsSection } from './components/sections/IntegrationsSection';

// TODO: Implementar hooks
// export * from './logic/useBusinessSettings';
// export * from './logic/useSystemSettings';

// API
export * from './data/settingsApi';
