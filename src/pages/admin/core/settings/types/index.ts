// Settings module types

// Business profile types
export type {
  BusinessSettings,
  BusinessType,
  BusinessAddress,
  BusinessContact,
  SocialMediaLinks,
  OperatingHours
} from './profile';

// Tax and financial types
export type {
  TaxSettings,
  CurrencySettings
} from './tax';

// System and notification types
export type {
  SystemSettings,
  NotificationSettings
} from './system';

// User permissions types
export type {
  UserRole,
  Permission,
  PermissionAction,
  UserPermissions
} from './permissions';

// Complete settings data type
export interface SettingsData {
  businessProfile?: Partial<BusinessSettings>;
  taxConfiguration?: Partial<TaxSettings>;
  systemPreferences?: Partial<SystemSettings>;
  userPermissions?: Partial<UserPermissions>;
}

// Re-export from sub-modules
import type { BusinessSettings } from './profile';
import type { TaxSettings } from './tax';
import type { SystemSettings } from './system';
import type { UserPermissions } from './permissions';

// Validation schemas and types
export type {
  BusinessProfileFormData,
  TaxConfigurationFormData,
  SystemPreferencesFormData,
  UserPermissionFormData,
  IntegrationConfigFormData,
  CompleteSettingsFormData
} from './validation';

export {
  BusinessProfileSchema,
  TaxConfigurationSchema,
  SystemPreferencesSchema,
  UserPermissionSchema,
  IntegrationConfigSchema,
  CompleteSettingsSchema,
  validateCUITCheckDigit,
  formatCUIT,
  validateBusinessEmail
} from './validation';