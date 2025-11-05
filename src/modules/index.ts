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
 * import { ALL_MODULE_MANIFESTS, staffManifest } from '@/modules';
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
import { reportingManifest } from './reporting/manifest';
import { intelligenceManifest } from './intelligence/manifest';

// ============================================
// SUPPLY-CHAIN DOMAIN - Inventory & procurement
// ============================================
import { materialsManifest } from './materials/manifest';
import { suppliersManifest } from './suppliers/manifest';
import { supplierOrdersManifest } from './supplier-orders/manifest';
import { productsManifest } from './products/manifest';
import { productsAnalyticsManifest } from './products/analytics/manifest';

// ============================================
// OPERATIONS DOMAIN - Daily operations
// ============================================
import { salesManifest } from './sales/manifest';
import { fulfillmentManifest } from './fulfillment/manifest';
import { fulfillmentOnsiteManifest } from './fulfillment/onsite/manifest';
import { fulfillmentPickupManifest } from './fulfillment/pickup/manifest';
import { fulfillmentDeliveryManifest } from './fulfillment/delivery/manifest';
import { productionManifest } from './production/manifest';
// DISABLED: kitchen module is obsolete, functionality merged into production
// import { kitchenManifest } from './production/kitchen/manifest';
// DISABLED: delivery standalone module is obsolete, consolidated into fulfillment-delivery submódulo
// import { deliveryManifest } from './delivery/manifest';
import { mobileManifest } from './mobile/manifest';
import { membershipsManifest } from './memberships/manifest';
import { rentalsManifest } from './rentals/manifest';
import { assetsManifest } from './assets/manifest';


// ============================================
// RESOURCES DOMAIN - Staff & scheduling
// ============================================
import { staffManifest } from './staff/manifest';
import { schedulingManifest } from './scheduling/manifest';

// ============================================
// FINANCE DOMAIN - Financial management
// ============================================
import { fiscalManifest } from './fiscal/manifest';
import { billingManifest } from './billing/manifest';
import { financeIntegrationsManifest } from './finance-integrations/manifest';
import { financeManifest } from './finance/manifest';

// ============================================
// GAMIFICATION DOMAIN - Achievements & progress
// ============================================
import { gamificationManifest } from './gamification/manifest';

// ============================================
// EXECUTIVE DOMAIN - Strategic analytics
// ============================================
import { executiveManifest } from './executive/manifest';

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
 * 1. Foundation modules (no dependencies): dashboard, settings, debug, staff, materials, suppliers, sales, customers
 * 2. First-level dependencies: scheduling (staff), products (materials), billing (customers)
 * 3. Second-level dependencies: supplier-orders (suppliers+materials), ecommerce (sales+products)
 * 4. Third-level dependencies: memberships/rentals (customers+billing+scheduling)
 * 5. Cross-cutting: gamification, executive, reporting (aggregate all)
 */
export const ALL_MODULE_MANIFESTS = [
  // ============================================
  // TIER 0: System modules (MUST load first)
  // ============================================

  achievementsManifest,  // ✅ Requirements & validation system (auto-install)

  // ============================================
  // TIER 1: Foundation modules (no dependencies)
  // ============================================

  // Core domain - Always active
  dashboardManifest,     // ✅ Central dashboard (auto-install)
  settingsManifest,      // ✅ System configuration (auto-install)
  debugManifest,         // ✅ Debug tools (dev only)

  // Business domains - Foundation
  staffManifest,         // ✅ Staff/HR management
  materialsManifest,     // ✅ Inventory & materials
  suppliersManifest,     // ✅ Supplier management
  salesManifest,         // ✅ Sales & POS
  customersManifest,     // ✅ CRM

  // Analytics - Foundation
  reportingManifest,     // ✅ Custom reporting
  intelligenceManifest,  // ✅ Market intelligence

  // ============================================
  // TIER 2: First-level dependencies
  // ============================================

  schedulingManifest,    // ✅ Depends on: staff
  productsManifest,      // ✅ Depends on: materials
  productsAnalyticsManifest, // ✅ NEW: Products analytics sub-module (Menu Engineering, Cost Analysis)
  productionManifest,    // ✅ RENAMED from kitchen - Depends on: materials
  billingManifest,       // ✅ Depends on: customers
  fiscalManifest,        // ✅ Depends on: sales

  // ============================================
  // TIER 3: Second-level dependencies
  // ============================================

  supplierOrdersManifest,      // ✅ Depends on: suppliers + materials
  fulfillmentManifest,        // ✅ NEW: Unified fulfillment system
  fulfillmentOnsiteManifest,  // ✅ NEW: Onsite service (from floor)
  fulfillmentPickupManifest,  // ✅ NEW: Pickup orders sub-module
  fulfillmentDeliveryManifest, // ✅ NEW: Delivery orders sub-module
  mobileManifest,             // ✅ NEW Phase 2: Mobile operations (GPS, routes, inventory)
  financeManifest,            // ✅ NEW Phase 3: B2B Finance (corporate accounts, credit)
  financeIntegrationsManifest, // ✅ Depends on: fiscal + billing
  

  // ============================================
  // TIER 4: Third-level dependencies
  // ============================================

  membershipsManifest,   // ✅ Depends on: customers + billing
  rentalsManifest,       // ✅ Depends on: customers + scheduling
  assetsManifest,        // ✅ Depends on: (optional: rentals)

  // ============================================
  // TIER 5: Cross-cutting modules (aggregate data)
  // ============================================

  // DISABLED: kitchen module is obsolete
  // kitchenManifest,       // ✅ Links: sales + materials (auto-install)
  // DISABLED: delivery standalone module is obsolete, use fulfillmentDeliveryManifest instead
  // deliveryManifest,      // ❌ REMOVED - Consolidated into fulfillment-delivery submódulo
  gamificationManifest,  // ✅ Listens to: all modules (auto-install)
  executiveManifest,     // ✅ Aggregates: all modules
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
  reportingManifest,
  intelligenceManifest,

  // Supply-chain domain
  materialsManifest,
  suppliersManifest,
  productsAnalyticsManifest,
  supplierOrdersManifest,
  productsManifest,
  productionManifest,

  // Operations domain
  salesManifest,
  fulfillmentManifest,
  fulfillmentOnsiteManifest,
  fulfillmentPickupManifest,
  fulfillmentDeliveryManifest,
  mobileManifest,
  // DISABLED: kitchen module is obsolete
  // kitchenManifest,
  // DISABLED: delivery standalone module is obsolete
  // deliveryManifest,
  membershipsManifest,
  rentalsManifest,
  assetsManifest,
  

  // Resources domain
  staffManifest,
  schedulingManifest,

  // Finance domain
  fiscalManifest,
  billingManifest,
  financeManifest,
  financeIntegrationsManifest,

  // Cross-cutting domains
  gamificationManifest,
  executiveManifest,
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
  total: ALL_MODULE_MANIFESTS.length, // 31 modules (was 30, +1 finance added in Phase 3)
  byDomain: {
    system: 1,        // achievements (TIER 0)
    core: 6,          // dashboard, settings, debug, customers, reporting, intelligence
    supplyChain: 5,   // materials, suppliers, supplier-orders, products, production
    operations: 8,    // sales (includes ecommerce), fulfillment (onsite/pickup/delivery), mobile, kitchen, memberships, rentals, assets
    resources: 2,     // staff, scheduling
    finance: 4,       // fiscal, billing, finance (NEW), finance-integrations
    gamification: 1,  // gamification
    executive: 1,     // executive
  },
  autoInstall: [
    'achievements',   // ✅ PRIMERO - Requirements validation system
    'dashboard',
    'settings',
    'gamification',
    'kitchen',
  ],
} as const;
