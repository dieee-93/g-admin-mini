/**
 * BUSINESS CAPABILITY SYSTEM - G-Admin Mini v2.1
 * Sistema de capacidades de negocio con lógica de dependencias y features flexibles
 *
 * CARACTERÍSTICAS: Lógica de dependencias, plantillas de modelos de negocio, definiciones comprehensivas
 * FLEXIBILIDAD: Features flexibles, flags opcionales/requeridos, dependencias compartidas
 */

import type { BusinessCapability } from './types/BusinessCapabilities';

// =====================================================
// BUSINESS CAPABILITY SYSTEM INTERFACES
// =====================================================

export interface BusinessFeatureConfig {
  triggers: BusinessCapability[] | 'auto' | 'always';
  required?: boolean;  // true = always on if module visible, false = optional
  level?: 'basic' | 'advanced' | 'premium';
  description?: string;
}

export interface BusinessModuleConfig {
  // FROM ORIGINAL: Dependency logic
  requires: BusinessCapability[];      // Must have ALL to show module
  provides: BusinessCapability[];      // Capabilities this module enables
  enhances?: BusinessCapability[];     // Capabilities this module improves

  // FLEXIBLE: Flexible feature activation
  features: Record<string, BusinessFeatureConfig>;

  // Metadata
  description: string;
  category: 'core' | 'business' | 'operational' | 'advanced';
}

// =====================================================
// SHARED FEATURE DEPENDENCIES (Enhanced from new system)
// =====================================================

export const BUSINESS_SHARED_DEPENDENCIES: Record<string, BusinessCapability[]> = {
  // 💳 UNIVERSAL: All businesses need payment processing
  'payment_gateway': [
    'sells_products',
    'sells_services',
    'manages_events',
    'manages_rentals',
    'manages_subscriptions'
  ],

  // 👥 UNIVERSAL: All businesses have customers
  'customer_management': [
    'sells_products',
    'sells_services',
    'manages_events',
    'manages_rentals',
    'loyalty_management',
    'is_b2b_focused'
  ],

  // 🔔 UNIVERSAL: All businesses communicate
  'notifications_system': [
    'sells_products',
    'sells_services',
    'manages_events',
    'staff_management',
    'has_online_store'
  ],

  // 📦 FLEXIBLE: Most businesses track things
  'inventory_tracking': [
    'sells_products',
    'sells_services',        // Services use supplies
    'manages_events',        // Events need materials
    'manages_rentals'        // Rentals track items
  ],

  // 📊 ADVANCED: Business intelligence
  'advanced_analytics': [
    'is_b2b_focused',
    'premium_tier',
    'sells_products',
    'sells_services'
  ],

  // 🎯 MARKETING: Customer engagement
  'marketing_tools': [
    'customer_management',
    'loyalty_management',
    'has_online_store',
    'is_b2b_focused'
  ]
};

// =====================================================
// BUSINESS MODULE CONFIGURATIONS
// =====================================================

export const BUSINESS_MODULE_CONFIGURATIONS: Record<string, BusinessModuleConfig> = {
  // 🏢 CORE MODULES
  'dashboard': {
    requires: [],  // Always available
    provides: ['dashboard_analytics'],
    description: 'Universal business control center',
    category: 'core',
    features: {
      'basic_metrics': {
        triggers: 'always',
        required: true,
        level: 'basic'
      },
      'executive_analytics': {
        triggers: ['advanced_analytics'],
        required: false,
        level: 'advanced'
      },
      'cross_module_insights': {
        triggers: ['sells_products', 'sells_services'],
        required: false,
        level: 'basic'
      },
      'predictive_analytics': {
        triggers: ['premium_tier'],
        required: false,
        level: 'premium'
      }
    }
  },

  'settings': {
    requires: [],  // Always available
    provides: ['system_settings'],
    description: 'System configuration and preferences',
    category: 'core',
    features: {
      'business_profile': {
        triggers: 'always',
        required: true,
        level: 'basic'
      },
      'user_management': {
        triggers: ['staff_management'],
        required: false,
        level: 'basic'
      },
      'integration_management': {
        triggers: ['premium_tier'],
        required: false,
        level: 'advanced'
      }
    }
  },

  'gamification': {
    requires: [],  // Always available for motivation
    provides: ['achievement_system', 'milestone_tracking'],
    description: 'Achievement and motivation system',
    category: 'core',
    features: {
      'achievement_system': {
        triggers: 'always',
        required: true,
        level: 'basic'
      },
      'team_leaderboards': {
        triggers: ['staff_management'],
        required: false,
        level: 'basic'
      },
      'customer_loyalty_points': {
        triggers: ['loyalty_management'],
        required: false,
        level: 'advanced'
      }
    }
  },

  // 💼 BUSINESS MODULES
  'sales': {
    requires: ['customer_management'],  // FROM ORIGINAL: Need customer management
    provides: ['pos_system', 'payment_gateway', 'table_management', 'qr_ordering'],
    enhances: ['sells_products_for_onsite_consumption', 'has_online_store'],
    description: 'Sales management and point of sale systems',
    category: 'business',
    features: {
      // Point of Sale Features
      'pos_system': {
        triggers: ['sells_products_for_onsite_consumption'],
        required: true,  // Required if onsite consumption
        level: 'basic'
      },
      'table_management': {
        triggers: ['sells_products_for_onsite_consumption'],
        required: false,  // Optional for restaurants
        level: 'basic'
      },

      // Online Features - FROM CORRECTED ANALYSIS
      'online_ordering': {
        triggers: [
          'has_online_store',              // E-commerce 24/7
          'sells_products_for_pickup',     // Restaurant pickup
          'sells_products_with_delivery',  // Delivery orders
          'sells_services_by_appointment'  // Service booking
        ],
        required: false,  // Optional - restaurant may not want online menu
        level: 'basic'
      },
      'digital_catalog': {
        triggers: [
          'has_online_store',
          'sells_products',
          'sells_services',
          'manages_events'
        ],
        required: false,  // Optional - addresses your concern
        level: 'basic'
      },

      // Service Features
      'appointment_scheduling': {
        triggers: ['sells_services_by_appointment'],
        required: true,
        level: 'basic'
      },
      'class_management': {
        triggers: ['sells_services_by_class'],
        required: true,
        level: 'basic'
      },

      // Advanced Features
      'payment_gateway': {
        triggers: 'auto',  // Universal
        required: true,
        level: 'basic'
      },
      'customer_analytics': {
        triggers: 'auto',
        required: false,
        level: 'advanced'
      }
    }
  },

  'materials': {
    requires: ['inventory_tracking'],  // FROM ORIGINAL: Need inventory capability
    provides: ['inventory_tracking'],
    description: 'Inventory and materials management',
    category: 'operational',
    features: {
      'inventory_tracking': {
        triggers: 'auto',  // Universal - all businesses track things
        required: true,
        level: 'basic'
      },
      'recipe_costing': {
        triggers: ['sells_products_for_onsite_consumption'],
        required: false,
        level: 'advanced'
      },
      'supply_management': {
        triggers: ['sells_services'],  // Services need supplies
        required: false,
        level: 'basic'
      },
      'rental_tracking': {
        triggers: ['manages_rentals'],
        required: true,
        level: 'basic'
      },
      'abc_analysis': {
        triggers: ['advanced_analytics'],
        required: false,
        level: 'advanced'
      }
    }
  },

  'products': {
    requires: ['inventory_tracking'],  // FROM ORIGINAL
    provides: ['product_management'],
    description: 'Product catalog and recipe management',
    category: 'business',
    features: {
      'product_management': {
        triggers: ['sells_products'],
        required: true,
        level: 'basic'
      },
      'recipe_management': {
        triggers: ['sells_products_for_onsite_consumption'],
        required: false,  // Optional for restaurants
        level: 'basic'
      },
      'menu_engineering': {
        triggers: ['sells_products_for_onsite_consumption', 'advanced_analytics'],
        required: false,
        level: 'advanced'
      },
      'digital_catalog': {
        triggers: ['has_online_store'],
        required: false,
        level: 'basic'
      }
    }
  },

  // 👥 HUMAN RESOURCES
  'staff': {
    requires: [],  // FROM ORIGINAL: No requirements
    provides: ['staff_management'],
    description: 'Human resources and employee management',
    category: 'operational',
    features: {
      'employee_management': {
        triggers: ['staff_management'],
        required: true,
        level: 'basic'
      },
      'performance_tracking': {
        triggers: ['staff_management'],
        required: false,
        level: 'advanced'
      },
      'payroll_integration': {
        triggers: ['payroll_basic'],
        required: false,
        level: 'advanced'
      }
    }
  },

  'scheduling': {
    requires: ['staff_management'],  // FROM ORIGINAL
    provides: ['staff_scheduling', 'schedule_management', 'approve_timeoff', 'view_labor_costs'],
    enhances: ['sells_services_by_appointment'],
    description: 'Staff scheduling and appointment management',
    category: 'operational',
    features: {
      'staff_scheduling': {
        triggers: ['staff_management'],
        required: true,
        level: 'basic'
      },
      'appointment_booking': {
        triggers: ['sells_services_by_appointment'],
        required: true,
        level: 'basic'
      },
      'schedule_management': {
        triggers: ['staff_management', 'sells_services_by_appointment'],
        required: true,
        level: 'basic'
      },
      'approve_timeoff': {
        triggers: ['staff_management'],
        required: false,  // Optional HR feature
        level: 'basic'
      },
      'view_labor_costs': {
        triggers: ['staff_management'],
        required: false,  // Optional analytics
        level: 'advanced'
      },
      'calendar_integration': {
        triggers: 'auto',
        required: false,
        level: 'basic'
      }
    }
  },

  // 🔧 SPECIALIZED MODULES
  'customers': {
    requires: [],  // FROM ORIGINAL: No strict requirements
    provides: ['customer_management'],
    description: 'Customer relationship management',
    category: 'business',
    features: {
      'customer_profiles': {
        triggers: 'auto',  // Universal
        required: true,
        level: 'basic'
      },
      'customer_analytics': {
        triggers: ['advanced_analytics'],
        required: false,
        level: 'advanced'
      },
      'loyalty_programs': {
        triggers: ['loyalty_management'],
        required: false,
        level: 'advanced'
      },
      'b2b_features': {
        triggers: ['is_b2b_focused'],
        required: false,
        level: 'advanced'
      }
    }
  },

  'fiscal': {
    requires: [],  // FROM ORIGINAL: Essential for all businesses
    provides: ['fiscal_compliance'],
    description: 'Financial management and fiscal compliance',
    category: 'business',
    features: {
      'invoice_generation': {
        triggers: 'auto',  // Universal - all businesses invoice
        required: true,
        level: 'basic'
      },
      'tax_management': {
        triggers: ['fiscal_compliance'],
        required: false,
        level: 'advanced'
      },
      'financial_reports': {
        triggers: ['advanced_analytics'],
        required: false,
        level: 'advanced'
      }
    }
  },

  'executive': {
    requires: ['advanced_analytics'],  // FROM ORIGINAL: Need analytics
    provides: ['executive_access'],
    description: 'Executive business intelligence and strategic planning',
    category: 'advanced',
    features: {
      'executive_dashboard': {
        triggers: ['advanced_analytics'],
        required: true,
        level: 'advanced'
      },
      'strategic_planning': {
        triggers: ['premium_tier'],
        required: false,
        level: 'premium'
      }
    }
  },

  // NOTE: Operations module intentionally restructured - see design doc
  'operations': {
    requires: ['sells_products_for_onsite_consumption'],  // FROM ORIGINAL: Only for complex operations
    provides: ['table_management'],
    enhances: ['sells_products_for_onsite_consumption'],
    description: 'Restaurant and food service operations',  // Narrowed scope
    category: 'operational',
    features: {
      'kitchen_management': {
        triggers: ['sells_products_for_onsite_consumption'],
        required: true,
        level: 'basic'
      },
      'table_service': {
        triggers: ['sells_products_for_onsite_consumption'],
        required: false,  // Optional for restaurants
        level: 'basic'
      },
      'food_safety_compliance': {
        triggers: ['sells_products_for_onsite_consumption'],
        required: false,
        level: 'advanced'
      }
    }
  }
};

// =====================================================
// BUSINESS CAPABILITY SYSTEM FUNCTIONS
// =====================================================

/**
 * Resolve auto capabilities based on shared dependencies
 * ENHANCED from new system with original capability completeness
 */
export function resolveBusinessCapabilities(
  baseCapabilities: BusinessCapability[]
): BusinessCapability[] {
  const resolvedCapabilities: BusinessCapability[] = [];

  Object.entries(BUSINESS_SHARED_DEPENDENCIES).forEach(([featureName, triggers]) => {
    const shouldActivate = triggers.some(trigger =>
      baseCapabilities.includes(trigger)
    );

    if (shouldActivate) {
      resolvedCapabilities.push(featureName as BusinessCapability);
    }
  });

  return [...new Set([...baseCapabilities, ...resolvedCapabilities])];
}

/**
 * Check if module should be visible using ORIGINAL dependency logic
 * ENHANCED with resolved capabilities
 */
export function shouldShowBusinessModule(
  moduleId: string,
  baseCapabilities: BusinessCapability[]
): boolean {
  const config = BUSINESS_MODULE_CONFIGURATIONS[moduleId];
  if (!config) return false;

  const resolvedCapabilities = resolveBusinessCapabilities(baseCapabilities);

  // Use original logic: ALL requirements must be met
  return config.requires.every(requirement =>
    resolvedCapabilities.includes(requirement)
  );
}

/**
 * Get available features for module using NEW flexible system
 * ENHANCED with required/optional logic
 */
export function getBusinessModuleFeatures(
  moduleId: string,
  baseCapabilities: BusinessCapability[]
): {
  required: string[];
  optional: string[];
  unavailable: string[];
} {
  const config = BUSINESS_MODULE_CONFIGURATIONS[moduleId];
  if (!config) return { required: [], optional: [], unavailable: [] };

  const resolvedCapabilities = resolveBusinessCapabilities(baseCapabilities);

  const required: string[] = [];
  const optional: string[] = [];
  const unavailable: string[] = [];

  Object.entries(config.features).forEach(([featureName, featureConfig]) => {
    let isAvailable = false;

    // Check feature availability
    if (featureConfig.triggers === 'always') {
      isAvailable = true;
    } else if (featureConfig.triggers === 'auto') {
      // Check if feature is in shared dependencies
      const sharedDep = BUSINESS_SHARED_DEPENDENCIES[featureName];
      isAvailable = sharedDep ?
        sharedDep.some(trigger => resolvedCapabilities.includes(trigger)) :
        true; // Default to available for auto
    } else if (Array.isArray(featureConfig.triggers)) {
      isAvailable = featureConfig.triggers.some(trigger =>
        resolvedCapabilities.includes(trigger)
      );
    }

    // Categorize based on availability and requirement level
    if (isAvailable) {
      if (featureConfig.required) {
        required.push(featureName);
      } else {
        optional.push(featureName);
      }
    } else {
      unavailable.push(featureName);
    }
  });

  return { required, optional, unavailable };
}

/**
 * Get business model capabilities using ORIGINAL comprehensive definitions
 * ENHANCED with business module validation
 */
export function getBusinessModelCapabilities(
  businessModel: string
): {
  capabilities: BusinessCapability[];
  modules: string[];
  features: Record<string, string[]>;
} {
  // Use original business model definitions from BusinessCapabilities.ts
  // This will be imported and integrated once we clean up the old system

  return {
    capabilities: [],  // Will be populated with original data
    modules: [],       // Will be calculated with business capability logic
    features: {}       // Will be generated with business feature system
  };
}