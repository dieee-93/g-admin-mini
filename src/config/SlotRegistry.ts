/**
 * SLOT REGISTRY v1.0
 * Maps features to dynamic slot content
 * Based on Atomic Capabilities v2.0
 */

import type { FeatureId } from './types';

export interface SlotDefinition {
  id: string;
  name: string;
  component: string; // Component name (for dashboard widgets) or full path (for other slots)
  priority: number; // Higher = rendered first
  requiredFeatures: FeatureId[] | 'any' | 'core';
  featureMode: 'any' | 'all'; // 'any' = OR, 'all' = AND
  targetSlots: string[]; // Which slot IDs to inject into
  category?: 'widget' | 'action' | 'section' | 'integration';
  metadata?: Record<string, any>;
}

/**
 * SLOT REGISTRY - All available dynamic slots
 */
export const SLOT_REGISTRY: Record<string, SlotDefinition> = {
  // ==========================================
  // DASHBOARD WIDGETS
  // ==========================================

  'dashboard-sales-widget': {
    id: 'dashboard-sales-widget',
    name: 'Sales Overview Widget',
    component: 'SalesWidget', // ✅ Changed: Only component name (loaded via ComponentLoader)
    priority: 100,
    requiredFeatures: ['sales_order_management'],
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  'dashboard-inventory-widget': {
    id: 'dashboard-inventory-widget',
    name: 'Inventory Alerts Widget',
    component: 'InventoryWidget', // ✅ Changed: Only component name (loaded via ComponentLoader)
    priority: 90,
    requiredFeatures: ['inventory_stock_tracking'],
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  'dashboard-production-widget': {
    id: 'dashboard-production-widget',
    name: 'Production Status Widget',
    component: 'ProductionWidget', // ✅ Changed: Only component name (loaded via ComponentLoader)
    priority: 80,
    requiredFeatures: ['production_kitchen_display', 'production_recipe_management'],
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  'dashboard-scheduling-widget': {
    id: 'dashboard-scheduling-widget',
    name: 'Staff Schedule Widget',
    component: 'SchedulingWidget',
    priority: 70,
    requiredFeatures: ['staff_shift_management'], // ✅ FIXED: Correct feature name
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  'dashboard-customers-widget': {
    id: 'dashboard-customers-widget',
    name: 'Customers Overview Widget',
    component: 'CustomersWidget',
    priority: 85,
    requiredFeatures: ['customer_service_history', 'customer_preference_tracking'], // ✅ FIXED: Correct CUSTOMER domain features
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  'dashboard-staff-widget': {
    id: 'dashboard-staff-widget',
    name: 'Staff Performance Widget',
    component: 'StaffWidget',
    priority: 75,
    requiredFeatures: ['staff_employee_management', 'staff_performance_tracking'], // ✅ FIXED: Correct STAFF domain features
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  'dashboard-revenue-widget': {
    id: 'dashboard-revenue-widget',
    name: 'Revenue Analysis Widget',
    component: 'RevenueWidget',
    priority: 95,
    requiredFeatures: ['sales_order_management'], // ✅ FIXED: Removed non-existent analytics feature
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  'dashboard-products-widget': {
    id: 'dashboard-products-widget',
    name: 'Top Products Widget',
    component: 'ProductsWidget',
    priority: 82,
    requiredFeatures: ['sales_catalog_menu', 'production_recipe_management'],
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  'dashboard-tables-widget': {
    id: 'dashboard-tables-widget',
    name: 'Tables Status Widget',
    component: 'TablesWidget',
    priority: 88,
    requiredFeatures: ['operations_table_management', 'sales_dine_in_orders'],
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  'dashboard-trends-widget': {
    id: 'dashboard-trends-widget',
    name: 'Business Trends Widget',
    component: 'TrendsWidget',
    priority: 65,
    requiredFeatures: ['inventory_demand_forecasting', 'analytics_conversion_tracking'], // ✅ FIXED: Correct existing features
    featureMode: 'any',
    targetSlots: ['dashboard-widgets'],
    category: 'widget'
  },

  // ==========================================
  // MODULE ACTIONS
  // ==========================================

  'sales-quick-actions': {
    id: 'sales-quick-actions',
    name: 'POS Quick Actions',
    component: '@/pages/admin/operations/sales/components/QuickActionsToolbar',
    priority: 100,
    requiredFeatures: ['sales_pos_onsite', 'sales_pos_mobile'],
    featureMode: 'any',
    targetSlots: ['sales-toolbar'],
    category: 'action'
  },

  'inventory-procurement-actions': {
    id: 'inventory-procurement-actions',
    name: 'Procurement Quick Actions',
    component: '@/pages/admin/supply-chain/materials/components/ProcurementActions',
    priority: 80,
    requiredFeatures: ['inventory_purchase_orders'],
    featureMode: 'any',
    targetSlots: ['materials-toolbar'],
    category: 'action'
  },

  // ==========================================
  // ANALYTICS INTEGRATIONS
  // ==========================================

  'analytics-rfm-section': {
    id: 'analytics-rfm-section',
    name: 'RFM Analysis Section',
    component: '@/pages/admin/core/intelligence/components/RFMAnalysis',
    priority: 90,
    requiredFeatures: ['analytics_customer_insights', 'crm_customer_segmentation'],
    featureMode: 'all',
    targetSlots: ['intelligence-sections'],
    category: 'section'
  },

  'analytics-sales-forecasting': {
    id: 'analytics-sales-forecasting',
    name: 'Sales Forecasting',
    component: '@/pages/admin/core/intelligence/components/SalesForecasting',
    priority: 85,
    requiredFeatures: ['analytics_sales_forecasting'],
    featureMode: 'any',
    targetSlots: ['intelligence-sections'],
    category: 'section'
  },

  // ==========================================
  // MOBILE INTEGRATIONS
  // ==========================================

  'mobile-qr-ordering': {
    id: 'mobile-qr-ordering',
    name: 'QR Code Ordering',
    component: '@/pages/admin/operations/sales/components/QROrderingIntegration',
    priority: 70,
    requiredFeatures: ['mobile_qr_ordering'],
    featureMode: 'any',
    targetSlots: ['sales-integrations'],
    category: 'integration'
  },

  'mobile-delivery-tracking': {
    id: 'mobile-delivery-tracking',
    name: 'Delivery Tracking Widget',
    component: '@/pages/admin/operations/delivery/components/TrackingWidget',
    priority: 75,
    requiredFeatures: ['mobile_delivery_tracking'],
    featureMode: 'any',
    targetSlots: ['operations-widgets'],
    category: 'widget'
  },

  // ==========================================
  // FINANCE INTEGRATIONS
  // ==========================================

  'finance-afip-integration': {
    id: 'finance-afip-integration',
    name: 'AFIP Integration Panel',
    component: '@/pages/admin/finance/components/AFIPIntegration',
    priority: 100,
    requiredFeatures: ['finance_invoicing_afip'],
    featureMode: 'any',
    targetSlots: ['finance-integrations'],
    category: 'integration'
  },

  // ==========================================
  // MULTISITE FEATURES
  // ==========================================

  'multisite-location-switcher': {
    id: 'multisite-location-switcher',
    name: 'Location Switcher',
    component: '@/shared/navigation/LocationSwitcher',
    priority: 200,
    requiredFeatures: ['multisite_location_management'],
    featureMode: 'any',
    targetSlots: ['navbar-actions'],
    category: 'action'
  },

  'multisite-central-dashboard': {
    id: 'multisite-central-dashboard',
    name: 'Central Dashboard View',
    component: '@/pages/admin/core/dashboard/components/MultisiteDashboard',
    priority: 150,
    requiredFeatures: ['multisite_central_dashboard'],
    featureMode: 'any',
    targetSlots: ['dashboard-main'],
    category: 'section'
  }
};

/**
 * Get slot definitions for active features
 */
export function getSlotDefinitionsForFeatures(
  features: FeatureId[]
): SlotDefinition[] {
  return Object.values(SLOT_REGISTRY).filter(slot => {
    // Core slots always visible
    if (slot.requiredFeatures === 'core') return true;

    // 'any' means no feature required
    if (slot.requiredFeatures === 'any') return true;

    // Check feature requirements
    const requiredFeatures = slot.requiredFeatures as FeatureId[];

    if (slot.featureMode === 'all') {
      // ALL features required (AND)
      return requiredFeatures.every(f => features.includes(f));
    } else {
      // ANY feature required (OR)
      return requiredFeatures.some(f => features.includes(f));
    }
  });
}
