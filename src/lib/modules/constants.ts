/**
 * MODULE CONSTANTS
 *
 * Central registry of CORE and OPTIONAL modules
 * Based on industry research (Salesforce, Odoo, WordPress, VS Code)
 *
 * @see docs/plans/2026-01-19-capabilities-architecture-simplification.md
 * @see docs/plans/2026-01-19-architecture-validation-report.md
 * @version 2.0.0 - Simplified Architecture
 * @date 2026-01-19
 */

import type { FeatureId } from '@/config/types';

// ============================================
// CORE MODULES (Always Loaded)
// ============================================

/**
 * CORE_MODULES
 *
 * Módulos que SIEMPRE están cargados (base del sistema).
 * NO necesitan `activatedBy` - se cargan automáticamente.
 *
 * VALIDATED BY INDUSTRY RESEARCH:
 * - Salesforce: Standard Objects (Contact, Account) always present
 * - HubSpot: Core objects (Contacts, Companies, Deals, Tickets) non-optional
 * - Odoo: 'base' module with auto_install: True
 * - WordPress: WordPress Core always loaded
 * - VS Code: 15 built-in extensions always loaded
 *
 * @example
 * // Module manifest for CORE module
 * {
 *   id: 'dashboard',
 *   activatedBy: undefined  // NO activatedBy for CORE
 * }
 *
 * @version 2.0.0
 */
export const CORE_MODULES = [
  // ============================================
  // UI FRAMEWORK
  // ============================================

  /**
   * dashboard - Central dashboard UI
   * Equivalente: WordPress Admin, Salesforce Lightning Home
   */
  'dashboard',

  /**
   * settings - App configuration
   * Equivalente: Salesforce Setup, HubSpot Settings
   */
  'settings',

  /**
   * debug - Developer tools
   * Equivalente: VS Code Debug Console
   */
  'debug',

  // ============================================
  // BUSINESS CORE
  // ============================================

  /**
   * customers - Customer management (CRM base)
   * Equivalente: Salesforce Contact/Account, HubSpot Contacts
   * Razón: TODO negocio tiene clientes
   */
  'customers',

  /**
   * sales - Sales/Orders management
   * Equivalente: Salesforce Opportunity, HubSpot Deals
   * Razón: TODO negocio vende algo
   */
  'sales',

  // ============================================
  // UI ENHANCEMENT
  // ============================================

  /**
   * gamification - Achievements/badges layer
   * Equivalente: WordPress notifications, Salesforce Chatter
   * Razón: UI enhancement layer (siempre presente)
   */
  'gamification',
] as const;

/**
 * Type for CORE module IDs
 */
export type CoreModuleId = typeof CORE_MODULES[number];

// ============================================
// OPTIONAL MODULES (Conditionally Loaded)
// ============================================

/**
 * OPTIONAL_MODULES
 *
 * Mapeo de módulo → feature requerida.
 * Se cargan SOLO si su feature está activa.
 *
 * VALIDATED BY INDUSTRY RESEARCH:
 * - Odoo: Modules with depends + conditional installation
 * - WordPress: Plugins loaded based on user installation
 * - VS Code: Extensions loaded on activation events
 * - Shopify: Apps installed per merchant
 *
 * @example
 * // User selects capability 'physical_products'
 * // → Activates feature 'inventory_stock_tracking'
 * // → Loads module 'materials'
 *
 * @version 2.0.0
 */
export const OPTIONAL_MODULES: Readonly<Record<string, FeatureId>> = {
  // ============================================
  // INVENTORY & SUPPLY CHAIN
  // ============================================

  'materials': 'inventory_stock_tracking',
  'products': 'products_recipe_management',
  'suppliers': 'inventory_supplier_management',

  // ============================================
  // PRODUCTION
  // ============================================

  'production': 'production_display_system',
  'production-kitchen': 'production_display_system',

  // ============================================
  // FULFILLMENT
  // ============================================

  'fulfillment': 'operations_table_management',
  'onsite': 'operations_table_management',
  'delivery': 'operations_delivery_zones',
  'pickup': 'operations_pickup_scheduling',

  // ============================================
  // STAFF & SCHEDULING
  // ============================================

  'team': 'staff_employee_management',
  'scheduling': 'scheduling_appointment_booking',
  'shift-control': 'staff_shift_management',

  // ============================================
  // FINANCE
  // ============================================

  'billing': 'finance_invoice_scheduling',
  'payment-gateways': 'finance_payment_gateway',
  'finance-corporate': 'finance_corporate_accounts',
  'accounting': 'finance_cash_session_management',

  // ============================================
  // ADVANCED BUSINESS
  // ============================================

  'memberships': 'operations_membership_management',
  'rentals': 'operations_rental_management',
  'assets': 'operations_asset_management',

  // ============================================
  // ANALYTICS & INTELLIGENCE
  // ============================================

  'intelligence': 'analytics_intelligence_dashboard',
  'reporting': 'analytics_custom_reports',
  'executive': 'analytics_executive_dashboard',
  'products-analytics': 'analytics_product_insights',

  // ============================================
  // OTHER
  // ============================================

  'achievements': 'gamification_achievements',
  'mobile': 'mobile_app_access',
} as const;

/**
 * Type for OPTIONAL module IDs
 */
export type OptionalModuleId = keyof typeof OPTIONAL_MODULES;

/**
 * Union type of all module IDs
 */
export type ModuleId = CoreModuleId | OptionalModuleId;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Check if a module ID is a CORE module
 */
export function isCoreModule(moduleId: string): moduleId is CoreModuleId {
  return (CORE_MODULES as readonly string[]).includes(moduleId);
}

/**
 * Check if a module ID is an OPTIONAL module
 */
export function isOptionalModule(moduleId: string): moduleId is OptionalModuleId {
  return moduleId in OPTIONAL_MODULES;
}

/**
 * Get the required feature for an OPTIONAL module
 * Returns undefined if module is CORE or not found
 */
export function getRequiredFeature(moduleId: string): FeatureId | undefined {
  if (isCoreModule(moduleId)) return undefined;
  return OPTIONAL_MODULES[moduleId as OptionalModuleId];
}

// ============================================
// STATISTICS
// ============================================

/**
 * Module statistics
 */
export const MODULE_STATS = {
  /** Total CORE modules (always loaded) */
  CORE_COUNT: CORE_MODULES.length,

  /** Total OPTIONAL modules (conditionally loaded) */
  OPTIONAL_COUNT: Object.keys(OPTIONAL_MODULES).length,

  /** Total modules in system */
  TOTAL_COUNT: CORE_MODULES.length + Object.keys(OPTIONAL_MODULES).length,

  /** Percentage of CORE modules */
  CORE_PERCENTAGE: Math.round((CORE_MODULES.length / (CORE_MODULES.length + Object.keys(OPTIONAL_MODULES).length)) * 100),
} as const;

// ============================================
// EXPORTS
// ============================================

export default {
  CORE_MODULES,
  OPTIONAL_MODULES,
  isCoreModule,
  isOptionalModule,
  getRequiredFeature,
  MODULE_STATS,
};
