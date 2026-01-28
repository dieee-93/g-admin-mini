/**
 * MODULE MANIFESTS REGISTRY
 *
 * Central registry of ALL module manifests in the system.
 * Each module manifest defines its dependencies, features, hooks, and API exports.
 *
 * ORGANIZATION:
 * - Modules organized by business domain
 * - Foundation modules (no dependencies) first
 * - Dependent modules follow their dependencies
 * - Auto-install modules (always active) marked
 *
 * USAGE:
 * ```tsx
 * import { ALL_MODULE_MANIFESTS, teamManifest } from '@/modules';
 * import { getModuleRegistry } from '@/lib/modules';
 *
 * // Register all modules
 * const registry = getModuleRegistry();
 * ALL_MODULE_MANIFESTS.forEach(manifest => {
 *   registry.register(manifest);
 * });
 * ```
 *
 * @version 2.0.0 - Complete module system
 * @see docs/05-development/NAVIGATION_SYSTEM_GUIDE.md
 */

// ============================================
// SYSTEM DOMAIN - Core validation & achievements
// ============================================
import { achievementsManifest } from './achievements/manifest';

// ============================================
// CORE DOMAIN - Foundation modules
// ============================================
import { dashboardManifest } from './dashboard/manifest';
import { settingsManifest } from './settings/manifest';
import { debugManifest } from './debug/manifest';
import { customersManifest } from './customers/manifest';

// ============================================
// SUPPLY-CHAIN DOMAIN - Inventory & procurement
// ============================================
import { materialsManifest } from './materials/manifest';
// NOTE: Procurement deprecated - now integrated as tab in Suppliers module
import { suppliersManifest } from './suppliers/manifest';
import { productsManifest } from './products/manifest';

// DISABLED: Sub-modules not supported in simplified architecture
// import { productsAnalyticsManifest } from './products/analytics/manifest';
// import { recipeManifest } from './recipe/manifest';

import { assetsManifest } from './assets/manifest';

// ============================================
// OPERATIONS DOMAIN - Daily operations
// ============================================
import { salesManifest } from './sales/manifest';
import { onsiteManifest } from './onsite/manifest';
import { pickupManifest } from './pickup/manifest';
import { deliveryManifest } from './delivery/manifest';
import { productionManifest } from './production/manifest';
// DISABLED: kitchen module is obsolete, functionality merged into production
// import { kitchenManifest } from './production/kitchen/manifest';
// DISABLED: delivery standalone module is obsolete, consolidated into fulfillment-delivery submódulo
// import { deliveryManifest } from './delivery/manifest';
import { mobileManifest } from './mobile/manifest';
import { membershipsManifest } from './memberships/manifest';
import { rentalsManifest } from './rentals/manifest';

// ============================================
// RESOURCES DOMAIN - Team & scheduling
// ============================================
import { teamManifest } from './team/manifest';
import { schedulingManifest } from './scheduling/manifest';
import { shiftControlManifest } from './shift-control/manifest';

// ============================================
// FINANCE DOMAIN - Financial management
// ============================================
import { financeCorporateManifest } from './finance-corporate/manifest';
import { financeFiscalManifest } from './finance-fiscal/manifest';
import { financeBillingManifest } from './finance-billing/manifest';
import { paymentGatewaysManifest } from './payment-gateways/manifest';
import { accountingManifest } from './accounting/manifest';

// ============================================
// GAMIFICATION DOMAIN - Achievements & progress
// ============================================
import { loyaltyManifest } from './loyalty/manifest';

// ============================================
// ALL MODULE MANIFESTS
// ============================================

/**
 * Array of all module manifests in the system.
 * Modules will be registered in dependency order by bootstrap process.
 *
 * ✅ UPDATED: 31 modules total (Phase 3)
 * - 26 main modules (25 + finance module)
 * - 5 sub-modules (fulfillment-onsite, fulfillment-pickup, fulfillment-delivery, fulfillment-pickup, production-kitchen)
 *
 * DEPENDENCY ORDER:
 * 1. Foundation modules (no dependencies): dashboard, settings, debug, team, materials, suppliers, sales, customers
 * 2. First-level dependencies: scheduling (team), products (materials), billing (customers)
 * 3. Second-level dependencies: supplier-orders (suppliers+materials), ecommerce (sales+products)
 * 4. Third-level dependencies: memberships/rentals (customers+billing+scheduling)
 * 5. Cross-cutting: gamification, executive, reporting (aggregate all)
 */
export const ALL_MODULE_MANIFESTS = [
  // ============================================
  // TIER 0: System modules (MUST load first)
  // ============================================

  achievementsManifest,  // ✅ Requirements & validation system (auto-install)
  shiftControlManifest,  // ✅ Shift control coordination (auto-install)

  // ============================================
  // TIER 1: Foundation modules (no dependencies)
  // ============================================

  // Core domain - Always active
  dashboardManifest,     // ✅ Central dashboard (auto-install)
  settingsManifest,      // ✅ System configuration (auto-install)
  debugManifest,         // ✅ Debug tools (dev only)

  // Business domains - Foundation
  teamManifest,          // ✅ Team/HR management
  materialsManifest,     // ✅ Inventory & materials
  suppliersManifest,     // ✅ Supplier management
  salesManifest,         // ✅ Sales & POS
  customersManifest,     // ✅ CRM

  // ============================================
  // TIER 2: First-level dependencies
  // ============================================

  schedulingManifest,    // ✅ Depends on: team
  productsManifest,      // ✅ Depends on: materials
  
  // DISABLED: Sub-modules not supported in simplified architecture
  // productsAnalyticsManifest, // ❌ DISABLED: No sub-module support (depends on products which is OPTIONAL)
  // recipeManifest,        // ❌ DISABLED: No sub-module support (depends on materials + products which are OPTIONAL)
  
  productionManifest,    // ✅ RENAMED from kitchen - Depends on: materials
  assetsManifest,        // ✅ Inventory durable (equipment, tools, machinery)
  // NOTE: materialsProcurementManifest deprecated - supplier orders now integrated in suppliersManifest

  // ============================================
  // TIER 3: Finance Domain (all independent)
  // ============================================

  financeBillingManifest,        // ✅ Depends on: customers
  financeFiscalManifest,         // ✅ Depends on: sales
  financeCorporateManifest,      // ✅ Depends on: customers, finance-fiscal, finance-billing
  paymentGatewaysManifest,       // ✅ Depends on: finance-fiscal, finance-billing
  accountingManifest,        // ✅ Cash flow, sessions, double-entry accounting

  // ============================================
  // TIER 4: Second-level dependencies
  // ============================================

  onsiteManifest,  // ✅ Onsite service (tables, floor)
  pickupManifest,  // ✅ Pickup orders (take away)
  deliveryManifest, // ✅ Delivery orders (motorcycles)
  mobileManifest,             // ✅ NEW Phase 2: Mobile operations (GPS, routes, inventory)
  

  // ============================================
  // TIER 5: Third-level dependencies
  // ============================================

  membershipsManifest,   // ✅ Depends on: customers + finance-billing
  rentalsManifest,       // ✅ Depends on: customers + scheduling

  // ============================================
  // TIER 6: Cross-cutting modules (aggregate data)
  // ============================================

  // DISABLED: kitchen module is obsolete
  // kitchenManifest,       // ✅ Links: sales + materials (auto-install)
  // DISABLED: delivery standalone module is obsolete, use deliveryManifest instead
  // deliveryManifest,      // ❌ REMOVED - Consolidated into fulfillment-delivery submódulo
  loyaltyManifest,  // ✅ Listens to: all modules (auto-install)
];

// ============================================
// NAMED EXPORTS
// ============================================

export {
  // System domain
  achievementsManifest,

  // Core domain
  dashboardManifest,
  settingsManifest,
  debugManifest,
  customersManifest,

  // Supply-chain domain
  materialsManifest,
  // NOTE: materialsProcurementManifest deprecated - integrated in suppliers
  suppliersManifest,
  
  // DISABLED: Sub-modules not supported in simplified architecture
  // productsAnalyticsManifest,  // ❌ DISABLED: No sub-module support
  // recipeManifest,              // ❌ DISABLED: No sub-module support
  
  productsManifest,
  productionManifest,
  assetsManifest,

  // Operations domain
  salesManifest,
  onsiteManifest,
  pickupManifest,
  deliveryManifest,
  mobileManifest,
  // DISABLED: kitchen module is obsolete
  // kitchenManifest,
  // DISABLED: delivery standalone module is obsolete
  // deliveryManifest,
  membershipsManifest,
  rentalsManifest,

  // Resources domain
  teamManifest,
  schedulingManifest,
  shiftControlManifest,

  // Finance domain
  financeCorporateManifest,
  financeFiscalManifest,
  financeBillingManifest,
  paymentGatewaysManifest,
  accountingManifest,

  // Cross-cutting domains
  loyaltyManifest,
};

// ============================================
// TYPES
// ============================================

export type { ModuleManifest } from '@/lib/modules/types';

// ============================================
// MODULE STATISTICS
// ============================================

/**
 * Module count by domain (for debugging/monitoring)
 */
export const MODULE_STATS = {
  total: ALL_MODULE_MANIFESTS.length, // 34 modules
  byDomain: {
    system: 2,        // achievements, shift-control (TIER 0)
    core: 6,          // dashboard, settings, debug, customers, reporting, intelligence
    supplyChain: 8,   // materials, suppliers, products, products-analytics, recipe, production, assets
    operations: 8,    // sales, fulfillment, fulfillment-onsite, fulfillment-pickup, fulfillment-delivery, mobile, memberships, rentals
    resources: 2,     // team, scheduling
    finance: 5,       // finance-corporate, finance-fiscal, finance-billing, finance-integrations, cash-management
    gamification: 1,  // gamification
    executive: 1,     // executive
  },
  // Note: CORE modules loaded via CORE_MODULES array in bootstrap.ts
  // See: src/lib/modules/constants.ts
} as const;
