// Settings API - Business configuration database functions
import { logger } from '@/lib/logging';

import type { 
  BusinessSettings, 
  TaxSettings,
  SystemSettings,
  NotificationSettings,
  OperatingHours,
  BusinessType
} from '../types';

// Mock data store - in production this would connect to Supabase/database
let mockBusinessSettings: BusinessSettings = {
  id: '1',
  business_name: 'Restaurante El Sabor',
  business_type: 'restaurant',
  address: {
    street: 'Av. Principal 123',
    city: 'Ciudad de México',
    state: 'CDMX',
    postal_code: '01000',
    country: 'México'
  },
  contact: {
    phone: '+52 55 1234-5678',
    email: 'contacto@elsabor.com',
    website: 'https://elsabor.com',
    social_media: {
      facebook: 'https://facebook.com/elsabor',
      instagram: 'https://instagram.com/elsabor',
      twitter: 'https://twitter.com/elsabor'
    }
  },
  operating_hours: [
    { day_of_week: 0, is_open: false }, // Sunday
    { day_of_week: 1, is_open: true, open_time: '09:00', close_time: '22:00' }, // Monday
    { day_of_week: 2, is_open: true, open_time: '09:00', close_time: '22:00' }, // Tuesday
    { day_of_week: 3, is_open: true, open_time: '09:00', close_time: '22:00' }, // Wednesday
    { day_of_week: 4, is_open: true, open_time: '09:00', close_time: '22:00' }, // Thursday
    { day_of_week: 5, is_open: true, open_time: '09:00', close_time: '23:00' }, // Friday
    { day_of_week: 6, is_open: true, open_time: '10:00', close_time: '23:00' }  // Saturday
  ],
  tax_settings: {
    tax_rate: 16,
    tax_name: 'IVA',
    include_tax_in_prices: true,
    tax_number: 'RFC123456789'
  },
  currency: {
    code: 'MXN',
    symbol: '$',
    decimal_places: 2,
    position: 'before'
  },
  notification_settings: {
    email_notifications: true,
    sms_notifications: true,
    low_stock_alerts: true,
    order_notifications: true,
    employee_notifications: true
  },
  updated_at: new Date().toISOString()
};

// Mock system settings
let mockSystemSettings: SystemSettings = {
  theme: 'auto',
  language: 'es',
  timezone: 'America/Mexico_City',
  date_format: 'DD/MM/YYYY',
  time_format: '24h'
};

// Mock user roles and permissions
interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  users_count: number;
}

const mockUserRoles: UserRole[] = [
  {
    id: '1',
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    permissions: ['all'],
    users_count: 1
  },
  {
    id: '2',
    name: 'Gerente',
    description: 'Gestión operacional completa',
    permissions: ['operations:manage', 'sales:read', 'staff:manage', 'reports:read'],
    users_count: 2
  },
  {
    id: '3',
    name: 'Empleado',
    description: 'Acceso básico a operaciones',
    permissions: ['operations:read', 'sales:write'],
    users_count: 8
  },
  {
    id: '4',
    name: 'Cajero',
    description: 'Acceso solo a ventas',
    permissions: ['sales:write', 'sales:read'],
    users_count: 3
  }
];

// Mock integrations data
interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  type: 'payment' | 'messaging' | 'analytics' | 'delivery' | 'pos';
  config?: Record<string, any>;
  last_sync?: string;
}

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Stripe',
    description: 'Procesamiento de pagos online',
    status: 'active',
    type: 'payment',
    config: { publishable_key: 'pk_test_***', webhook_url: '/api/webhooks/stripe' },
    last_sync: new Date().toISOString()
  },
  {
    id: '2',
    name: 'WhatsApp Business',
    description: 'Notificaciones y atención al cliente',
    status: 'active',
    type: 'messaging',
    config: { phone_number: '+52551234567', business_account_id: 'wa_***' },
    last_sync: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
  },
  {
    id: '3',
    name: 'Google Analytics',
    description: 'Análisis web y comportamiento de usuarios',
    status: 'inactive',
    type: 'analytics',
    config: { tracking_id: 'GA-***' }
  }
];

/**
 * Get business settings
 * @returns Promise<BusinessSettings>
 */
export async function getBusinessSettings(): Promise<BusinessSettings> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockBusinessSettings;
}

/**
 * Update business settings with audit trail
 * @param settings - Updated business settings
 * @param updatedBy - User ID performing the update
 * @returns Promise<BusinessSettings>
 */
export async function updateBusinessSettings(
  settings: Partial<BusinessSettings>,
  updatedBy: string
): Promise<BusinessSettings> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  mockBusinessSettings = {
    ...mockBusinessSettings,
    ...settings,
    updated_at: new Date().toISOString()
  };
  
  // In production, this would create an audit log entry
  logger.info('App', `Business settings updated by ${updatedBy}`);
  
  return mockBusinessSettings;
}

/**
 * Update tax configuration
 * @param taxSettings - Updated tax settings
 * @param updatedBy - User ID performing the update
 * @returns Promise<TaxSettings>
 */
export async function updateTaxConfiguration(
  taxSettings: Partial<TaxSettings>,
  updatedBy: string
): Promise<TaxSettings> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  mockBusinessSettings.tax_settings = {
    ...mockBusinessSettings.tax_settings,
    ...taxSettings
  };
  mockBusinessSettings.updated_at = new Date().toISOString();
  
  logger.info('App', `Tax configuration updated by ${updatedBy}`);
  
  return mockBusinessSettings.tax_settings;
}

/**
 * Update operating hours
 * @param operatingHours - Updated operating hours
 * @param updatedBy - User ID performing the update
 * @returns Promise<OperatingHours[]>
 */
export async function updateOperatingHours(
  operatingHours: OperatingHours[],
  updatedBy: string
): Promise<OperatingHours[]> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  mockBusinessSettings.operating_hours = operatingHours;
  mockBusinessSettings.updated_at = new Date().toISOString();
  
  logger.info('App', `Operating hours updated by ${updatedBy}`);
  
  return mockBusinessSettings.operating_hours;
}

/**
 * Get system settings
 * @returns Promise<SystemSettings>
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockSystemSettings;
}

/**
 * Update system settings
 * @param settings - Updated system settings
 * @param updatedBy - User ID performing the update
 * @returns Promise<SystemSettings>
 */
export async function updateSystemSettings(
  settings: Partial<SystemSettings>,
  updatedBy: string
): Promise<SystemSettings> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  mockSystemSettings = {
    ...mockSystemSettings,
    ...settings
  };
  
  logger.info('App', `System settings updated by ${updatedBy}`);
  
  return mockSystemSettings;
}

/**
 * Get all user roles with permissions
 * @returns Promise<UserRole[]>
 */
export async function getUserRoles(): Promise<UserRole[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockUserRoles;
}

/**
 * Create new user role
 * @param roleData - New role data
 * @param createdBy - User ID creating the role
 * @returns Promise<UserRole>
 */
export async function createUserRole(
  roleData: Omit<UserRole, 'id' | 'users_count'>,
  createdBy: string
): Promise<UserRole> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const newRole: UserRole = {
    id: Date.now().toString(),
    ...roleData,
    users_count: 0
  };
  
  mockUserRoles.push(newRole);
  
  logger.info('App', `User role ${newRole.name} created by ${createdBy}`);
  
  return newRole;
}

/**
 * Update user role
 * @param roleId - Role ID to update
 * @param roleData - Updated role data
 * @param updatedBy - User ID performing the update
 * @returns Promise<UserRole>
 */
export async function updateUserRole(
  roleId: string,
  roleData: Partial<Omit<UserRole, 'id' | 'users_count'>>,
  updatedBy: string
): Promise<UserRole> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const roleIndex = mockUserRoles.findIndex(role => role.id === roleId);
  if (roleIndex === -1) {
    throw new Error('Role not found');
  }
  
  mockUserRoles[roleIndex] = {
    ...mockUserRoles[roleIndex],
    ...roleData
  };
  
  logger.info('App', `User role updated by ${updatedBy}`);
  
  return mockUserRoles[roleIndex];
}

/**
 * Delete user role
 * @param roleId - Role ID to delete
 * @param deletedBy - User ID performing the deletion
 * @returns Promise<void>
 */
export async function deleteUserRole(roleId: string, deletedBy: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const roleIndex = mockUserRoles.findIndex(role => role.id === roleId);
  if (roleIndex === -1) {
    throw new Error('Role not found');
  }
  
  const role = mockUserRoles[roleIndex];
  if (role.users_count > 0) {
    throw new Error('Cannot delete role with assigned users');
  }
  
  mockUserRoles.splice(roleIndex, 1);
  
  logger.info('App', `User role ${role.name} deleted by ${deletedBy}`);
}

/**
 * Get all integrations
 * @returns Promise<Integration[]>
 */
export async function getIntegrations(): Promise<Integration[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockIntegrations;
}

/**
 * Update integration configuration
 * @param integrationId - Integration ID
 * @param config - New configuration
 * @param updatedBy - User ID performing the update
 * @returns Promise<Integration>
 */
export async function updateIntegrationConfig(
  integrationId: string,
  config: Record<string, any>,
  updatedBy: string
): Promise<Integration> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const integrationIndex = mockIntegrations.findIndex(int => int.id === integrationId);
  if (integrationIndex === -1) {
    throw new Error('Integration not found');
  }
  
  mockIntegrations[integrationIndex] = {
    ...mockIntegrations[integrationIndex],
    config: { ...mockIntegrations[integrationIndex].config, ...config },
    status: 'active',
    last_sync: new Date().toISOString()
  };
  
  logger.info('App', `Integration ${mockIntegrations[integrationIndex].name} updated by ${updatedBy}`);
  
  return mockIntegrations[integrationIndex];
}

/**
 * Toggle integration status
 * @param integrationId - Integration ID
 * @param status - New status
 * @param updatedBy - User ID performing the update
 * @returns Promise<Integration>
 */
export async function toggleIntegrationStatus(
  integrationId: string,
  status: 'active' | 'inactive',
  updatedBy: string
): Promise<Integration> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const integrationIndex = mockIntegrations.findIndex(int => int.id === integrationId);
  if (integrationIndex === -1) {
    throw new Error('Integration not found');
  }
  
  mockIntegrations[integrationIndex].status = status;
  if (status === 'active') {
    mockIntegrations[integrationIndex].last_sync = new Date().toISOString();
  }
  
  logger.info('App', `Integration ${mockIntegrations[integrationIndex].name} ${status} by ${updatedBy}`);
  
  return mockIntegrations[integrationIndex];
}

/**
 * Test integration connection
 * @param integrationId - Integration ID
 * @returns Promise<boolean>
 */
export async function testIntegrationConnection(integrationId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection test
  
  const integration = mockIntegrations.find(int => int.id === integrationId);
  if (!integration) {
    throw new Error('Integration not found');
  }
  
  // Simulate connection test (mock success/failure)
  const success = Math.random() > 0.1; // 90% success rate
  
  if (success && integration.status !== 'error') {
    const integrationIndex = mockIntegrations.findIndex(int => int.id === integrationId);
    mockIntegrations[integrationIndex].last_sync = new Date().toISOString();
    mockIntegrations[integrationIndex].status = 'active';
  }
  
  return success;
}

/**
 * Get notification preferences
 * @returns Promise<NotificationSettings>
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockBusinessSettings.notification_settings;
}

/**
 * Update notification preferences
 * @param settings - Updated notification settings
 * @param updatedBy - User ID performing the update
 * @returns Promise<NotificationSettings>
 */
export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>,
  updatedBy: string
): Promise<NotificationSettings> {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  mockBusinessSettings.notification_settings = {
    ...mockBusinessSettings.notification_settings,
    ...settings
  };
  mockBusinessSettings.updated_at = new Date().toISOString();
  
  logger.info('App', `Notification settings updated by ${updatedBy}`);
  
  return mockBusinessSettings.notification_settings;
}

/**
 * Get available business types
 * @returns Promise<BusinessType[]>
 */
export async function getBusinessTypes(): Promise<BusinessType[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return ['restaurant', 'cafe', 'bakery', 'food_truck', 'catering', 'other'];
}

/**
 * Get available currencies
 * @returns Promise<Array<{code: string, name: string, symbol: string}>>
 */
export async function getAvailableCurrencies(): Promise<Array<{code: string, name: string, symbol: string}>> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'CAD', name: 'Dólar Canadiense', symbol: '$' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£' }
  ];
}

/**
 * Get available timezones
 * @returns Promise<Array<{value: string, label: string}>>
 */
export async function getAvailableTimezones(): Promise<Array<{value: string, label: string}>> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [
    { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    { value: 'Europe/London', label: 'Londres (GMT+0)' }
  ];
}

/**
 * Export interface for external integrations
 */
export interface SettingsApiInterface {
  // Business settings
  getBusinessSettings: typeof getBusinessSettings;
  updateBusinessSettings: typeof updateBusinessSettings;
  updateTaxConfiguration: typeof updateTaxConfiguration;
  updateOperatingHours: typeof updateOperatingHours;
  
  // System settings
  getSystemSettings: typeof getSystemSettings;
  updateSystemSettings: typeof updateSystemSettings;
  
  // User management
  getUserRoles: typeof getUserRoles;
  createUserRole: typeof createUserRole;
  updateUserRole: typeof updateUserRole;
  deleteUserRole: typeof deleteUserRole;
  
  // Integrations
  getIntegrations: typeof getIntegrations;
  updateIntegrationConfig: typeof updateIntegrationConfig;
  toggleIntegrationStatus: typeof toggleIntegrationStatus;
  testIntegrationConnection: typeof testIntegrationConnection;
  
  // Notifications
  getNotificationSettings: typeof getNotificationSettings;
  updateNotificationSettings: typeof updateNotificationSettings;
  
  // Metadata
  getBusinessTypes: typeof getBusinessTypes;
  getAvailableCurrencies: typeof getAvailableCurrencies;
  getAvailableTimezones: typeof getAvailableTimezones;
}

// Export all functions for easy importing
export {
  type UserRole,
  type Integration
};